// ═══════════════════════════════════════════
// DineSmart OS — Orders Module (Service)
// ═══════════════════════════════════════════

import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getRestaurantNamespace } from '../../config/socket.js';
import { SOCKET_EVENTS, SOCKET_ROOMS, TAX_RATE, LOYALTY_POINTS_PER_RUPEE } from '@dinesmart/shared';
import { inventoryQueue } from '../../config/queue.js';
import { logger } from '../../config/logger.js';
import crypto from 'crypto';
import type { CreateOrderInput } from '@dinesmart/shared';

export async function createOrder(data: CreateOrderInput) {
  // Validate table and get restaurant info
  const table = await prisma.table.findUnique({
    where: { id: data.tableId },
    include: { branch: true, restaurant: true },
  });

  if (!table || !table.restaurant.isActive) {
    throw new AppError(404, 'Table not found');
  }

  const restaurantId = table.restaurantId;
  const branchId = table.branchId;

  // Validate & calculate items
  const menuItemIds = data.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
    include: { variants: true, menuItemAddons: { include: { addon: true } } },
  });

  const menuItemMap = new Map(menuItems.map((m: any) => [m.id, m])) as Map<string, any>;

  let subtotal = 0;
  const orderItemsData = data.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) throw new AppError(400, `Menu item ${item.menuItemId} not found or unavailable`);

    let unitPrice = menuItem.price;

    // Add variant price
    if (item.variantId) {
      const variant = menuItem.variants.find((v) => v.id === item.variantId);
      if (!variant) throw new AppError(400, `Variant ${item.variantId} not found`);
      unitPrice += variant.additionalPrice;
    }

    // Add addon prices
    const addonNames: string[] = [];
    if (item.addonIds && item.addonIds.length > 0) {
      for (const addonId of item.addonIds) {
        const addon = menuItem.menuItemAddons.find((mia) => mia.addonId === addonId);
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

  // Apply coupon discount
  let discount = 0;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        restaurantId,
        code: data.couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (coupon && subtotal >= coupon.minOrderValue && coupon.usedCount < coupon.maxUses) {
      if (coupon.discountType === 'PERCENT') {
        discount = (subtotal * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }
      discount = Math.min(discount, subtotal);

      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;

  // Handle customer
  let customerId: string | undefined;
  if (data.customerPhone) {
    const customer = await prisma.customer.upsert({
      where: { restaurantId_phone: { restaurantId, phone: data.customerPhone } },
      update: { name: data.customerName || undefined },
      create: {
        restaurantId,
        phone: data.customerPhone,
        name: data.customerName || null,
      },
    });
    customerId = customer.id;

    // Create loyalty account if not exists
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

  const sessionId = crypto.randomUUID();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        restaurantId,
        branchId,
        tableId: data.tableId,
        sessionId,
        subtotal,
        tax,
        discount,
        total,
        notes: data.notes || '',
        customerId: customerId || null,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: true, variant: true } },
        table: true,
      },
    });

    // Mark table as occupied
    await tx.table.update({
      where: { id: data.tableId },
      data: { isOccupied: true },
    });

    // Increment order counts
    for (const item of data.items) {
      await tx.menuItem.update({
        where: { id: item.menuItemId },
        data: { orderCount: { increment: item.quantity } },
      });
    }

    return newOrder;
  });

  // Emit socket events
  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(branchId)).emit(SOCKET_EVENTS.ORDER_NEW, order);
    ns.to(SOCKET_ROOMS.kitchen(branchId)).emit(SOCKET_EVENTS.ORDER_NEW, order);
    ns.to(SOCKET_ROOMS.table(data.tableId)).emit(SOCKET_EVENTS.ORDER_NEW, order);
    ns.to(SOCKET_ROOMS.billing(branchId)).emit(SOCKET_EVENTS.TABLE_OCCUPIED, { tableId: data.tableId });
  } catch (err) {
    logger.warn('Socket emit failed for order:new', { error: err });
  }

  // Queue inventory deduction
  try {
    await inventoryQueue.add('deduct-stock', {
      orderId: order.id,
      restaurantId,
      branchId,
      items: data.items,
    });
  } catch (err) {
    logger.warn('Failed to queue inventory deduction', { error: err });
  }

  // Create notification
  await prisma.notification.create({
    data: {
      restaurantId,
      branchId,
      type: 'ORDER_NEW',
      title: `New Order #${order.id.slice(-6)}`,
      body: `Table ${order.table.number} placed an order for ₹${total.toFixed(2)}`,
    },
  });

  return order;
}

export async function getOrderBySession(sessionId: string) {
  const orders = await prisma.order.findMany({
    where: { sessionId },
    include: {
      items: { include: { menuItem: true, variant: true } },
      table: true,
      restaurant: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (orders.length === 0) throw new AppError(404, 'Order not found');

  // Calculate Estimation for each order
  const activeOrdersInBranch = await prisma.order.count({
    where: { 
      branchId: orders[0]!.branchId, 
      status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } 
    }
  });

  const ordersWithEst = orders.map(order => {
    // Max prep time of any item in the order
    const maxPrep = Math.max(...order.items.map(i => i.menuItem.preparationTimeMinutes || 15));
    // Load penalty: 5 mins per existing order in the same branch queue
    const queuePenalty = Math.max(0, (activeOrdersInBranch - 1)) * 5;
    
    return {
      ...order,
      estimatedMinutes: maxPrep + queuePenalty
    };
  });

  return ordersWithEst;
}

export async function getOrder(orderId: string, restaurantId?: string) {
  const where: Record<string, unknown> = { id: orderId };
  if (restaurantId) where['restaurantId'] = restaurantId;

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: { include: { menuItem: true, variant: true } },
      table: true,
      payments: true,
      customer: true,
    },
  });

  if (!order) throw new AppError(404, 'Order not found');
  return order;
}

export async function updateOrderStatus(orderId: string, restaurantId: string, status: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });
  if (!order) throw new AppError(404, 'Order not found');

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED' },
    include: { items: { include: { menuItem: true } }, table: true },
  });

  // If completed, handle loyalty points and free table
  if (status === 'COMPLETED' && updated.paymentStatus === 'PAID') {
    if (updated.customerId) {
      const points = Math.floor(updated.total * LOYALTY_POINTS_PER_RUPEE);
      await prisma.loyaltyAccount.updateMany({
        where: { customerId: updated.customerId },
        data: { points: { increment: points }, totalEarned: { increment: points } },
      });
    }

    // Check if all orders for this table are completed
    const activeOrders = await prisma.order.count({
      where: {
        tableId: updated.tableId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    if (activeOrders === 0) {
      await prisma.table.update({
        where: { id: updated.tableId },
        data: { isOccupied: false },
      });

      try {
        const ns = getRestaurantNamespace();
        ns.to(SOCKET_ROOMS.billing(updated.branchId)).emit(SOCKET_EVENTS.TABLE_FREED, { tableId: updated.tableId });
      } catch (err) {
        logger.warn('Socket emit failed', { error: err });
      }
    }
  }

  // Emit status update
  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(updated.branchId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, updated);
    ns.to(SOCKET_ROOMS.kitchen(updated.branchId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, updated);
    ns.to(SOCKET_ROOMS.table(updated.tableId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, updated);
  } catch (err) {
    logger.warn('Socket emit failed', { error: err });
  }

  return updated;
}

export async function updatePayment(orderId: string, restaurantId: string, paymentStatus: string, paymentMethod?: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });
  if (!order) throw new AppError(404, 'Order not found');

  const data: Record<string, unknown> = { paymentStatus };
  if (paymentMethod) data['paymentMethod'] = paymentMethod;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
  });

  if (paymentStatus === 'PAID') {
    await prisma.payment.create({
      data: {
        orderId,
        restaurantId,
        amount: order.total,
        method: (paymentMethod || 'CASH') as 'CASH' | 'UPI' | 'CARD',
        status: 'COMPLETED',
      },
    });

    try {
      const ns = getRestaurantNamespace();
      ns.to(SOCKET_ROOMS.billing(order.branchId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, { orderId, amount: order.total });
      ns.to(SOCKET_ROOMS.table(order.tableId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, { orderId, amount: order.total });
    } catch (err) {
      logger.warn('Socket emit failed', { error: err });
    }
  }

  return updated;
}

export async function initiatePayment(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { restaurant: true },
  });

  if (!order) throw new AppError(404, 'Order not found');

  const { stripe, STRIPE_CONFIG } = await import('../../lib/stripe.js');
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: `Order #${order.id.slice(-6)}`,
          description: `Payment for order at ${order.restaurant.name}`,
        },
        unit_amount: Math.round(order.total * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_CUSTOMER_URL || ""}/order/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_CUSTOMER_URL || ""}/order/${order.id}`,
    metadata: {
      orderId: order.id,
      restaurantId: order.restaurantId,
    },
  });

  await prisma.payment.create({
    data: {
      orderId,
      restaurantId: order.restaurantId,
      amount: order.total,
      method: 'CARD', // Defaulting to card for Stripe
      gatewayOrderId: session.id,
      status: 'PENDING',
    },
  });

  return {
    orderId: order.id,
    stripeSessionId: session.id,
    stripeSessionUrl: session.url,
    amount: Math.round(order.total * 100),
    currency: 'INR',
    restaurantName: order.restaurant.name,
  };
}

export async function handlePaymentWebhook(payload: any) {
  try {
    // In production, verify Stripe webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
    
    const event = payload; // Simple simulation/scaffold
    const { stripe } = await import('../../lib/stripe.js');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId } = session.metadata;

      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: session.id },
      });

      if (!payment) return;

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: session.payment_intent, status: 'COMPLETED' },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PAID', paymentMethod: 'CARD' },
      });

      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
        select: { branchId: true, tableId: true, total: true },
      });

      if (order) {
        try {
          const ns = getRestaurantNamespace();
          ns.to(SOCKET_ROOMS.billing(order.branchId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, {
            orderId: payment.orderId,
            amount: order.total,
          });
          ns.to(SOCKET_ROOMS.table(order.tableId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, {
            orderId: payment.orderId,
            amount: order.total,
          });
        } catch (err) {
          logger.warn('Socket emit failed', { error: err });
        }
      }

      logger.info('Payment confirmed', { orderId: payment.orderId });
    }
  } catch (err) {
    logger.error('Webhook processing failed', { error: err });
  }

  return { success: true };
}

export async function requestPaymentAttention(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { table: true },
  });

  if (!order) throw new AppError(404, 'Order not found');

  // Create notification for staff
  await prisma.notification.create({
    data: {
      restaurantId: order.restaurantId,
      branchId: order.branchId,
      type: 'PAYMENT_ATTENTION',
      title: 'Payment Attention Required',
      body: `Table #${order.table.number} is ready to settle their bill (₹${order.total}).`,
    },
  });

  // Emit socket event to billing and table rooms
  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(order.branchId)).emit('payment:request_at_desk', {
      orderId,
      tableNumber: order.table.number,
      total: order.total,
    });
  } catch (err) {
    logger.warn('Socket emit failed for payment request', { error: err });
  }

  return { success: true };
}
