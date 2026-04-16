// ═══════════════════════════════════════════
// DineSmart OS — Coupons Module
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { asyncHandler, authenticate, requireRole, publicRateLimiter } from '../../middleware/index.js';

// Local schemas to bypass shared package build delay
const createCouponSchema = z.object({
  code: z.string().min(3).max(20).transform(v => v.toUpperCase()),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().int().positive().default(100),
  expiresAt: z.coerce.date().transform(d => d.toISOString()),
});

const updateCouponSchema = createCouponSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.coerce.number().positive(),
});

const router = Router();

// Public coupon validation
router.post('/validate', publicRateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { code, orderTotal } = validateCouponSchema.parse(req.body);
  const restaurantSlug = req.query['restaurantSlug'] as string;

  if (!restaurantSlug) {
    throw new AppError(400, 'Restaurant slug is required');
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true },
  });
  if (!restaurant) throw new AppError(404, 'Restaurant not found');

  const coupon = await prisma.coupon.findFirst({
    where: {
      restaurantId: restaurant.id,
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { gt: new Date() },
    },
  });

  if (!coupon) {
    res.json({ success: true, data: { valid: false, reason: 'Invalid or expired coupon code' } });
    return;
  }

  if (coupon.usedCount >= coupon.maxUses) {
    res.json({ success: true, data: { valid: false, reason: 'Coupon usage limit reached' } });
    return;
  }

  if (orderTotal < coupon.minOrderValue) {
    res.json({
      success: true,
      data: { valid: false, reason: `Minimum order value is ₹${coupon.minOrderValue}` },
    });
    return;
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENT') {
    discount = (orderTotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, orderTotal);

  res.json({
    success: true,
    data: {
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: Math.round(discount * 100) / 100,
    },
  });
}));

// Protected routes
router.use(authenticate);
router.use(requireRole(['OWNER', 'MANAGER']));

// Get all coupons
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({
    where: { restaurantId: req.user!.restaurantId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: coupons });
}));

// Create coupon
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  let body;
  try {
    body = createCouponSchema.parse(req.body);
  } catch (err: any) {
    console.error('Coupon Validation Error:', err.errors);
    throw err;
  }
  const coupon = await prisma.coupon.create({
    data: { ...body, restaurantId: req.user!.restaurantId, expiresAt: new Date(body.expiresAt) },
  });
  res.status(201).json({ success: true, data: coupon });
}));

// Update coupon
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const body = updateCouponSchema.parse(req.body);
  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!coupon) throw new AppError(404, 'Coupon not found');

  const updateData = { ...body } as Record<string, unknown>;
  if (body.expiresAt) updateData['expiresAt'] = new Date(body.expiresAt);

  const updated = await prisma.coupon.update({
    where: { id: coupon.id },
    data: updateData,
  });
  res.json({ success: true, data: updated });
}));

// Delete coupon
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!coupon) throw new AppError(404, 'Coupon not found');
  await prisma.coupon.delete({ where: { id: coupon.id } });
  res.json({ success: true, data: { message: 'Coupon deleted' } });
}));

export default router;
