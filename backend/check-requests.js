
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const all = await prisma.packageRequest.findMany();
        console.log('Total requests:', all.length);
        console.log('Statuses found:', all.map(r => r.status));

        const pending = await prisma.packageRequest.count({ where: { status: 'pending' } });
        const approved = await prisma.packageRequest.count({ where: { status: 'approved' } });
        const rejected = await prisma.packageRequest.count({ where: { status: 'rejected' } });

        console.log('Counts:');
        console.log('Pending:', pending);
        console.log('Approved:', approved);
        console.log('Rejected:', rejected);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
