// ═══════════════════════════════════════════
// DineSmart OS — Menu Controller
// ═══════════════════════════════════════════
import * as menuService from './menu.service.js';
import { createCategorySchema, updateCategorySchema, createMenuItemSchema, updateMenuItemSchema, createAddonSchema, updateAddonSchema } from '@dinesmart/shared';
import { cloudinary } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/errorHandler.js';
// ── Categories ───────────────────────────
export async function getCategories(req, res) {
    const data = await menuService.getCategories(req.user.restaurantId);
    res.json({ success: true, data });
}
export async function createCategory(req, res) {
    const body = createCategorySchema.parse(req.body);
    const data = await menuService.createCategory(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateCategory(req, res) {
    const body = updateCategorySchema.parse(req.body);
    const data = await menuService.updateCategory(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteCategory(req, res) {
    await menuService.deleteCategory(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'Category deleted' } });
}
// ── Menu Items ───────────────────────────
export async function getMenuItems(req, res) {
    const categoryId = req.query['categoryId'];
    const data = await menuService.getMenuItems(req.user.restaurantId, categoryId);
    res.json({ success: true, data });
}
export async function createMenuItem(req, res) {
    const body = createMenuItemSchema.parse(req.body);
    const data = await menuService.createMenuItem(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateMenuItem(req, res) {
    const body = updateMenuItemSchema.parse(req.body);
    const data = await menuService.updateMenuItem(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteMenuItem(req, res) {
    await menuService.deleteMenuItem(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'Menu item deleted' } });
}
export async function toggleAvailability(req, res) {
    const data = await menuService.toggleAvailability(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data });
}
// ── Addons ───────────────────────────────
export async function getAddons(req, res) {
    const data = await menuService.getAddons(req.user.restaurantId);
    res.json({ success: true, data });
}
export async function createAddon(req, res) {
    const body = createAddonSchema.parse(req.body);
    const data = await menuService.createAddon(req.user.restaurantId, body);
    res.status(201).json({ success: true, data });
}
export async function updateAddon(req, res) {
    const body = updateAddonSchema.parse(req.body);
    const data = await menuService.updateAddon(req.user.restaurantId, req.params['id'], body);
    res.json({ success: true, data });
}
export async function deleteAddon(req, res) {
    await menuService.deleteAddon(req.user.restaurantId, req.params['id']);
    res.json({ success: true, data: { message: 'Addon deleted' } });
}
// ── Public Menu ──────────────────────────
export async function getPublicMenu(req, res) {
    const slug = req.params['restaurantSlug'];
    const tableId = req.query['tableId'];
    if (!tableId) {
        res.status(400).json({ success: false, error: 'tableId query param is required' });
        return;
    }
    const data = await menuService.getPublicMenu(slug, tableId);
    res.json({ success: true, data });
}
export async function getPublicHistory(req, res) {
    const slug = req.params['restaurantSlug'];
    const phone = req.query['phone'];
    if (!phone) {
        res.status(400).json({ success: false, error: 'phone query param is required' });
        return;
    }
    const data = await menuService.getPublicHistory(slug, phone);
    res.json({ success: true, data });
}
export async function sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, error: 'Phone number is required' });
        return;
    }
    const data = await menuService.sendOtp(phone);
    res.json({ success: true, data });
}
export async function verifyOtp(req, res) {
    const slug = req.params['restaurantSlug'];
    const { phone, code, name } = req.body;
    if (!phone || !code) {
        res.status(400).json({ success: false, error: 'Phone and code are required' });
        return;
    }
    const data = await menuService.verifyOtp(slug, phone, code, name);
    res.json({ success: true, data });
}
export async function uploadImage(req, res) {
    if (!req.file) {
        throw new AppError(400, 'No file uploaded');
    }
    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: `dinesmart/menu/${req.user?.restaurantId || 'general'}`,
            resource_type: 'auto',
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        uploadStream.end(req.file.buffer);
    });
    res.json({ success: true, data: result });
}
//# sourceMappingURL=menu.controller.js.map