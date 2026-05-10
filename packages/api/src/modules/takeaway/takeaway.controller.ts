import type { Request, Response } from 'express';
import * as takeawayService from './takeaway.service.js';

export async function createTakeawayOrder(req: Request, res: Response) {
  const data = req.body;
  const order = await takeawayService.createTakeawayOrder(data);
  res.status(201).json({ success: true, data: order });
}

export async function getTakeawayOrders(req: Request, res: Response) {
  const restaurantId = req.user!.restaurantId!;
  const orders = await takeawayService.getTakeawayOrders(restaurantId);
  res.json({ success: true, data: orders });
}

export async function updateTakeawayStatus(req: Request, res: Response) {
  const orderId = req.params['id']!;
  const restaurantId = req.user!.restaurantId!;
  const { status } = req.body;
  const result = await takeawayService.updateTakeawayStatus(orderId, restaurantId, status);
  res.json({ success: true, data: result });
}
