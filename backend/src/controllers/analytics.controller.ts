import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const recordVisit = async (req: Request, res: Response) => {
    try {
        const { landingPageId, projectId } = req.body;
        const visitorIp = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        if (!landingPageId && !projectId) {
            res.status(400).json({ error: "Missing landingPageId or projectId" });
            return;
        }

        await prisma.pageVisit.create({
            data: {
                landingPageId,
                projectId,
                visitorIp: typeof visitorIp === 'string' ? visitorIp : undefined,
                userAgent
            }
        });

        // Also increment the aggregate counters for quick access
        if (projectId) {
            await prisma.project.update({
                where: { id: projectId },
                data: { visits: { increment: 1 } }
            });
        }

        if (landingPageId) {
            await prisma.landingPage.update({
                where: { id: landingPageId },
                data: { visits: { increment: 1 } }
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error recording visit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAdvertiserPerformance = async (req: Request | any, res: Response) => {
    try {
        const advertiserId = req.user.id;
        const { startDate, endDate } = req.query;

        const start = startDate ? startOfDay(new Date(startDate as string)) : new Date(0);
        const end = endDate ? endOfDay(new Date(endDate as string)) : new Date();

        // 1. Get all projects for this advertiser
        const projects = await prisma.project.findMany({
            where: { advertiserId },
            select: { id: true, name: true }
        });

        const projectIds = projects.map(p => p.id);

        if (projectIds.length === 0) {
            res.json({ data: [] });
            return;
        }

        // 2. Aggregate visits by Landing Page for these projects
        // We want to see: For Project A, on Landing Page X, how many visits?
        const stats = await prisma.pageVisit.groupBy({
            by: ['landingPageId', 'projectId'],
            where: {
                projectId: { in: projectIds },
                createdAt: {
                    gte: start,
                    lte: end
                },
                landingPageId: { not: null } // Only count visits associated with a LP
            },
            _count: {
                _all: true
            }
        });

        // 3. Enrich the data with names
        const enrichedStats = await Promise.all(stats.map(async (stat) => {
            if (!stat.landingPageId || !stat.projectId) return null;

            const landingPage = await prisma.landingPage.findUnique({
                where: { id: stat.landingPageId },
                select: { name: true, slug: true }
            });

            const project = projects.find(p => p.id === stat.projectId);

            return {
                landingPage,
                project,
                visits: stat._count._all
            };
        }));

        res.json({
            data: enrichedStats.filter(s => s !== null)
        });

    } catch (error) {
        console.error("Error fetching performance stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAdminPerformance = async (req: Request | any, res: Response) => {
    try {
        const { startDate, endDate, advertiserId, type } = req.query;

        const start = startDate ? startOfDay(new Date(startDate as string)) : new Date(0);
        const end = endDate ? endOfDay(new Date(endDate as string)) : new Date();

        // 1. Get projects filter
        const whereClause: any = {};
        if (advertiserId) {
            whereClause.advertiserId = advertiserId;
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
            select: { id: true, name: true, advertiser: { select: { companyName: true, email: true } } }
        });

        const projectIds = projects.map(p => p.id);

        if (projectIds.length === 0) {
            res.json({ data: [] });
            return;
        }

        // 2. Aggregate visits
        const visitWhere: any = {
            projectId: { in: projectIds },
            createdAt: {
                gte: start,
                lte: end
            }
        };

        if (type === 'landing-page') {
            visitWhere.landingPageId = { not: null };
        } else if (type === 'project-page') {
            visitWhere.landingPageId = null;
        }
        // If type is empty/all, we fetch both

        const stats = await prisma.pageVisit.groupBy({
            by: ['landingPageId', 'projectId'],
            where: visitWhere,
            _count: {
                _all: true
            }
        });

        // 3. Enrich data
        const enrichedStats = await Promise.all(stats.map(async (stat) => {
            if (!stat.landingPageId || !stat.projectId) return null;

            const landingPage = await prisma.landingPage.findUnique({
                where: { id: stat.landingPageId },
                select: { name: true, slug: true }
            });

            const project = projects.find(p => p.id === stat.projectId);

            return {
                landingPage,
                project: {
                    name: project?.name,
                    advertiser: project?.advertiser
                },
                visits: stat._count._all
            };
        }));

        res.json({
            data: enrichedStats.filter(s => s !== null)
        });

    } catch (error) {
        console.error("Error fetching admin performance stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
