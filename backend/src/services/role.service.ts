
import prisma from '../utils/prisma';
import { AdminRole } from '../types';

export const getRoles = async () => {
    return prisma.role.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });
};

export const getRoleById = async (id: string) => {
    return prisma.role.findUnique({
        where: { id },
        include: {
            users: {
                select: { id: true, name: true, email: true }
            }
        }
    });
};

export const createRole = async (data: { name: string; permissions: string[]; description?: string }) => {
    // Check if name exists
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing) {
        throw new Error('Role with this name already exists');
    }

    return prisma.role.create({
        data: {
            name: data.name,
            permissions: data.permissions,
            description: data.description,
            isSystem: false,
        }
    });
};

export const updateRole = async (id: string, data: { name?: string; permissions?: string[]; description?: string }) => {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
        throw new Error('Role not found');
    }

    if (role.isSystem && data.name && data.name !== role.name) {
        throw new Error('Cannot rename system roles');
    }

    return prisma.role.update({
        where: { id },
        data
    });
};

export const deleteRole = async (id: string) => {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
        throw new Error('Role not found');
    }

    if (role.isSystem) {
        throw new Error('Cannot delete system roles');
    }

    // Check if users assigned
    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
        throw new Error('Cannot delete role with assigned users. Reassign them first.');
    }

    return prisma.role.delete({ where: { id } });
};
