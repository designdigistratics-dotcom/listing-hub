
import { PrismaClient } from '@prisma/client';
import { ROLE_PERMISSIONS, AdminRole } from '../src/types';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding roles...');

    const roles = Object.entries(ROLE_PERMISSIONS);

    for (const [roleName, permissions] of roles) {
        if (roleName === AdminRole.ADVERTISER) continue; // Skip advertiser if managed differently, but user wants generic roles. Actually, keep it for consistency or skip?
        // Let's include all.

        console.log(`Processing role: ${roleName}`);

        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {
                permissions: permissions,
                isSystem: true,
            },
            create: {
                name: roleName,
                permissions: permissions,
                isSystem: true,
                description: `Default system role for ${roleName}`,
            },
        });

        // Migrate users
        const users = await prisma.user.updateMany({
            where: { role: roleName as AdminRole, roleId: null },
            data: { roleId: role.id },
        });

        console.log(`Updated ${users.count} users for role ${roleName}`);
    }

    console.log('Roles seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
