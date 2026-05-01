// ═══════════════════════════════════════════
// DineSmart OS — Orders Routes (Public)
// ═══════════════════════════════════════════

import { Router } from 'express';
import * as ctrl from './orders.controller.js';
import { asyncHandler, publicRateLimiter } from '../../middleware/index.js';

const router = Router();

router.post('/', publicRateLimiter, asyncHandler(ctrl.createOrder));
router.get('/:sessionId', publicRateLimiter, asyncHandler(ctrl.getOrderBySession));
router.put('/:orderId/items/:itemId', publicRateLimiter, asyncHandler(ctrl.updatePublicOrderItem));
router.post('/:orderId/payment/initiate', publicRateLimiter, asyncHandler(ctrl.initiatePayment));
router.post('/:orderId/payment/mock', publicRateLimiter, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { prisma } = await import('../../config/database.js');
  const { getRestaurantNamespace } = await import('../../config/socket.js');
  const { SOCKET_EVENTS, SOCKET_ROOMS } = await import('@dinesmart/shared');
  
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID', paymentMethod: 'UPI' }
  });
  
  await prisma.payment.create({
    data: {
      orderId,
      restaurantId: order.restaurantId,
      amount: order.total,
      method: 'UPI',
      status: 'COMPLETED',
      gatewayOrderId: 'mock_' + Math.random().toString(36).substring(7),
      gatewayPaymentId: 'pay_' + Math.random().toString(36).substring(7),
    }
  });
  
  try {
    const ns = getRestaurantNamespace();
    ns.to(SOCKET_ROOMS.billing(order.branchId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, { orderId, amount: order.total });
    ns.to(SOCKET_ROOMS.table(order.tableId)).emit(SOCKET_EVENTS.PAYMENT_CONFIRMED, { orderId, amount: order.total });
  } catch (err) {}
  
  res.json({ success: true });
}));
router.post('/payment/webhook', asyncHandler(ctrl.paymentWebhook));
router.post('/:orderId/request-payment', publicRateLimiter, asyncHandler(ctrl.requestPayment));
router.post('/reviews', publicRateLimiter, asyncHandler(ctrl.createReview));

export default router;
