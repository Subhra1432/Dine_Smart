// ═══════════════════════════════════════════
// DineSmart OS — Orders Controller
// ═══════════════════════════════════════════
import * as ordersService from './orders.service.js';
import { createOrderSchema, razorpayWebhookSchema, createReviewSchema } from '@dinesmart/shared';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
export async function createOrder(req, res) {
    const body = createOrderSchema.parse(req.body);
    const order = await ordersService.createOrder(body);
    res.status(201).json({ success: true, data: order });
}
export async function getOrderBySession(req, res) {
    const sessionId = req.params['sessionId'];
    const orders = await ordersService.getOrderBySession(sessionId);
    res.json({ success: true, data: orders });
}
export async function initiatePayment(req, res) {
    const orderId = req.params['orderId'];
    const data = await ordersService.initiatePayment(orderId);
    res.json({ success: true, data });
}
export async function paymentWebhook(req, res) {
    const payload = razorpayWebhookSchema.parse(req.body);
    const result = await ordersService.handlePaymentWebhook(payload);
    res.json({ success: true, data: result });
}
export async function createReview(req, res) {
    const body = createReviewSchema.parse(req.body);
    const order = await prisma.order.findUnique({
        where: { id: body.orderId },
        select: { id: true, restaurantId: true, status: true, paymentStatus: true },
    });
    if (!order)
        throw new AppError(404, 'Order not found');
    if (order.status !== 'COMPLETED' && order.status !== 'SERVED' && order.paymentStatus !== 'PAID') {
        throw new AppError(400, 'Can only review completed or paid orders');
    }
    const review = await prisma.review.create({
        data: {
            orderId: body.orderId,
            restaurantId: order.restaurantId,
            rating: body.rating,
            comment: body.comment || '',
            itemRatings: body.itemRatings || {},
        },
    });
    res.status(201).json({ success: true, data: review });
}
export async function requestPayment(req, res) {
    const orderId = req.params['orderId'];
    await ordersService.requestPaymentAttention(orderId);
    res.json({ success: true, message: 'Payment attention requested' });
}
//# sourceMappingURL=orders.controller.js.map