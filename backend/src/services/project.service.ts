import prisma from '../utils/prisma';
import {
    AdminRole,
    ProjectStatus,
    ProjectCreateRequest,
    AdminProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectReviewActionRequest,
    PackageState,
} from '../types';
import { logAudit } from './audit.service';
import { activatePackage } from './package.service';

// ==================== Advertiser Project Operations ====================

export const getAdvertiserProjects = async (advertiserId: string) => {
    const projects = await prisma.project.findMany({
        where: { advertiserId },
        include: {
            package: {
                include: {
                    packageDefinition: true,
                },
            },
            placements: {
                include: {
                    landingPage: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            _count: {
                select: { leads: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Add expiry date, lead count, and simplify landing page info
    return projects.map(project => ({
        ...project,
        expiryDate: project.package?.endDate || null,
        leadCount: project._count.leads,
        landingPages: project.placements.map(p => p.landingPage),
    }));
};

export const getProjectById = async (projectId: string, advertiserId?: string) => {
    const where: any = { id: projectId };
    if (advertiserId) {
        where.advertiserId = advertiserId;
    }

    const project = await prisma.project.findFirst({
        where,
        include: {
            advertiser: {
                select: {
                    id: true,
                    email: true,
                    companyName: true,
                    phone: true,
                },
            },
            package: {
                include: {
                    packageDefinition: true,
                },
            },
            placements: {
                include: {
                    landingPage: true,
                },
            },
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    return project;
};

export const createProject = async (
    advertiserId: string,
    data: ProjectCreateRequest
) => {
    // Verify package belongs to advertiser and is available
    const pkg = await prisma.packagePurchase.findFirst({
        where: {
            id: data.packageId,
            advertiserId,
            state: { in: [PackageState.UNSTARTED, PackageState.ACTIVE] },
        },
        include: {
            projects: true,
        },
    });

    if (!pkg) {
        throw new Error('Package not found or not available');
    }

    // Check if package already has a project
    // if (pkg.projects.length > 0) {
    //     throw new Error('This package already has a project assigned');
    // }

    const project = await prisma.project.create({
        data: {
            advertiserId,
            packageId: data.packageId,
            name: data.name,
            builderName: data.builderName,
            city: data.city,
            locality: data.locality,
            propertyType: data.propertyType as any,
            unitTypes: data.unitTypes,
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
            highlights: data.highlights,
            amenities: data.amenities,
            images: data.images,
            possessionStatus: data.possessionStatus,
            reraId: data.reraId,
            address: data.address,
            price: data.price,
            priceDetails: data.priceDetails,
            heroImage: data.heroImage,
            projectLogo: data.projectLogo,
            advertiserLogo: data.advertiserLogo,
            floorPlans: data.floorPlans || [],
            videoUrl: data.videoUrl,
            builderDescription: data.builderDescription,
            aboutProject: data.aboutProject,
            disclaimer: data.disclaimer,
            locationHighlights: data.locationHighlights || [],
            status: ProjectStatus.SUBMITTED_FOR_REVIEW,
            featuredImage: data.heroImage || (data.images && data.images.length > 0 ? data.images[0] : undefined),
        },
    });

    return project;
};

export const updateProject = async (
    projectId: string,
    data: ProjectUpdateRequest,
    advertiserId?: string
) => {
    const where: any = { id: projectId };
    if (advertiserId) {
        where.advertiserId = advertiserId;
    }

    const project = await prisma.project.findFirst({
        where,
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Advertisers can only edit draft or needs_changes projects
    if (advertiserId && !['DRAFT', 'NEEDS_CHANGES'].includes(project.status)) {
        throw new Error('Cannot edit project in current status');
    }

    const updateData: any = {};
    const fields = [
        'name', 'builderName', 'city', 'locality', 'propertyType', 'unitTypes',
        'budgetMin', 'budgetMax', 'highlights', 'amenities', 'images', 'possessionStatus',
        'reraId', 'slug', 'seoTitle', 'seoDescription', 'featuredImage', 'isVisible',
        'floorPlans', 'videoUrl', 'builderDescription', 'aboutProject', 'address',
        'price', 'priceDetails', 'heroImage', 'projectLogo', 'advertiserLogo',
        'disclaimer', 'locationHighlights',
    ];

    fields.forEach((field) => {
        if ((data as any)[field] !== undefined) {
            updateData[field] = (data as any)[field];
        }
    });

    // Handle slug uniqueness
    if (updateData.slug) {
        const existingWithSlug = await prisma.project.findFirst({
            where: {
                slug: updateData.slug,
                id: { not: projectId }, // Exclude current project
            },
        });

        if (existingWithSlug) {
            // Generate unique slug by appending incremental numbers
            let counter = 1;
            let uniqueSlug = `${updateData.slug}-${counter}`;

            while (await prisma.project.findFirst({ where: { slug: uniqueSlug, id: { not: projectId } } })) {
                counter++;
                uniqueSlug = `${updateData.slug}-${counter}`;
            }

            updateData.slug = uniqueSlug;
        }
    }

    return prisma.project.update({
        where: { id: projectId },
        data: updateData,
    });
};

export const submitProject = async (projectId: string, advertiserId: string) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            advertiserId,
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (!['DRAFT', 'NEEDS_CHANGES'].includes(project.status)) {
        throw new Error('Cannot submit project in current status');
    }

    return prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.SUBMITTED_FOR_REVIEW },
    });
};

// ==================== Admin Project Operations ====================

export const getProjectsForReview = async () => {
    return prisma.project.findMany({
        where: { status: ProjectStatus.SUBMITTED_FOR_REVIEW },
        include: {
            advertiser: {
                select: {
                    id: true,
                    email: true,
                    companyName: true,
                    phone: true,
                },
            },
            package: {
                include: {
                    packageDefinition: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
};

export const reviewProject = async (
    projectId: string,
    data: ProjectReviewActionRequest,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            package: true,
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    if (project.status !== ProjectStatus.SUBMITTED_FOR_REVIEW) {
        throw new Error('Project is not pending review');
    }

    let newStatus: ProjectStatus;

    switch (data.action) {
        case 'approve':
            newStatus = ProjectStatus.APPROVED_AWAITING_PLACEMENT;

            // Activate the package if not already active
            if (project.package.state === PackageState.UNSTARTED) {
                await activatePackage(project.packageId);
            }
            break;

        case 'request_changes':
            newStatus = ProjectStatus.NEEDS_CHANGES;
            break;

        case 'reject':
            newStatus = ProjectStatus.REJECTED;
            break;

        default:
            throw new Error('Invalid action');
    }

    const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
            status: newStatus,
            reviewComment: data.comment,
        },
    });

    await logAudit('project_reviewed', currentUserId, currentUserRole, {
        projectId,
        action: data.action,
        newStatus,
        comment: data.comment,
    });

    return updated;
};

export const getAllProjects = async (params: {
    status?: ProjectStatus;
    city?: string;
    advertiserId?: string;
}) => {
    const where: any = {};

    if (params.status) {
        where.status = params.status;
    }
    if (params.city) {
        where.city = params.city;
    }
    if (params.advertiserId) {
        where.advertiserId = params.advertiserId;
    }

    return prisma.project.findMany({
        where,
        include: {
            advertiser: {
                select: {
                    id: true,
                    email: true,
                    companyName: true,
                },
            },
            package: {
                include: {
                    packageDefinition: true,
                },
            },
            placements: {
                include: {
                    landingPage: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const createAdminProject = async (
    data: AdminProjectCreateRequest,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    // Verify package exists and belongs to advertiser
    const pkg = await prisma.packagePurchase.findFirst({
        where: {
            id: data.packageId,
            advertiserId: data.advertiserId,
        },
    });

    if (!pkg) {
        throw new Error('Package not found');
    }

    // Handle slug uniqueness before creating
    let finalSlug = data.slug;
    if (finalSlug) {
        const existingWithSlug = await prisma.project.findFirst({
            where: { slug: finalSlug },
        });

        if (existingWithSlug) {
            let counter = 1;
            let uniqueSlug = `${finalSlug}-${counter}`;

            while (await prisma.project.findFirst({ where: { slug: uniqueSlug } })) {
                counter++;
                uniqueSlug = `${finalSlug}-${counter}`;
            }

            finalSlug = uniqueSlug;
        }
    }

    const project = await prisma.project.create({
        data: {
            advertiserId: data.advertiserId,
            packageId: data.packageId,
            name: data.name,
            builderName: data.builderName,
            city: data.city,
            locality: data.locality,
            propertyType: data.propertyType as any,
            unitTypes: data.unitTypes,
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
            highlights: data.highlights,
            amenities: data.amenities,
            images: data.images,
            possessionStatus: data.possessionStatus,
            reraId: data.reraId,
            slug: finalSlug,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            featuredImage: data.featuredImage,
            isVisible: data.isVisible ?? true,
            floorPlans: data.floorPlans || [],
            videoUrl: data.videoUrl,
            builderDescription: data.builderDescription,
            aboutProject: data.aboutProject,
            address: data.address,
            price: data.price,
            priceDetails: data.priceDetails,
            heroImage: data.heroImage,
            projectLogo: data.projectLogo,
            advertiserLogo: data.advertiserLogo,
            disclaimer: data.disclaimer,
            locationHighlights: data.locationHighlights || [],
            status: ProjectStatus.APPROVED_AWAITING_PLACEMENT,
        },
    });

    // Activate package
    if (pkg.state === PackageState.UNSTARTED) {
        await activatePackage(pkg.id);
    }

    await logAudit('admin_project_created', currentUserId, currentUserRole, {
        projectId: project.id,
        advertiserId: data.advertiserId,
    });

    return project;
};

export const pauseProject = async (
    projectId: string,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Remove from all landing pages
    await prisma.landingPageSlot.deleteMany({
        where: { projectId },
    });

    const updated = await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.APPROVED_AWAITING_PLACEMENT },
    });

    await logAudit('project_paused', currentUserId, currentUserRole, {
        projectId,
    });

    return updated;
};

export const deleteProject = async (
    projectId: string,
    currentUserId: string,
    currentUserRole: AdminRole
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    await prisma.project.delete({
        where: { id: projectId },
    });

    await logAudit('project_deleted', currentUserId, currentUserRole, {
        projectId,
        projectName: project.name,
    });

    return { message: 'Project deleted' };
};

export const getPlacementQueue = async () => {
    return prisma.project.findMany({
        where: { status: ProjectStatus.APPROVED_AWAITING_PLACEMENT },
        include: {
            advertiser: {
                select: {
                    id: true,
                    email: true,
                    companyName: true,
                },
            },
            package: {
                include: {
                    packageDefinition: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
};
