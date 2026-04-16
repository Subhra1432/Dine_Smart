// ═══════════════════════════════════════════
// DineSmart OS — Auth Routes
// ═══════════════════════════════════════════

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { asyncHandler, authenticate, authRateLimiter } from '../../middleware/index.js';

const router = Router();

router.post('/register', authRateLimiter, asyncHandler(authController.register));
router.post('/login', authRateLimiter, asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/forgot-password', authRateLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password/:token', authRateLimiter, asyncHandler(authController.resetPassword));
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post('/superadmin/login', authRateLimiter, asyncHandler(authController.superAdminLogin));

export default router;
