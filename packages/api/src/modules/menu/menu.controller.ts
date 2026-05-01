// ═══════════════════════════════════════════
// DineSmart OS — Menu Controller
// ═══════════════════════════════════════════

import type { Request, Response } from 'express';
import * as menuService from './menu.service.js';
import { createCategorySchema, updateCategorySchema, createMenuItemSchema, updateMenuItemSchema, createAddonSchema, updateAddonSchema } from '@dinesmart/shared';
import { cloudinary } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/errorHandler.js';

// ── Categories ───────────────────────────

export async function getCategories(req: Request, res: Response) {
  const data = await menuService.getCategories(req.user!.restaurantId);
  res.json({ success: true, data });
}

export async function createCategory(req: Request, res: Response) {
  const body = createCategorySchema.parse(req.body);
  const data = await menuService.createCategory(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateCategory(req: Request, res: Response) {
  const body = updateCategorySchema.parse(req.body);
  const data = await menuService.updateCategory(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteCategory(req: Request, res: Response) {
  await menuService.deleteCategory(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'Category deleted' } });
}

// ── Menu Items ───────────────────────────

export async function getMenuItems(req: Request, res: Response) {
  const categoryId = req.query['categoryId'] as string | undefined;
  const data = await menuService.getMenuItems(req.user!.restaurantId, categoryId);
  res.json({ success: true, data });
}

export async function createMenuItem(req: Request, res: Response) {
  const body = createMenuItemSchema.parse(req.body);
  const data = await menuService.createMenuItem(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateMenuItem(req: Request, res: Response) {
  const body = updateMenuItemSchema.parse(req.body);
  const data = await menuService.updateMenuItem(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteMenuItem(req: Request, res: Response) {
  await menuService.deleteMenuItem(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'Menu item deleted' } });
}

export async function toggleAvailability(req: Request, res: Response) {
  const data = await menuService.toggleAvailability(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data });
}

// ── Addons ───────────────────────────────

export async function getAddons(req: Request, res: Response) {
  const data = await menuService.getAddons(req.user!.restaurantId);
  res.json({ success: true, data });
}

export async function createAddon(req: Request, res: Response) {
  const body = createAddonSchema.parse(req.body);
  const data = await menuService.createAddon(req.user!.restaurantId, body);
  res.status(201).json({ success: true, data });
}

export async function updateAddon(req: Request, res: Response) {
  const body = updateAddonSchema.parse(req.body);
  const data = await menuService.updateAddon(req.user!.restaurantId, req.params['id']!, body);
  res.json({ success: true, data });
}

export async function deleteAddon(req: Request, res: Response) {
  await menuService.deleteAddon(req.user!.restaurantId, req.params['id']!);
  res.json({ success: true, data: { message: 'Addon deleted' } });
}

// ── Public Menu ──────────────────────────

export async function getPublicMenu(req: Request, res: Response) {
  const slug = req.params['restaurantSlug']!;
  const tableId = req.query['tableId'] as string;
  if (!tableId) {
    res.status(400).json({ success: false, error: 'tableId query param is required' });
    return;
  }
  const data = await menuService.getPublicMenu(slug, tableId);
  res.json({ success: true, data });
}

export async function getPublicHistory(req: Request, res: Response) {
  const slug = req.params['restaurantSlug']!;
  const phone = req.query['phone'] as string;
  if (!phone) {
    res.status(400).json({ success: false, error: 'phone query param is required' });
    return;
  }
  const data = await menuService.getPublicHistory(slug, phone);
  res.json({ success: true, data });
}

export async function sendOtp(req: Request, res: Response) {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ success: false, error: 'Phone number is required' });
    return;
  }
  const data = await menuService.sendOtp(phone);
  res.json({ success: true, data });
}

export async function verifyOtp(req: Request, res: Response) {
  const slug = req.params['restaurantSlug']!;
  const { phone, code, name } = req.body;
  if (!phone || !code) {
    res.status(400).json({ success: false, error: 'Phone and code are required' });
    return;
  }
  const data = await menuService.verifyOtp(slug, phone, code, name);
  res.json({ success: true, data });
}

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  // Upload to Cloudinary using buffer
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `dinesmart/menu/${req.user?.restaurantId || 'general'}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file!.buffer);
  });

  res.json({ success: true, data: result });
}
