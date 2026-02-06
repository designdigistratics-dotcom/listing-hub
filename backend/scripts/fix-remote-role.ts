
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    const email = 'nkumarsingh378@gmail.com'; // Target user

    console.log(`Connecting to DB: ${process.env.DATABASE_URL?.split('@')[1]}`); // Log host only for safety

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            include: { userRole: true } // see what they have
        });

        if (!user) {
            console.error(`User ${email} not found!`);
            return;
        }

        console.log(`Found user: ${user.email} with role ${user.role}`);

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'SUPER_ADMIN'
            }
        });

        console.log(`User ${updated.email} SUCCESSFULLY updated to ${updated.role}`);

    } catch (error) {
        console.error("Error updating role:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
