// ═══════════════════════════════════════════
// DineSmart OS — AI Module
// ═══════════════════════════════════════════
import { Router } from 'express';
import { prisma } from '../../config/database.js';
import { asyncHandler, authenticate, requireRole, requirePlanFeature } from '../../middleware/index.js';
import { redis } from '../../config/redis.js';
import { publicRateLimiter } from '../../middleware/index.js';
const router = Router();
// ── Combo Recommendations (public) ───────
router.get('/recommendations', publicRateLimiter, asyncHandler(async (req, res) => {
    const itemIds = (req.query['itemIds'] || '').split(',').filter(Boolean);
    const restaurantSlug = req.query['restaurantSlug'];
    if (!restaurantSlug || itemIds.length === 0) {
        res.json({ success: true, data: [] });
        return;
    }
    const restaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
    });
    if (!restaurant) {
        res.json({ success: true, data: [] });
        return;
    }
    // Check cache
    const cacheKey = `reco:${restaurant.id}:${itemIds.sort().join(',')}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        res.json({ success: true, data: JSON.parse(cached) });
        return;
    }
    // Collaborative filtering: find items frequently ordered with the given items
    const recentOrders = await prisma.order.findMany({
        where: { restaurantId: restaurant.id, status: { not: 'CANCELLED' } },
        include: { items: { select: { menuItemId: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
    });
    // Find co-occurrence
    const coOccurrence = new Map();
    for (const order of recentOrders) {
        const orderItemIds = order.items.map((i) => i.menuItemId);
        const hasRequestedItem = itemIds.some((id) => orderItemIds.includes(id));
        if (!hasRequestedItem)
            continue;
        for (const oid of orderItemIds) {
            if (!itemIds.includes(oid)) {
                coOccurrence.set(oid, (coOccurrence.get(oid) || 0) + 1);
            }
        }
    }
    // Sort by frequency, take top 3
    const sorted = Array.from(coOccurrence.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    const minSupport = Math.max(1, Math.floor(recentOrders.length * 0.05));
    const filteredIds = sorted
        .filter(([, count]) => count >= minSupport)
        .map(([id]) => id);
    const recommended = await prisma.menuItem.findMany({
        where: { id: { in: filteredIds }, isAvailable: true },
        select: { id: true, name: true, price: true, imageUrl: true },
    });
    const result = recommended.map((item) => ({
        ...item,
        confidence: Math.round(((coOccurrence.get(item.id) || 0) / recentOrders.length) * 100),
    }));
    // Cache for 6 hours
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 21600);
    res.json({ success: true, data: result });
}));
// ── Demand Forecast ──────────────────────
router.get('/demand-forecast', authenticate, requireRole(['OWNER', 'MANAGER']), requirePlanFeature('aiDemandForecast'), asyncHandler(async (req, res) => {
    const branchId = req.query['branchId'] || req.user.branchId;
    const hours = parseInt(req.query['hours']) || 3;
    const restaurantId = req.user.restaurantId;
    // Get hourly data for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const currentHour = now.getHours();
    const where = {
        restaurantId,
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
    };
    if (branchId)
        where['branchId'] = branchId;
    const orderItems = await prisma.orderItem.findMany({
        where: { order: where },
        include: {
            menuItem: { select: { id: true, name: true } },
            order: { select: { createdAt: true } },
        },
    });
    // Group by item and hour
    const itemHourCounts = new Map();
    for (const oi of orderItems) {
        const itemId = oi.menuItemId;
        const hour = oi.order.createdAt.getHours();
        if (!itemHourCounts.has(itemId))
            itemHourCounts.set(itemId, new Map());
        const hourMap = itemHourCounts.get(itemId);
        if (!hourMap.has(hour))
            hourMap.set(hour, []);
        hourMap.get(hour).push(oi.quantity);
    }
    // Calculate moving average for next 'hours' hours
    const forecasts = [];
    for (const [itemId, hourMap] of itemHourCounts.entries()) {
        let totalExpected = 0;
        for (let h = 0; h < hours; h++) {
            const targetHour = (currentHour + h) % 24;
            const counts = hourMap.get(targetHour) || [];
            const avg = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
            totalExpected += avg;
        }
        const menuItem = orderItems.find((oi) => oi.menuItemId === itemId)?.menuItem;
        if (menuItem && totalExpected > 0.5) {
            forecasts.push({
                menuItemId: itemId,
                name: menuItem.name,
                expectedOrders: Math.round(totalExpected * 10) / 10,
                isHighDemand: totalExpected > 5,
            });
        }
    }
    forecasts.sort((a, b) => b.expectedOrders - a.expectedOrders);
    res.json({ success: true, data: forecasts.slice(0, 20) });
}));
// ── Pricing Suggestions ──────────────────
router.get('/pricing-suggestions', authenticate, requireRole(['OWNER', 'MANAGER']), requirePlanFeature('aiSmartPricing'), asyncHandler(async (req, res) => {
    const restaurantId = req.user.restaurantId;
    const items = await prisma.menuItem.findMany({
        where: { restaurantId, isAvailable: true },
        select: { id: true, name: true, price: true, orderCount: true, categoryId: true },
    });
    const suggestions = [];
    // Group by category for comparison
    const byCategory = new Map();
    for (const item of items) {
        if (!byCategory.has(item.categoryId))
            byCategory.set(item.categoryId, []);
        byCategory.get(item.categoryId).push(item);
    }
    for (const [, catItems] of byCategory.entries()) {
        if (catItems.length < 2)
            continue;
        const avgOrders = catItems.reduce((sum, i) => sum + i.orderCount, 0) / catItems.length;
        const avgPrice = catItems.reduce((sum, i) => sum + i.price, 0) / catItems.length;
        for (const item of catItems) {
            if (item.orderCount < avgOrders * 0.3 && item.price > avgPrice) {
                const suggestedPrice = Math.round(avgPrice * 0.9 * 100) / 100;
                if (suggestedPrice < item.price) {
                    suggestions.push({
                        menuItemId: item.id,
                        name: item.name,
                        currentPrice: item.price,
                        suggestedPrice,
                        reason: `Low orders (${item.orderCount}) compared to category avg (${Math.round(avgOrders)}). Similar items sell ${Math.round(avgOrders / Math.max(item.orderCount, 1))}x more at ₹${avgPrice.toFixed(0)}`,
                    });
                }
            }
        }
    }
    res.json({ success: true, data: suggestions });
}));
export default router;
//# sourceMappingURL=ai.routes.js.map