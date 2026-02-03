
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'test_adv_ui@test.com'; // Adjust to the user reporting the issue if possible, or a known test user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log(`Checking packages for ${user.email} (${user.id})`);

    const packages = await prisma.packagePurchase.findMany({
        where: { advertiserId: user.id },
        include: {
            billingRecords: true
        }
    });

    packages.forEach(p => {
        console.log(`Package ${p.id} (${p.state})`);
        console.log(`  Paid: ${p.amountPaid}, Pending: ${p.pendingAmount}`);
        console.log(`  Records: ${JSON.stringify(p.billingRecords)}`);
        console.log('---');
    });
}

main();
