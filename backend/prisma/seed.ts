import { PrismaClient, AdminRole, OptionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@listinghub.in' },
        update: {},
        create: {
            email: 'admin@listinghub.in',
            password: hashedPassword,
            name: 'Super Admin',
            role: AdminRole.SUPER_ADMIN,
            isActive: true,
            customPermissions: ['all'],
        },
    });

    console.log('✅ Super Admin created:', superAdmin.email);

    // Create Initial Package Definitions
    const packages = [
        {
            name: 'Basic Listing',
            durationMonths: 3,
            price: 4999,
            description: '3 months visibility for one project',
        },
        {
            name: 'Premium Listing',
            durationMonths: 6,
            price: 9999,
            description: '6 months visibility with featured tag',
        },
        {
            name: 'Enterprise Plan',
            durationMonths: 12,
            price: 19999,
            description: '12 months visibility for multiple projects',
        },
    ];

    for (const pkg of packages) {
        await prisma.packageDefinition.create({
            data: pkg,
        });
    }

    console.log('✅ Package definitions created');

    // Create Options
    const amenities = [
        'Swimming Pool', 'Gym', 'Club House', 'Garden', 'Security',
        'Power Backup', 'WiFi', 'Parking'
    ];

    for (const amenity of amenities) {
        const existingOption = await prisma.option.findFirst({
            where: {
                optionType: OptionType.AMENITY,
                name: amenity,
                parentId: null
            }
        });

        if (!existingOption) {
            await prisma.option.create({
                data: {
                    optionType: OptionType.AMENITY,
                    name: amenity,
                    isActive: true
                }
            });
        }
    }

    console.log('✅ Options created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
