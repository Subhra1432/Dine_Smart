// ═══════════════════════════════════════════
// DineSmart OS — Restaurant Controller
// ═══════════════════════════════════════════

import type { Request, Response } from 'express';
import * as restaurantService from './restaurant.service.js';
import { updateRestaurantSchema, createBranchSchema, updateBranchSchema, createTableSchema, updateTableSchema, createUserSchema, updateUserSchema } from '@dinesmart/shared';

export async function getProfile(req: Request, res: Response) {
  const data = await restaurantService.getProfile(req.user!.restaurantId);
  res.json({ success: true, data });
}

export async function updateProfile(req: Request, res: Response) {
  const body = updateRestaurantSchema.parse(req.body);
  const data = await restaurantService.updateProfile(req.user!.restaurantId, body);
  res.json({ success: true, data });
}

export async function getBranches(req: Request, res: Response) {
  const data = await restaurantService.getBranches(req.user!.restaurantId);
  res.json({ success: true, data });
}

export async function createBranch(req: Request, res: Response) {
  const body = createBranchSchema.parse(req.body);
  const data = await restaurantService.createBranch(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateBranch(req: Request, res: Response) {
  const body = updateBranchSchema.parse(req.body);
  const data = await restaurantService.updateBranch(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteBranch(req: Request, res: Response) {
  await restaurantService.deleteBranch(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'Branch deleted' } });
}

export async function getTables(req: Request, res: Response) {
  const branchId = req.query['branchId'] as string | undefined;
  const data = await restaurantService.getTables(req.user!.restaurantId, branchId);
  res.json({ success: true, data });
}

export async function createTable(req: Request, res: Response) {
  const body = createTableSchema.parse(req.body);
  const data = await restaurantService.createTable(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateTable(req: Request, res: Response) {
  const body = updateTableSchema.parse(req.body);
  const data = await restaurantService.updateTable(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteTable(req: Request, res: Response) {
  await restaurantService.deleteTable(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'Table deleted' } });
}

export async function getTableQR(req: Request, res: Response) {
  const buffer = await restaurantService.getTableQR(req.user!.restaurantId, req.params['id']!, req);
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

export async function getUsers(req: Request, res: Response) {
  const data = await restaurantService.getUsers(req.user!.restaurantId);
  res.json({ success: true, data });
}

export async function createUser(req: Request, res: Response) {
  const body = createUserSchema.parse(req.body);
  const data = await restaurantService.createUser(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateUser(req: Request, res: Response) {
  const body = updateUserSchema.parse(req.body);
  const data = await restaurantService.updateUser(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteUser(req: Request, res: Response) {
  await restaurantService.deleteUser(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'User deleted' } });
}
