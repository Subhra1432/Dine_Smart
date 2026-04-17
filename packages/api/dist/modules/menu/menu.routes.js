// ═══════════════════════════════════════════
// DineSmart OS — Menu Routes
// ═══════════════════════════════════════════
import { Router } from 'express';
import * as ctrl from './menu.controller.js';
import { asyncHandler, authenticate, requireRole, publicRateLimiter } from '../../middleware/index.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
// Public menu endpoint
router.get('/public/:restaurantSlug', publicRateLimiter, asyncHandler(ctrl.getPublicMenu));
router.get('/public/:restaurantSlug/history', publicRateLimiter, asyncHandler(ctrl.getPublicHistory));
router.post('/public/:restaurantSlug/send-otp', publicRateLimiter, asyncHandler(ctrl.sendOtp));
router.post('/public/:restaurantSlug/verify-otp', publicRateLimiter, asyncHandler(ctrl.verifyOtp));
// Protected routes below
// Categories
router.get('/categories', authenticate, asyncHandler(ctrl.getCategories));
router.post('/categories', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.createCategory));
router.put('/categories/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateCategory));
router.delete('/categories/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteCategory));
// Menu Items
router.get('/items', authenticate, asyncHandler(ctrl.getMenuItems));
router.post('/items', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.createMenuItem));
router.put('/items/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateMenuItem));
router.delete('/items/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteMenuItem));
router.post('/items/:id/toggle-availability', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.toggleAvailability));
router.post('/upload-image', authenticate, requireRole(['OWNER', 'MANAGER']), upload.single('file'), asyncHandler(ctrl.uploadImage));
// Addons
router.get('/addons', authenticate, asyncHandler(ctrl.getAddons));
router.post('/addons', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.createAddon));
router.put('/addons/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.updateAddon));
router.delete('/addons/:id', authenticate, requireRole(['OWNER', 'MANAGER']), asyncHandler(ctrl.deleteAddon));
export default router;
//# sourceMappingURL=menu.routes.js.map