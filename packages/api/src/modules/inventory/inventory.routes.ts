// ═══════════════════════════════════════════
// DineSmart OS — Inventory Module
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { asyncHandler, authenticate, requireRole } from '../../middleware/index.js';
import { 
  createInventoryItemSchema, 
  updateInventoryItemSchema, 
  updateStockSchema,
  createInventoryCategorySchema
} from '@dinesmart/shared';
import { logger } from '../../config/logger.js';

const router = Router();
router.use(authenticate);
router.use(requireRole(['OWNER', 'MANAGER']));

// ── Categories ───────────────────────────

router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.inventoryCategory.findMany({
    where: { restaurantId: req.user!.restaurantId },
    include: { _count: { select: { inventoryItems: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: categories });
}));

router.post('/categories', asyncHandler(async (req: Request, res: Response) => {
  const body = createInventoryCategorySchema.parse(req.body);
  const category = await prisma.inventoryCategory.create({
    data: { ...body, restaurantId: req.user!.restaurantId },
  });
  res.status(201).json({ success: true, data: category });
}));

router.delete('/categories/:id', asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.inventoryCategory.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!category) throw new AppError(404, 'Category not found');

  await prisma.inventoryCategory.delete({ where: { id: category.id } });
  res.json({ success: true, message: 'Category deleted' });
}));

// ── Items ────────────────────────────────

// Get all inventory items
router.get('/items', asyncHandler(async (req: Request, res: Response) => {
  const branchId = req.query['branchId'] as string | undefined;
  const where: Record<string, unknown> = { restaurantId: req.user!.restaurantId };
  if (branchId) where['branchId'] = branchId;

  const items = await prisma.inventoryItem.findMany({
    where,
    include: {
      branch: { select: { name: true } },
      category: { select: { name: true } },
      menuItemInventory: { include: { menuItem: { select: { id: true, name: true } } } },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: items });
}));

// Create inventory item
router.post('/items', asyncHandler(async (req: Request, res: Response) => {
  const body = createInventoryItemSchema.parse(req.body);
  const branch = await prisma.branch.findFirst({
    where: { id: body.branchId, restaurantId: req.user!.restaurantId },
  });
  if (!branch) throw new AppError(404, 'Branch not found');

  const { categoryId, ...itemData } = body;
  const item = await prisma.inventoryItem.create({
    data: { 
      ...itemData,
      restaurantId: req.user!.restaurantId,
      categoryId: categoryId || null
    },
  });

  // Log initial stock
  await prisma.stockHistory.create({
    data: {
      inventoryItemId: item.id,
      changeDelta: body.currentStock,
      reason: 'Initial stock entry',
      userId: req.user!.userId,
    },
  });

  res.status(201).json({ success: true, data: item });
}));

// Update inventory item
router.put('/items/:id', asyncHandler(async (req: Request, res: Response) => {
  const body = updateInventoryItemSchema.parse(req.body);
  const item = await prisma.inventoryItem.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!item) throw new AppError(404, 'Inventory item not found');

  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: body,
  });

  res.json({ success: true, data: updated });
}));

// Manual stock update
router.put('/items/:id/stock', asyncHandler(async (req: Request, res: Response) => {
  const { quantity, reason } = updateStockSchema.parse(req.body);
  const item = await prisma.inventoryItem.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!item) throw new AppError(404, 'Inventory item not found');

  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { currentStock: { increment: quantity } },
  });

  await prisma.stockHistory.create({
    data: {
      inventoryItemId: item.id,
      changeDelta: quantity,
      reason,
      userId: req.user!.userId,
    },
  });

  logger.info('Stock updated manually', {
    inventoryItemId: item.id,
    delta: quantity,
    newStock: updated.currentStock,
    userId: req.user!.userId,
  });

  res.json({ success: true, data: updated });
}));

// Get low stock alerts
router.get('/alerts', asyncHandler(async (req: Request, res: Response) => {
  // Prisma doesn't support self-referencing in where, use raw filter
  const allItems = await prisma.inventoryItem.findMany({
    where: { restaurantId: req.user!.restaurantId },
    include: { branch: { select: { name: true } } },
  });

  const lowStock = allItems.filter((item) => item.currentStock <= item.minThreshold);

  res.json({ success: true, data: lowStock });
}));

// Link menu item to inventory
router.post('/link', asyncHandler(async (req: Request, res: Response) => {
  const { menuItemId, inventoryItemId, quantityUsed } = req.body as {
    menuItemId: string;
    inventoryItemId: string;
    quantityUsed: number;
  };

  const [menuItem, invItem] = await Promise.all([
    prisma.menuItem.findFirst({ where: { id: menuItemId, restaurantId: req.user!.restaurantId } }),
    prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, restaurantId: req.user!.restaurantId } }),
  ]);

  if (!menuItem) throw new AppError(404, 'Menu item not found');
  if (!invItem) throw new AppError(404, 'Inventory item not found');

  const link = await prisma.menuItemInventory.upsert({
    where: { menuItemId_inventoryItemId: { menuItemId, inventoryItemId } },
    update: { quantityUsed },
    create: { menuItemId, inventoryItemId, quantityUsed },
  });

  res.json({ success: true, data: link });
}));

// Delete inventory item
router.delete('/items/:id', asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: req.params['id']!, restaurantId: req.user!.restaurantId },
  });
  if (!item) throw new AppError(404, 'Inventory item not found');

  await prisma.inventoryItem.delete({
    where: { id: item.id },
  });

  res.json({ success: true, message: 'Item deleted' });
}));

export default router;
