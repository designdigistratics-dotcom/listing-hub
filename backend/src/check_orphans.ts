
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking for Paid packages without billing records...");

        const packages = await prisma.packagePurchase.findMany({
            where: {
                amountPaid: { gt: 0 }
            },
            include: {
                billingRecords: true,
                advertiser: true,
                packageDefinition: true
            }
        });

        console.log(`Found ${packages.length} packages with payments.`);

        const orphans = packages.filter(p => p.billingRecords.length === 0);

        console.log(`Found ${orphans.length} ORPHAN packages (Paid but no Billing Record).`);

        orphans.forEach(pkg => {
            console.log(`- [${pkg.id}] ${pkg.advertiser.companyName}: Paid ${pkg.amountPaid}, Records: ${pkg.billingRecords.length}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
