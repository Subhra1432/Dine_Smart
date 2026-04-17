// ═══════════════════════════════════════════
// DineSmart OS — Report Worker
// ═══════════════════════════════════════════

import { Worker } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

interface ReportJobData {
  type: 'daily' | 'weekly' | 'monthly';
  restaurantId: string;
  branchId?: string;
}

export function createReportWorker(connection: { host: string; port: number }) {
  const worker = new Worker<ReportJobData>(
    'reports',
    async (job) => {
      const { type, restaurantId, branchId } = job.data;
      logger.info('Generating report', { type, restaurantId });

      const now = new Date();
      let from: Date;

      switch (type) {
        case 'daily':
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;
        case 'weekly':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
      }

      const where: Record<string, unknown> = {
        restaurantId,
        createdAt: { gte: from, lte: now },
      };
      if (branchId) where['branchId'] = branchId;

      const [totalOrders, revenue, topItems] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({
          where: { ...where, paymentStatus: 'PAID' },
          _sum: { total: true },
        }),
        prisma.orderItem.groupBy({
          by: ['menuItemId'],
          where: { order: where },
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),
      ]);

      logger.info('Report generated', {
        type,
        restaurantId,
        totalOrders,
        revenue: revenue._sum.total || 0,
        topItemsCount: topItems.length,
      });

      // In production: generate PDF and email to restaurant owner
    },
    { connection, concurrency: 3 }
  );

  worker.on('failed', (job, err) => {
    logger.error('Report job failed', { jobId: job?.id, error: err.message });
  });

  return worker;
}
