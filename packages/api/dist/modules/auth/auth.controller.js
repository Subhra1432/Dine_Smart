// ═══════════════════════════════════════════
// DineSmart OS — Auth Controller
// ═══════════════════════════════════════════
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@dinesmart/shared';
import * as authService from './auth.service.js';
import { env } from '../../config/env.js';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
};
export async function register(req, res) {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerRestaurant(data);
    res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
        success: true,
        data: { user: result.user, restaurant: result.restaurant },
    });
}
export async function login(req, res) {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
        success: true,
        data: { user: result.user, restaurant: result.restaurant },
    });
}
export async function refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ success: false, error: 'Refresh token required' });
        return;
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { message: 'Token refreshed' } });
}
export async function logout(req, res) {
    if (req.user) {
        await authService.logout(req.user.userId);
    }
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
}
export async function forgotPassword(req, res) {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    res.json({ success: true, data: result });
}
export async function resetPassword(req, res) {
    const token = req.params['token'];
    if (!token) {
        res.status(400).json({ success: false, error: 'Token is required' });
        return;
    }
    const { password } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token, password);
    res.json({ success: true, data: result });
}
export async function getMe(req, res) {
    const { prisma } = await import('../../config/database.js');
    if (!req.user?.userId) {
        throw new AppError(401, 'Invalid session');
    }
    const [user, restaurant] = await Promise.all([
        prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, role: true, restaurantId: true, branchId: true, isActive: true }
        }),
        req.user.restaurantId ? prisma.restaurant.findUnique({
            where: { id: req.user.restaurantId },
            select: { id: true, name: true, slug: true, plan: true }
        }) : null
    ]);
    if (!user || !user.isActive) {
        throw new AppError(401, 'User no longer exists or is inactive');
    }
    res.json({ success: true, data: { user, restaurant } });
}
export async function superAdminLogin(req, res) {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.superAdminLogin(email, password);
    res.cookie('superAdminToken', result.token, {
        ...COOKIE_OPTIONS,
        maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { admin: result.admin } });
}
//# sourceMappingURL=auth.controller.js.map