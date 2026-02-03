import prisma from '../utils/prisma';
import { AdminRole } from '../types';

interface AuditDetails {
    [key: string]: any;
}

export const logAudit = async (
    action: string,
    userId: string,
    userRole: AdminRole | string,
    details: AuditDetails
): Promise<void> => {
    // Skip auditing for system cron jobs to avoid foreign key constraints
    if (userId === 'SYSTEM_CRON') {
        return;
    }

    try {
        await prisma.auditLog.create({
            data: {
                action,
                userId,
                userRole: String(userRole),
                details,
            },
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging should not break the main operation
    }
};

export const getAuditLogs = async (params: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) => {
    const { userId, action, startDate, endDate, limit = 100, offset = 0 } = params;

    const where: any = {};

    if (userId) {
        where.userId = userId;
    }

    if (action) {
        where.action = { contains: action, mode: 'insensitive' };
    }

    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
            where.timestamp.gte = startDate;
        }
        if (endDate) {
            where.timestamp.lte = endDate;
        }
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
};
