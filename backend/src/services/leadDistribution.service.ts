import prisma from '../utils/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export interface DistributionResult {
    success: boolean;
    advertiserId?: string;
    reason?: string;
}

export const distributeLead = async (leadId: string): Promise<DistributionResult> => {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                landingPage: {
                    include: {
                        slots: {
                            include: {
                                project: {
                                    include: {
                                        advertiser: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!lead) return { success: false, reason: 'Lead not found' };
        if (!lead.landingPageId || !lead.landingPage) return { success: false, reason: 'Lead not associated with a Landing Page' };

        // LEVEL 1: Landing Page Eligibility
        const eligibleAdvertisers = (lead.landingPage as any).slots
            .map((slot: any) => slot.project.advertiser)
            .filter((adv: any) => adv.isActive);

        if (eligibleAdvertisers.length === 0) {
            return { success: false, reason: 'No active advertisers on this Landing Page' };
        }

        // LEVEL 2: Advertiser-Level Filter
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const filteredAdvertisers = await Promise.all(eligibleAdvertisers.map(async (adv: any) => {
            // Check Daily Limit
            const leadsToday = await prisma.lead.count({
                where: {
                    assignedToId: adv.id,
                    createdAt: { gte: todayStart, lte: todayEnd }
                }
            });

            if (adv.maxLeadsPerDay > 0 && leadsToday >= adv.maxLeadsPerDay) return null;

            // Match Filters
            if (adv.leadFilters) {
                const filters = adv.leadFilters as any;

                // Location Match
                if (filters.location && lead.location && !filters.location.includes(lead.location)) return null;

                // Budget Range Match
                if (filters.budgetRange && lead.budget) {
                    const leadBudget = parseFloat(lead.budget);
                    if (filters.budgetRange.min && leadBudget < filters.budgetRange.min) return null;
                    if (filters.budgetRange.max && leadBudget > filters.budgetRange.max) return null;
                }

                // Types Match (ProjectType, UnitType, PropertyType)
                if (filters.projectType && lead.projectType && !filters.projectType.includes(lead.projectType)) return null;
                if (filters.unitType && lead.unitType && !filters.unitType.includes(lead.unitType)) return null;
                if (filters.propertyType && lead.propertyType && !filters.propertyType.includes(lead.propertyType)) return null;
            }

            return adv;
        }));

        const qualifiedAdvertisers = filteredAdvertisers.filter(adv => adv !== null) as any[];

        if (qualifiedAdvertisers.length === 0) {
            return { success: false, reason: 'No advertisers matched lead filters' };
        }

        // LEVEL 3: Fair Distribution (Round-Robin with Priority)
        // Rule: Sort by priority desc, then by lastLeadReceivedAt asc
        qualifiedAdvertisers.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            const timeA = a.lastLeadReceivedAt ? new Date(a.lastLeadReceivedAt).getTime() : 0;
            const timeB = b.lastLeadReceivedAt ? new Date(b.lastLeadReceivedAt).getTime() : 0;
            return timeA - timeB;
        });

        const selectedAdvertiser = qualifiedAdvertisers[0];

        // LEVEL 4: Assignment
        await prisma.$transaction([
            prisma.lead.update({
                where: { id: leadId },
                data: {
                    status: 'assigned',
                    assignedToId: selectedAdvertiser.id
                }
            }),
            prisma.user.update({
                where: { id: selectedAdvertiser.id },
                data: {
                    lastLeadReceivedAt: new Date(),
                    leadsReceivedToday: { increment: 1 }
                }
            })
        ]);

        return { success: true, advertiserId: selectedAdvertiser.id };

    } catch (error) {
        console.error('Error in lead distribution:', error);
        return { success: false, reason: 'Internal error' };
    }
};
