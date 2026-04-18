// ═══════════════════════════════════════════
// DineSmart OS — Billing Module
// ═══════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { asyncHandler, authenticate, requireRole } from '../../middleware/index.js';
import { orderFilterSchema, updateOrderStatusSchema, updatePaymentStatusSchema, refundSchema } from '@dinesmart/shared';
import * as ordersService from '../orders/orders.service.js';

const router = Router();
router.use(authenticate);
router.use(requireRole(['OWNER', 'MANAGER', 'CASHIER']));

// Get all tables with status
router.get('/tables', asyncHandler(async (req: Request, res: Response) => {
  const tables = await prisma.table.findMany({
    where: { restaurantId: req.user!.restaurantId },
    include: {
      branch: { select: { name: true } },
      orders: {
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        include: { 
          items: { include: { menuItem: true } },
          customer: true
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: [{ branchId: 'asc' }, { number: 'asc' }],
  });

  const tablesWithStatus = tables.map((table) => {
    const activeOrder = table.orders[0];
    const isDelayed = activeOrder && (Date.now() - activeOrder.createdAt.getTime()) > 20 * 60 * 1000;
    return {
      ...table,
      status: !table.isOccupied ? 'FREE' : isDelayed ? 'DELAYED' : 'OCCUPIED',
      activeOrder: activeOrder || null,
    };
  });

  res.json({ success: true, data: tablesWithStatus });
}));

// Get filtered orders
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  const filters = orderFilterSchema.parse(req.query);
  const where: Record<string, unknown> = { restaurantId: req.user!.restaurantId };

  if (filters.status) where['status'] = filters.status;
  if (filters.paymentStatus) where['paymentStatus'] = filters.paymentStatus;
  if (filters.tableId) where['tableId'] = filters.tableId;
  if (filters.branchId) where['branchId'] = filters.branchId;
  if (filters.dateFrom || filters.dateTo) {
    where['createdAt'] = {
      ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
    };
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        customer: true,
        table: true,
        payments: true,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: { items, page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  });
}));

// Get order detail
router.get('/orders/:orderId', asyncHandler(async (req: Request, res: Response) => {
  const order = await ordersService.getOrder(req.params['orderId']!, req.user!.restaurantId);
  res.json({ success: true, data: order });
}));

// Update order status
router.put('/orders/:orderId/status', requireRole(['MANAGER', 'CASHIER']), asyncHandler(async (req: Request, res: Response) => {
  const { status } = updateOrderStatusSchema.parse(req.body);
  const data = await ordersService.updateOrderStatus(req.params['orderId']!, req.user!.restaurantId, status);
  res.json({ success: true, data });
}));

// Update payment
router.put('/orders/:orderId/payment', requireRole(['MANAGER', 'CASHIER']), asyncHandler(async (req: Request, res: Response) => {
  const { paymentStatus, paymentMethod } = updatePaymentStatusSchema.parse(req.body);
  const data = await ordersService.updatePayment(req.params['orderId']!, req.user!.restaurantId, paymentStatus, paymentMethod);
  res.json({ success: true, data });
}));

// Print bill
router.post('/orders/:orderId/print-bill', asyncHandler(async (req: Request, res: Response) => {
  const order = await ordersService.getOrder(req.params['orderId']!, req.user!.restaurantId);
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } });

  const billHtml = `<!DOCTYPE html>
<html><head><style>
  body { font-family: monospace; width: 300px; margin: 0 auto; padding: 10px; font-size: 12px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; }
  .bold { font-weight: bold; }
  h2 { margin: 5px 0; }
</style></head><body>
  <div class="center">
    <h2>${restaurant?.name || 'DineSmart Restaurant'}</h2>
    <p>Table #${(order as Record<string, unknown>).table ? ((order as Record<string, unknown>).table as Record<string, unknown>)['number'] : ''}</p>
    <p>Order #${order.id.slice(-8).toUpperCase()}</p>
    <p>${new Date(order.createdAt).toLocaleString('en-IN')}</p>
  </div>
  <div class="divider"></div>
  ${order.items.map((item) => `
    <div class="row">
      <span>${item.quantity}x ${item.menuItem.name}</span>
      <span>₹${item.totalPrice.toFixed(2)}</span>
    </div>
    ${item.specialInstructions ? `<div style="font-size:10px;color:#666;margin-left:20px">${item.specialInstructions}</div>` : ''}
  `).join('')}
  <div class="divider"></div>
  <div class="row"><span>Subtotal</span><span>₹${order.subtotal.toFixed(2)}</span></div>
  ${order.discount > 0 ? `<div class="row"><span>Discount</span><span>-₹${order.discount.toFixed(2)}</span></div>` : ''}
  <div class="row"><span>Tax (5%)</span><span>₹${order.tax.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="row bold"><span>TOTAL</span><span>₹${order.total.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="center"><p>Thank you for dining with us!</p><p>Powered by DineSmart OS</p></div>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(billHtml);
}));

// Daily Summary Bill for a Customer (aggregates all orders of the day)
router.post('/customer-summary-bill', asyncHandler(async (req: Request, res: Response) => {
  const { customerId } = req.body as { customerId: string };
  if (!customerId) throw new AppError(400, 'Customer ID is required');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } });
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const orders = await prisma.order.findMany({
    where: {
      restaurantId: req.user!.restaurantId,
      customerId,
      createdAt: { gte: today },
      status: { notIn: ['CANCELLED'] }
    },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'asc' }
  });

  if (orders.length === 0) throw new AppError(404, 'No orders found for this customer today');

  // Aggregate stats
  let totalSubtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalAmount = 0;
  const allItems: any[] = [];

  orders.forEach(o => {
    totalSubtotal += o.subtotal;
    totalDiscount += o.discount;
    totalTax += o.tax;
    totalAmount += o.total;
    allItems.push(...o.items);
  });

  // Group identical items together for the summary
  const groupedItemsMap = new Map<string, any>();
  allItems.forEach(item => {
    const key = item.menuItem.name;
    if (groupedItemsMap.has(key)) {
      const existing = groupedItemsMap.get(key);
      existing.quantity += item.quantity;
      existing.totalPrice += item.totalPrice;
    } else {
      groupedItemsMap.set(key, { ...item });
    }
  });
  const groupedItems = Array.from(groupedItemsMap.values());

  const summaryHtml = `<!DOCTYPE html>
<html><head><style>
  body { font-family: monospace; width: 300px; margin: 0 auto; padding: 10px; font-size: 12px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; }
  .bold { font-weight: bold; }
  h2 { margin: 5px 0; }
  .pill { font-size: 10px; background: #eee; padding: 2px 6px; border-radius: 4px; }
</style></head><body>
  <div class="center">
    <h2>${restaurant?.name || 'DineSmart Restaurant'}</h2>
    <p class="pill">CUMULATIVE DAILY SUMMARY</p>
    <p>Customer: ${customer?.name || 'Guest'} (${customer?.phone || ''})</p>
    <p>Date: ${today.toLocaleDateString('en-IN')}</p>
    <p>Orders included: ${orders.length}</p>
  </div>
  <div class="divider"></div>
  <div class="bold" style="margin-bottom:5px">CONSOLIDATED ITEMS:</div>
  ${groupedItems.map((item) => `
    <div class="row">
      <span>${item.quantity}x ${item.menuItem.name}</span>
      <span>₹${item.totalPrice.toFixed(2)}</span>
    </div>
  `).join('')}
  <div class="divider"></div>
  <div class="row"><span>Day Subtotal</span><span>₹${totalSubtotal.toFixed(2)}</span></div>
  ${totalDiscount > 0 ? `<div class="row"><span>Total Discount</span><span>-₹${totalDiscount.toFixed(2)}</span></div>` : ''}
  <div class="row"><span>Total Tax</span><span>₹${totalTax.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="row bold" style="font-size:14px"><span>GRAND TOTAL</span><span>₹${totalAmount.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="center">
    <p>This is a consolidated daily summary bill.</p>
    <p>Thank you for your visit today!</p>
  </div>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(summaryHtml);
}));

// Refund
router.post('/orders/:orderId/refund', requireRole(['MANAGER', 'CASHIER']), asyncHandler(async (req: Request, res: Response) => {
  const { reason } = refundSchema.parse(req.body);
  const order = await prisma.order.findFirst({
    where: { id: req.params['orderId']!, restaurantId: req.user!.restaurantId },
  });
  if (!order) throw new AppError(404, 'Order not found');

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      restaurantId: req.user!.restaurantId,
      amount: -order.total,
      method: (order.paymentMethod || 'CASH') as 'CASH' | 'UPI' | 'CARD',
      status: `REFUNDED: ${reason}`,
    },
  });

  res.json({ success: true, data: { message: 'Refund processed', orderId: order.id } });
}));

// Edit order item (before preparation)
router.put('/orders/:orderId/items/:itemId', requireRole(['MANAGER', 'CASHIER']), asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.orderItem.findFirst({
    where: { id: req.params['itemId']!, orderId: req.params['orderId']! },
  });
  if (!item) throw new AppError(404, 'Order item not found');
  if (item.status !== 'PENDING') throw new AppError(400, 'Can only edit items that are not yet being prepared');

  const { quantity, specialInstructions } = req.body as { quantity?: number; specialInstructions?: string };
  const updateData: Record<string, unknown> = {};
  if (quantity !== undefined) {
    updateData['quantity'] = quantity;
    updateData['totalPrice'] = item.unitPrice * quantity;
  }
  if (specialInstructions !== undefined) updateData['specialInstructions'] = specialInstructions;

  const updated = await prisma.orderItem.update({ where: { id: item.id }, data: updateData });

  // Recalculate order total
  const allItems = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const subtotal = allItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const order = await prisma.order.findUnique({ where: { id: item.orderId } });
  const tax = (subtotal - (order?.discount || 0)) * 0.05;
  const total = subtotal - (order?.discount || 0) + tax;

  await prisma.order.update({
    where: { id: item.orderId },
    data: { subtotal, tax, total },
  });

  res.json({ success: true, data: updated });
}));

export default router;
