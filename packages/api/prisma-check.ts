import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.subscriptionPayment.count();
    console.log('Subscription Payment Count:', count);
    const payments = await prisma.subscriptionPayment.findMany({ take: 5 });
    console.log('Recent Payments:', JSON.stringify(payments, null, 2));
  } catch (err) {
    console.error('ERROR checking subscription payments:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
