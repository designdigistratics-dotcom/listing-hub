
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking Package Purchases...");
        const packages = await prisma.packagePurchase.findMany({
            include: {
                packageDefinition: true,
                advertiser: true
            }
        });

        console.log(`Total Packages: ${packages.length}`);

        packages.forEach(pkg => {
            console.log(`ID: ${pkg.id}`);
            console.log(`  Advertiser: ${pkg.advertiser.companyName} (${pkg.advertiser.email})`);
            console.log(`  Plan: ${pkg.packageDefinition.name}`);
            console.log(`  State: ${pkg.state}`);
            console.log(`  Price: ${pkg.packageDefinition.price}`);
            console.log(`  Paid: ${pkg.amountPaid}`);
            console.log(`  Pending: ${pkg.pendingAmount}`);
            console.log(`  Due Date: ${pkg.paymentDueDate}`);
            console.log("---------------------------------------------------");
        });

        console.log("Checking Pending Dues Query...");
        const pendingDues = await prisma.packagePurchase.findMany({
            where: {
                pendingAmount: { gt: 0 },
            },
        });
        console.log(`Pending Dues Count: ${pendingDues.length}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
