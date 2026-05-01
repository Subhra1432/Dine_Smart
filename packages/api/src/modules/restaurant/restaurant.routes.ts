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
router.put('/profile', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateProfile));

// Branches
router.get('/branches', asyncHandler(ctrl.getBranches));
router.post('/branches', requireRole(['OWNER', 'MANAGER']), requireBranchLimit(), asyncHandler(ctrl.createBranch));
router.put('/branches/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateBranch));
router.delete('/branches/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteBranch));

// Tables
router.get('/tables', asyncHandler(ctrl.getTables));
router.post('/tables', requireRole(['OWNER', 'MANAGER']), requireTableLimit(), asyncHandler(ctrl.createTable));
router.put('/tables/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateTable));
router.delete('/tables/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteTable));
router.get('/tables/:id/qr', asyncHandler(ctrl.getTableQR));

// Users
router.get('/users', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.getUsers));
router.post('/users', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.createUser));
router.put('/users/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateUser));
router.delete('/users/:id', requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteUser));

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

  if (!['STARTER', 'PREMIUM'].includes(plan)) {
    res.status(400).json({ success: false, error: 'Invalid plan. Only STARTER and PREMIUM are available.' });
    return;
  }

  if (!['UPI', 'CARD', 'BANK_TRANSFER'].includes(paymentMethod)) {
    res.status(400).json({ success: false, error: 'Invalid payment method' });
    return;
  }

  // ── Downgrade Protection ─────────────────
  // If switching to STARTER, verify current usage is within STARTER limits.
  const currentRestaurant = await prisma.restaurant.findUnique({
    where: { id: req.user!.restaurantId },
    include: {
      _count: { select: { branches: true, tables: true } },
    },
  });

  if (currentRestaurant && plan === 'STARTER') {
    const STARTER_MAX_TABLES = 20;
    const STARTER_MAX_BRANCHES = 1;
    const reasons: string[] = [];

    if (currentRestaurant._count.tables > STARTER_MAX_TABLES) {
      reasons.push(`You have ${currentRestaurant._count.tables} tables (Starter allows ${STARTER_MAX_TABLES})`);
    }
    if (currentRestaurant._count.branches > STARTER_MAX_BRANCHES) {
      reasons.push(`You have ${currentRestaurant._count.branches} branches (Starter allows ${STARTER_MAX_BRANCHES})`);
    }

    // Check active coupons
    const activeCoupons = await prisma.coupon.count({
      where: { restaurantId: req.user!.restaurantId, isActive: true },
    });
    if (activeCoupons > 0) {
      reasons.push(`You have ${activeCoupons} active coupon(s) — Starter plan does not include coupon features`);
    }

    if (reasons.length > 0) {
      res.status(400).json({
        success: false,
        error: 'DOWNGRADE_BLOCKED',
        reasons,
        message: 'Cannot downgrade to Starter plan. Please resolve usage limits first.',
      });
      return;
    }
  }

  const amount = plan === 'STARTER' ? 999 : 2499;
  

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
          plan: plan as 'STARTER' | 'PREMIUM',
          planExpiresAt: expiresAt,
        },
      }),
      prisma.subscriptionPayment.create({
        data: {
          restaurantId: req.user!.restaurantId,
          plan: plan as 'STARTER' | 'PREMIUM',
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

// ── Clear Order History (Archive) ─────────────
// Marks all finished orders (COMPLETED, SERVED, CANCELLED) as archived.
// Archived orders are hidden from front-end operational views but kept for analytics.
router.delete('/orders/history', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const result = await prisma.order.updateMany({
    where: {
      restaurantId: req.user!.restaurantId,
      isArchived: false,
    },
    data: { isArchived: true },
  });

  // Also free all tables for this restaurant
  await prisma.table.updateMany({
    where: { restaurantId: req.user!.restaurantId },
    data: { isOccupied: false },
  });

  res.json({
    success: true,
    data: { archivedCount: result.count },
    message: `${result.count} orders have been archived and cleared from the dashboard.`,
  });
}));

// ── Demo Seeding ─────────────
router.post('/seed-demo', requireRole(['OWNER', 'MANAGER']), asyncHandler(async (req: Request, res: Response) => {
  const { seedDemoMenu } = await import('../../utils/demoSeeder.js');
  
  // Verify it's a demo restaurant (optional, but safer)
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } });
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  
  if (!restaurant || !user || (restaurant.slug !== 'spice-garden' && !user.email.includes('@spicegarden.com'))) {
    res.status(403).json({ success: false, error: 'Seeding only allowed for demo accounts' });
    return;
  }

  await seedDemoMenu(req.user!.restaurantId);
  res.json({ success: true, message: 'Demo data seeded successfully' });
}));

export default router;
