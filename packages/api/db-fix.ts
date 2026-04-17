import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB REPAIR START ---');
  try {
    // Manually create the table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "subscription_payments" (
          "id" TEXT NOT NULL,
          "restaurantId" TEXT NOT NULL,
          "plan" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "method" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'COMPLETED',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Table "subscription_payments" verified/created.');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "subscription_payments_restaurantId_idx" ON "subscription_payments"("restaurantId");
    `);
    console.log('✅ Index created.');

    // Add a foreign key if you want, but strictly not necessary for the view to work
    // Skipping FK for safety to avoid conflicts if IDs don't match exactly in this session
    
    console.log('🚀 DB Repair complete.');
  } catch (err) {
    console.error('❌ DB Repair failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
