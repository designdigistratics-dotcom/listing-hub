
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing case-insensitive filter...');

        // Test pending (lowercase)
        const pending = await prisma.packageRequest.findMany({
            where: {
                status: {
                    equals: 'pending',
                    mode: 'insensitive'
                }
            }
        });
        console.log(`Searching for 'pending' found: ${pending.length} records`);
        console.log('Statuses:', pending.map(p => p.status));

        // Test approved (lowercase)
        const approved = await prisma.packageRequest.findMany({
            where: {
                status: {
                    equals: 'approved',
                    mode: 'insensitive'
                }
            }
        });
        console.log(`Searching for 'approved' found: ${approved.length} records`);
        console.log('Statuses:', approved.map(p => p.status));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
