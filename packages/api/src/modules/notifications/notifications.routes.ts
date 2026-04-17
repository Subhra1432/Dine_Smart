// ═══════════════════════════════════════════
// DineSmart OS — Notifications Module
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { asyncHandler, authenticate } from '../../middleware/index.js';
import { paginationSchema } from '@dinesmart/shared';

const router = Router();
router.use(authenticate);

// Get notifications
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const restaurantId = req.user!.restaurantId;
  const branchId = req.user!.branchId;

  const where: Record<string, unknown> = { restaurantId };
  if (branchId) {
    where['OR'] = [{ branchId }, { branchId: null }];
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, isRead: false } }),
  ]);

  res.json({
    success: true,
    data: { items, page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
  });
}));

// Mark as read
router.put('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.update({
    where: { id: req.params['id']! },
    data: { isRead: true },
  });
  res.json({ success: true, data: { message: 'Marked as read' } });
}));

// Mark all as read
router.put('/read-all', asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { restaurantId: req.user!.restaurantId, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true, data: { message: 'All marked as read' } });
}));

// Stubs for WhatsApp and SMS
router.post('/whatsapp', asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'WhatsApp notification endpoint - coming soon' } });
}));

router.post('/sms', asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'SMS notification endpoint - coming soon' } });
}));

export default router;
