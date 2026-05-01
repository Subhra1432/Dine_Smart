import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

const prisma = new PrismaClient();

export async function runDatabaseSeed() {
  try {
    logger.info('🌱 Checking if database needs seeding...');
    
    const adminCount = await prisma.superAdmin.count();
    
    // Seed if DB is empty or RESET_DB is true
    if (process.env.RESET_DB === 'true' || adminCount === 0) {
      logger.info('⚠️ Seeding required. Cleaning existing data...');
      
      await prisma.$transaction([
        prisma.stockHistory.deleteMany(),
        prisma.menuItemInventory.deleteMany(),
        prisma.menuItemAddon.deleteMany(),
        prisma.menuItemVariant.deleteMany(),
        prisma.orderItem.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.review.deleteMany(),
        prisma.order.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.loyaltyAccount.deleteMany(),
        prisma.customer.deleteMany(),
        prisma.coupon.deleteMany(),
        prisma.inventoryItem.deleteMany(),
        prisma.addon.deleteMany(),
        prisma.menuItem.deleteMany(),
        prisma.category.deleteMany(),
        prisma.table.deleteMany(),
        prisma.user.deleteMany(),
        prisma.branch.deleteMany(),
        prisma.restaurant.deleteMany(),
        prisma.superAdmin.deleteMany(),
      ]);

      // Create Super Admin
      const superAdminHash = await bcrypt.hash('superadmin123', 12);
      await prisma.superAdmin.create({
        data: {
          email: 'admin@dinesmart.ai',
          passwordHash: superAdminHash,
        },
      });
      
      logger.info('✅ Super Admin created: admin@dinesmart.ai / superadmin123');
      logger.info('🎉 Database seeded successfully!');
    } else {
      logger.info('ℹ️ Database already contains data. Skipping seed.');
    }
  } catch (err) {
    logger.error('❌ Database seeding failed', { error: err });
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}
