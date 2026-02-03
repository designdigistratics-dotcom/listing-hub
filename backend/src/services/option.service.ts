import prisma from '../utils/prisma';
import { OptionType, OptionCreateRequest, OptionUpdateRequest, AdminRole } from '../types';
import { logAudit } from './audit.service';

// ==================== Options Management ====================

export const getOptions = async (
    optionType: OptionType,
    includeInactive = false,
    parentId?: string
) => {
    const where: any = { optionType };

    if (!includeInactive) {
        where.isActive = true;
    }

    if (parentId !== undefined) {
        where.parentId = parentId;
    }

    return prisma.option.findMany({
        where,
        orderBy: { name: 'asc' },
    });
};

export const getAllOptions = async () => {
    const [amenities, unitTypes, cities, propertyTypes, possessionStatuses] =
        await Promise.all([
            prisma.option.findMany({
                where: { optionType: OptionType.AMENITY, isActive: true },
                orderBy: { name: 'asc' },
            }),
            prisma.option.findMany({
                where: { optionType: OptionType.UNIT_TYPE, isActive: true },
                orderBy: { name: 'asc' },
            }),
            prisma.option.findMany({
                where: { optionType: OptionType.CITY, isActive: true },
                orderBy: { name: 'asc' },
            }),
            prisma.option.findMany({
                where: { optionType: OptionType.PROPERTY_TYPE, isActive: true },
                orderBy: { name: 'asc' },
            }),
            prisma.option.findMany({
                where: { optionType: OptionType.POSSESSION_STATUS, isActive: true },
                orderBy: { name: 'asc' },
            }),
        ]);

    // Get locations for each city
    const cityIds = cities.map((c) => c.id);
    const locations = await prisma.option.findMany({
        where: {
            optionType: OptionType.LOCATION,
            parentId: { in: cityIds },
            isActive: true,
        },
        orderBy: { name: 'asc' },
    });

    // Group locations by city
    const locationsByCity: Record<string, typeof locations> = {};
    locations.forEach((loc) => {
        if (loc.parentId) {
            if (!locationsByCity[loc.parentId]) {
                locationsByCity[loc.parentId] = [];
            }
            locationsByCity[loc.parentId].push(loc);
        }
    });

    return {
        amenities,
        unitTypes,
        cities: cities.map((city) => ({
            ...city,
            locations: locationsByCity[city.id] || [],
        })),
        propertyTypes,
        possessionStatuses,
    };
};

export const createOption = async (
    data: OptionCreateRequest,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    console.log('DEBUG SERVICE: createOption called with', data);
    // Check for duplicates
    const existing = await prisma.option.findFirst({
        where: {
            optionType: data.optionType,
            name: data.name,
            parentId: data.parentId || null,
        },
    });

    if (existing) {
        throw new Error('Option already exists');
    }

    // Validate parent for locations
    if (data.optionType === OptionType.LOCATION) {
        if (!data.parentId) {
            throw new Error('Location requires a parent city');
        }

        const parentCity = await prisma.option.findFirst({
            where: {
                id: data.parentId,
                optionType: OptionType.CITY,
            },
        });

        if (!parentCity) {
            throw new Error('Parent city not found');
        }
    }

    const option = await prisma.option.create({
        data: {
            optionType: data.optionType,
            name: data.name,
            parentId: data.parentId,
            isActive: data.isActive ?? true,
        },
    });

    await logAudit('option_created', currentUserId, currentUserRole, {
        optionId: option.id,
        optionType: option.optionType,
        name: option.name,
    });

    return option;
};

export const updateOption = async (
    id: string,
    data: OptionUpdateRequest,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    const existing = await prisma.option.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error('Option not found');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const option = await prisma.option.update({
        where: { id },
        data: updateData,
    });

    await logAudit('option_updated', currentUserId, currentUserRole, {
        optionId: id,
        updatedFields: Object.keys(updateData),
    });

    return option;
};

export const deleteOption = async (
    id: string,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    const existing = await prisma.option.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error('Option not found');
    }

    // If it's a city, check for child locations
    if (existing.optionType === OptionType.CITY) {
        const childLocations = await prisma.option.count({
            where: {
                optionType: OptionType.LOCATION,
                parentId: id,
            },
        });

        if (childLocations > 0) {
            throw new Error('Cannot delete city with existing locations');
        }
    }

    await prisma.option.delete({
        where: { id },
    });

    await logAudit('option_deleted', currentUserId, currentUserRole, {
        optionId: id,
        optionType: existing.optionType,
        name: existing.name,
    });

    return { message: 'Option deleted' };
};
