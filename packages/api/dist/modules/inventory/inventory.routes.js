// ═══════════════════════════════════════════
// DineSmart OS — Inventory Module
// ═══════════════════════════════════════════
import { Router } from 'express';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { asyncHandler, authenticate, requireRole } from '../../middleware/index.js';
import { createInventoryItemSchema, updateInventoryItemSchema, updateStockSchema } from '@dinesmart/shared';
import { logger } from '../../config/logger.js';
const router = Router();
router.use(authenticate);
router.use(requireRole(['OWNER', 'MANAGER']));
// Get all inventory items
router.get('/items', asyncHandler(async (req, res) => {
    const branchId = req.query['branchId'];
    const where = { restaurantId: req.user.restaurantId };
    if (branchId)
        where['branchId'] = branchId;
    const items = await prisma.inventoryItem.findMany({
        where,
        include: {
            branch: { select: { name: true } },
            menuItemInventory: { include: { menuItem: { select: { id: true, name: true } } } },
        },
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: items });
}));
// Create inventory item
router.post('/items', asyncHandler(async (req, res) => {
    const body = createInventoryItemSchema.parse(req.body);
    const branch = await prisma.branch.findFirst({
        where: { id: body.branchId, restaurantId: req.user.restaurantId },
    });
    if (!branch)
        throw new AppError(404, 'Branch not found');
    const item = await prisma.inventoryItem.create({
        data: { ...body, restaurantId: req.user.restaurantId },
    });
    // Log initial stock
    await prisma.stockHistory.create({
        data: {
            inventoryItemId: item.id,
            changeDelta: body.currentStock,
            reason: 'Initial stock entry',
            userId: req.user.userId,
        },
    });
    res.status(201).json({ success: true, data: item });
}));
// Update inventory item
router.put('/items/:id', asyncHandler(async (req, res) => {
    const body = updateInventoryItemSchema.parse(req.body);
    const item = await prisma.inventoryItem.findFirst({
        where: { id: req.params['id'], restaurantId: req.user.restaurantId },
    });
    if (!item)
        throw new AppError(404, 'Inventory item not found');
    const updated = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: body,
    });
    res.json({ success: true, data: updated });
}));
// Manual stock update
router.put('/items/:id/stock', asyncHandler(async (req, res) => {
    const { quantity, reason } = updateStockSchema.parse(req.body);
    const item = await prisma.inventoryItem.findFirst({
        where: { id: req.params['id'], restaurantId: req.user.restaurantId },
    });
    if (!item)
        throw new AppError(404, 'Inventory item not found');
    const updated = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { currentStock: { increment: quantity } },
    });
    await prisma.stockHistory.create({
        data: {
            inventoryItemId: item.id,
            changeDelta: quantity,
            reason,
            userId: req.user.userId,
        },
    });
    logger.info('Stock updated manually', {
        inventoryItemId: item.id,
        delta: quantity,
        newStock: updated.currentStock,
        userId: req.user.userId,
    });
    res.json({ success: true, data: updated });
}));
// Get low stock alerts
router.get('/alerts', asyncHandler(async (req, res) => {
    const items = await prisma.inventoryItem.findMany({
        where: {
            restaurantId: req.user.restaurantId,
            currentStock: { lte: prisma.inventoryItem.fields.minThreshold },
        },
        include: { branch: { select: { name: true } } },
        orderBy: { currentStock: 'asc' },
    });
    // Prisma doesn't support self-referencing in where, use raw filter
    const allItems = await prisma.inventoryItem.findMany({
        where: { restaurantId: req.user.restaurantId },
        include: { branch: { select: { name: true } } },
    });
    const lowStock = allItems.filter((item) => item.currentStock <= item.minThreshold);
    res.json({ success: true, data: lowStock });
}));
// Link menu item to inventory
router.post('/link', asyncHandler(async (req, res) => {
    const { menuItemId, inventoryItemId, quantityUsed } = req.body;
    const [menuItem, invItem] = await Promise.all([
        prisma.menuItem.findFirst({ where: { id: menuItemId, restaurantId: req.user.restaurantId } }),
        prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, restaurantId: req.user.restaurantId } }),
    ]);
    if (!menuItem)
        throw new AppError(404, 'Menu item not found');
    if (!invItem)
        throw new AppError(404, 'Inventory item not found');
    const link = await prisma.menuItemInventory.upsert({
        where: { menuItemId_inventoryItemId: { menuItemId, inventoryItemId } },
        update: { quantityUsed },
        create: { menuItemId, inventoryItemId, quantityUsed },
    });
    res.json({ success: true, data: link });
}));
export default router;
//# sourceMappingURL=inventory.routes.js.map