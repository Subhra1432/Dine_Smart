// ═══════════════════════════════════════════
// DineSmart OS — Restaurant Routes
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import * as ctrl from './restaurant.controller.js';
import { asyncHandler, authenticate, requireRole, requireBranchLimit, requireTableLimit } from '../../middleware/index.js';
import { prisma } from '../../config/database.js';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', asyncHandler(ctrl.getProfile));
router.put('/profile', requireRole(['OWNER']), asyncHandler(ctrl.updateProfile));

// Branches
router.get('/branches', asyncHandler(ctrl.getBranches));
router.post('/branches', requireRole(['OWNER']), requireBranchLimit(), asyncHandler(ctrl.createBranch));
router.put('/branches/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateBranch));
router.delete('/branches/:id', requireRole(['OWNER']), asyncHandler(ctrl.deleteBranch));

// Tables
router.get('/tables', asyncHandler(ctrl.getTables));
router.post('/tables', requireRole(['OWNER', 'MANAGER']), requireTableLimit(), asyncHandler(ctrl.createTable));
router.put('/tables/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateTable));
router.delete('/tables/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteTable));
router.get('/tables/:id/qr', asyncHandler(ctrl.getTableQR));

// Users
router.get('/users', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.getUsers));
router.post('/users', requireRole(['OWNER']), asyncHandler(ctrl.createUser));
router.put('/users/:id', requireRole(['OWNER']), asyncHandler(ctrl.updateUser));
router.delete('/users/:id', requireRole(['OWNER']), asyncHandler(ctrl.deleteUser));

// ── Subscription Management ─────────────
router.get('/subscription', asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.user!.restaurantId },
    include: {
      _count: { select: { branches: true, tables: true, menuItems: true, orders: true } },
    },
  });

  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }

  const now = new Date();
  const expiresAt = restaurant.planExpiresAt ? new Date(restaurant.planExpiresAt) : null;
  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 30; // Default 30 days if no expiry set

  res.json({
    success: true,
    data: {
      plan: restaurant.plan,
      planExpiresAt: restaurant.planExpiresAt,
      isActive: restaurant.isActive,
      daysRemaining,
      usage: {
        branches: restaurant._count.branches,
        tables: restaurant._count.tables,
        menuItems: restaurant._count.menuItems,
        orders: restaurant._count.orders,
      },
    },
  });
}));

router.post('/subscription/pay', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const { plan, paymentMethod } = req.body as { plan: string; paymentMethod: string };

  if (!['STARTER', 'GROWTH', 'PREMIUM'].includes(plan)) {
    res.status(400).json({ success: false, error: 'Invalid plan' });
    return;
  }

  if (!['UPI', 'CARD', 'BANK_TRANSFER'].includes(paymentMethod)) {
    res.status(400).json({ success: false, error: 'Invalid payment method' });
    return;
  }

  // In production, integrate with Stripe Checkout.
  // This creates a session and returns the URL for the frontend to redirect.
  const amount = plan === 'GROWTH' ? 2499 : plan === 'PREMIUM' ? 7499 : 0;
  
  if (amount === 0) {
    res.status(400).json({ success: false, error: 'Invalid plan for payment' });
    return;
  }

  const { stripe, STRIPE_CONFIG, isDemoMode } = await import('../../lib/stripe.js');
  
  if (isDemoMode) {
    // ── Demo Mode Path ─────────────────────
    // If Stripe is not configured, we simulate a successful payment immediately.
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day extension

    await prisma.$transaction([
      prisma.restaurant.update({
        where: { id: req.user!.restaurantId },
        data: {
          plan: plan as 'STARTER' | 'GROWTH' | 'PREMIUM',
          planExpiresAt: expiresAt,
        },
      }),
      prisma.subscriptionPayment.create({
        data: {
          restaurantId: req.user!.restaurantId,
          plan: plan as 'STARTER' | 'GROWTH' | 'PREMIUM',
          amount: amount,
          method: paymentMethod,
          status: 'COMPLETED (DEMO)',
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        message: `Demo Mode: ${plan} plan activated successfully!`,
        isDemo: true,
      },
    });
  }

  // ── Production Stripe Path ────────────────
  const session = await stripe!.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: `DineSmart ${plan} Plan`,
          description: `30-day subscription for ${plan} plan`,
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: STRIPE_CONFIG.successUrl,
    cancel_url: STRIPE_CONFIG.cancelUrl,
    metadata: {
      restaurantId: req.user!.restaurantId,
      userId: req.user!.userId,
      plan: plan,
    },
  });

  res.json({
    success: true,
    data: {
      id: session.id,
      url: session.url,
      message: 'Stripe Checkout session created',
    },
  });
}));

router.get('/subscription/payments', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const payments = await prisma.subscriptionPayment.findMany({
    where: { restaurantId: req.user!.restaurantId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: payments });
}));

// ── Coupons ─────────────
router.get('/coupons', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({
    where: { restaurantId: req.user!.restaurantId },
    orderBy: { expiresAt: 'desc' },
  });
  res.json({ success: true, data: coupons });
}));

router.post('/coupons', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt, isActive } = req.body;
  const coupon = await prisma.coupon.create({
    data: {
      restaurantId: req.user!.restaurantId,
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxUses: Number(maxUses || 100),
      expiresAt: new Date(expiresAt),
      isActive: isActive !== undefined ? isActive : true,
    },
  });
  res.status(201).json({ success: true, data: coupon });
}));

router.delete('/coupons/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  await prisma.coupon.delete({
    where: { id: req.params.id, restaurantId: req.user!.restaurantId },
  });
  res.json({ success: true, message: 'Coupon deleted' });
}));

// ── Reviews ─────────────
router.get('/reviews', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { restaurantId: req.user!.restaurantId },
    include: {
      order: {
        include: {
          customer: true,
          table: true,
          items: { include: { menuItem: { select: { name: true } } } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: reviews });
}));

export default router;
