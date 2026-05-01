// ═══════════════════════════════════════════
// DineSmart OS — Loyalty Module
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { asyncHandler, authenticate, requireRole } from '../../middleware/index.js';
import { redeemPointsSchema } from '@dinesmart/shared';
import { LOYALTY_REDEMPTION_RATE } from '@dinesmart/shared';

const router = Router();
router.use(authenticate);

// Get loyalty account
router.get('/:customerId', asyncHandler(async (req: Request, res: Response) => {
  const account = await prisma.loyaltyAccount.findFirst({
    where: {
      customerId: req.params['customerId']!,
      restaurantId: req.user!.restaurantId,
    },
    include: { customer: true },
  });

  if (!account) throw new AppError(404, 'Loyalty account not found');
  res.json({ success: true, data: account });
}));

// Get all loyalty accounts
router.get('/', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const accounts = await prisma.loyaltyAccount.findMany({
    where: { restaurantId: req.user!.restaurantId },
    include: { customer: true },
    orderBy: { points: 'desc' },
  });
  res.json({ success: true, data: accounts });
}));

// Redeem points
router.post('/redeem', asyncHandler(async (req: Request, res: Response) => {
  const { customerId, points } = redeemPointsSchema.parse(req.body);

  const account = await prisma.loyaltyAccount.findFirst({
    where: { customerId, restaurantId: req.user!.restaurantId },
  });

  if (!account) throw new AppError(404, 'Loyalty account not found');
  if (account.points < points) throw new AppError(400, `Insufficient points. Available: ${account.points}`);

  const discountAmount = points * LOYALTY_REDEMPTION_RATE;

  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      points: { decrement: points },
      totalRedeemed: { increment: points },
    },
  });

  res.json({
    success: true,
    data: {
      pointsRedeemed: points,
      discountAmount: Math.round(discountAmount * 100) / 100,
      remainingPoints: account.points - points,
    },
  });
}));

export default router;
