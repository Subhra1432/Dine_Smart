// ═══════════════════════════════════════════
// DineSmart OS — Plan Guard Middleware
// ═══════════════════════════════════════════
import { prisma } from '../config/database.js';
import { PLAN_LIMITS } from '@dinesmart/shared';
export function requirePlanFeature(feature) {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: req.user.restaurantId },
            select: { plan: true, planExpiresAt: true, isActive: true },
        });
        if (!restaurant || !restaurant.isActive) {
            res.status(403).json({ success: false, error: 'Restaurant is suspended' });
            return;
        }
        if (restaurant.planExpiresAt && new Date(restaurant.planExpiresAt) < new Date()) {
            res.status(403).json({
                success: false,
                error: 'PLAN_EXPIRED',
                upgradeUrl: '/billing',
            });
            return;
        }
        const plan = restaurant.plan;
        const limits = PLAN_LIMITS[plan];
        if (!limits[feature]) {
            res.status(403).json({
                success: false,
                error: 'PLAN_LIMIT_EXCEEDED',
                upgradeUrl: '/billing',
            });
            return;
        }
        next();
    };
}
export function requireBranchLimit() {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: req.user.restaurantId },
            select: { plan: true, _count: { select: { branches: true } } },
        });
        if (!restaurant) {
            res.status(404).json({ success: false, error: 'Restaurant not found' });
            return;
        }
        const plan = restaurant.plan;
        const limits = PLAN_LIMITS[plan];
        if (limits.maxBranches !== -1 && restaurant._count.branches >= limits.maxBranches) {
            res.status(403).json({
                success: false,
                error: 'PLAN_LIMIT_EXCEEDED',
                upgradeUrl: '/billing',
            });
            return;
        }
        next();
    };
}
export function requireTableLimit() {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Authentication required' });
            return;
        }
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: req.user.restaurantId },
            select: { plan: true, _count: { select: { tables: true } } },
        });
        if (!restaurant) {
            res.status(404).json({ success: false, error: 'Restaurant not found' });
            return;
        }
        const plan = restaurant.plan;
        const limits = PLAN_LIMITS[plan];
        if (limits.maxTables !== -1 && restaurant._count.tables >= limits.maxTables) {
            res.status(403).json({
                success: false,
                error: 'PLAN_LIMIT_EXCEEDED',
                upgradeUrl: '/billing',
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=planGuard.js.map