import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getRestaurantNamespace } from '../../config/socket.js';
import { SOCKET_EVENTS, SOCKET_ROOMS, TAX_RATE, LOYALTY_POINTS_PER_RUPEE } from '@dinesmart/shared';
import { inventoryQueue } from '../../config/queue.js';
import { logger } from '../../config/logger.js';
import crypto from 'crypto';

export async function createTakeawayOrder(data: any) {
  // We need branchId and restaurantId. We will look up the branch.
  const branch = await prisma.branch.findUnique({
    where: { id: data.branchId },
    include: { restaurant: true },
  });

  if (!branch || !branch.restaurant.isActive) {
    throw new AppError(404, 'Branch not found or inactive');
  }

  const restaurantId = branch.restaurantId;
  const sessionId = crypto.randomUUID();

  // Validate & calculate items
  const menuItemIds = data.items.map((i: any) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
    include: { variants: true, menuItemAddons: { include: { addon: true } } },
  });

  const menuItemMap = new Map(menuItems.map((m: any) => [m.id, m]));

  let subtotal = 0;
  const orderItemsData = data.items.map((item: any) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) throw new AppError(400, `Menu item ${item.menuItemId} not found or unavailable`);

    let unitPrice = menuItem.price;

    if (item.variantId) {
      const variant = menuItem.variants.find((v: any) => v.id === item.variantId);
      if (!variant) throw new AppError(400, `Variant ${item.variantId} not found`);
      unitPrice += variant.additionalPrice;
    }

    const addonNames: string[] = [];
    if (item.addonIds && item.addonIds.length > 0) {
      for (const addonId of item.addonIds) {
        const addon = menuItem.menuItemAddons.find((mia: any) => mia.addonId === addonId);
        if (!addon) throw new AppError(400, `Addon ${addonId} not available for this item`);
        unitPrice += addon.addon.price;
        addonNames.push(addon.addon.name);
      }
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      menuItemId: item.menuItemId,
      variantId: item.variantId || null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      addons: addonNames,
      specialInstructions: item.specialInstructions || '',
    };
  });

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Handle customer
  let customerId: string | undefined;
  if (data.customerPhone) {
    const cleanPhone = data.customerPhone.replace(/\s+/g, '');
    let customer = await prisma.customer.findFirst({
      where: { restaurantId, phone: { endsWith: cleanPhone.replace(/^\+91/, '') } },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          restaurantId,
          phone: cleanPhone,
          name: data.customerName || null,
        },
      });
    } else if (data.customerName) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: data.customerName },
      });
    }
    customerId = customer.id;

    await prisma.loyaltyAccount.upsert({
      where: { customerId: customer.id },
      update: {},
      create: {
        restaurantId,
        customerId: customer.id,
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
      },
    });
  }

  // Generate a display ID like TA-XXXX
  const displayId = `TA-${Math.floor(1000 + Math.random() * 9000)}`;

  let initialStatus: any = branch.requireOrderVerification ? 'PENDING' : 'CONFIRMED';

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        displayId,
        restaurantId,
        branchId: branch.id,
        sessionId,
        type: 'TAKE_AWAY',
        status: initialStatus,
        subtotal,
        tax,
        discount: 0,
        total,
        notes: data.notes || '',
        customerId: customerId || null,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: true, variant: true } },
        customer: true,
      },
    });

    for (const item of data.items) {
      await tx.menuItem.update({
        where: { id: item.menuItemId },
        data: { orderCount: { increment: item.quantity } },
      });
    }

    return newOrder;
  });

  // Emit socket events to staff dashboard
  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(branch.id)).emit(SOCKET_EVENTS.ORDER_NEW, order);
    ns.to(SOCKET_ROOMS.kitchen(branch.id)).emit(SOCKET_EVENTS.ORDER_NEW, order);
  } catch (err) {
    logger.warn('Socket emit failed for order:new', { error: err });
  }

  // Queue inventory deduction
  try {
    await inventoryQueue.add('deduct-stock', {
      orderId: order.id,
      restaurantId,
      branchId: branch.id,
      items: data.items,
    });
  } catch (err) {
    logger.warn('Failed to queue inventory deduction', { error: err });
  }

  return order;
}

export async function getTakeawayOrders(restaurantId: string) {
  const orders = await prisma.order.findMany({
    where: { 
      restaurantId, 
      type: 'TAKE_AWAY',
      isArchived: false,
    },
    include: {
      items: { include: { menuItem: true, variant: true } },
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { items: orders, total: orders.length };
}

export async function updateTakeawayStatus(orderId: string, restaurantId: string, status: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });
  if (!order) throw new AppError(404, 'Order not found');

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
    include: { items: { include: { menuItem: true } }, customer: true },
  });

  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(updated.branchId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, updated);
    ns.to(SOCKET_ROOMS.kitchen(updated.branchId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, updated);
  } catch (err) {
    logger.warn('Socket emit failed', { error: err });
  }

  return updated;
}
