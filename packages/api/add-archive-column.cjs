const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Archiving sequence initiated...');
  try {
    await prisma.$executeRaw`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN DEFAULT false`;
    console.log('✅ Added isArchived column to orders table');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
