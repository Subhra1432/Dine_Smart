import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Diagnostic: Checking Demo Accounts...');
    
    // Check SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: 'admin@dinesmart.ai' }
    });
    console.log('SuperAdmin (admin@dinesmart.ai):', superAdmin ? 'EXISTS' : 'MISSING');

    // Check Restaurant
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug: 'spice-garden' }
    });
    console.log('Restaurant (spice-garden):', restaurant ? `EXISTS (Status: ${restaurant.status}, Active: ${restaurant.isActive})` : 'MISSING');

    // Check Users
    const emails = [
      'owner@spicegarden.com',
      'manager@spicegarden.com',
      'cashier@spicegarden.com',
      'kitchen@spicegarden.com'
    ];

    for (const email of emails) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { restaurant: true }
      });
      if (user) {
        console.log(`User (${email}): EXISTS (Role: ${user.role}, Restaurant: ${user.restaurant.name}, RestStatus: ${user.restaurant.status})`);
      } else {
        console.log(`User (${email}): MISSING`);
      }
    }

  } catch (err) {
    console.error('❌ Diagnostic failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
