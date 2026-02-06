
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: {
                userRole: true
            }
        });

        console.log("--- ALL USERS ---");
        users.forEach(u => {
            console.log(`ID: ${u.id}`);
            console.log(`Email: ${u.email}`);
            console.log(`Role (Enum): ${u.role}`);
            console.log(`Role (Relation): ${u.userRole?.name || 'None'}`);
            console.log(`Permissions: ${u.userRole?.permissions?.join(', ') || 'None'}`);
            console.log("-------------------");
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
