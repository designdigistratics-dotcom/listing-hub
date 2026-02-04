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

    const propertyTypes = [
        'Apartment', 'Villa', 'Plot', 'Independent Floor', 'Commercial', 'Office Space'
    ];

    const possessionStatuses = [
        'Ready to Move', 'Under Construction', 'Pre Launch', 'New Launch'
    ];

    const unitTypes = [
        '1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK', 'Penthouse', 'Villa'
    ];

    const cities = [
        'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'
    ];

    // Helper function to seed options
    async function seedOptions(type: OptionType, values: string[]) {
        for (const value of values) {
            const existingOption = await prisma.option.findFirst({
                where: {
                    optionType: type,
                    name: value,
                    parentId: null
                }
            });

            if (!existingOption) {
                await prisma.option.create({
                    data: {
                        optionType: type,
                        name: value,
                        isActive: true
                    }
                });
            }
        }
        console.log(`✅ ${type} created`);
    }

    await seedOptions(OptionType.AMENITY, amenities);
    await seedOptions(OptionType.PROPERTY_TYPE, propertyTypes);
    await seedOptions(OptionType.POSSESSION_STATUS, possessionStatuses);
    await seedOptions(OptionType.UNIT_TYPE, unitTypes);
    await seedOptions(OptionType.CITY, cities);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
