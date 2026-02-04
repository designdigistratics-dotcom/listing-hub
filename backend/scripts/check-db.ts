
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Database...');

    // 1. Check Projects
    const projects = await prisma.project.findMany({
        include: {
            advertiser: true,
            package: true
        }
    });

    console.log(`\n📋 Found ${projects.length} Projects:`);
    projects.forEach(p => {
        console.log(`- [${p.status}] ${p.name} (ID: ${p.id})`);
        console.log(`  Advertiser: ${p.advertiser.email}`);
        console.log(`  Package: ${p.package.state}`);
        console.log(`  Images: ${JSON.stringify(p.images)}`);
    });

    // 2. Check Active Packages
    const packages = await prisma.packagePurchase.findMany({
        where: { state: 'ACTIVE' },
        include: { advertiser: true }
    });
    console.log(`\n📦 Found ${packages.length} Active Packages.`);

    // 3. Check Users
    const advertisers = await prisma.user.count({ where: { role: 'ADVERTISER' } });
    console.log(`\n👥 Found ${advertisers} Advertisers.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
