// ═══════════════════════════════════════════
// DineSmart OS — Auth Service
// ═══════════════════════════════════════════
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logger } from '../../config/logger.js';
const BCRYPT_ROUNDS = 12;
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + crypto.randomBytes(3).toString('hex');
}
export async function registerRestaurant(data) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw new AppError(409, 'Email already registered');
    }
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const slug = generateSlug(data.restaurantName);
    const result = await prisma.$transaction(async (tx) => {
        const restaurant = await tx.restaurant.create({
            data: {
                name: data.restaurantName,
                slug,
                plan: 'STARTER',
                planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
            },
        });
        const user = await tx.user.create({
            data: {
                restaurantId: restaurant.id,
                email: data.email,
                passwordHash,
                role: 'OWNER',
            },
        });
        // Create a default branch
        const branch = await tx.branch.create({
            data: {
                restaurantId: restaurant.id,
                name: 'Main Branch',
                address: 'Please update your address',
                phone: data.phone,
            },
        });
        return { restaurant, user, branch };
    });
    const tokens = generateTokens(result.user.id, result.restaurant.id, 'OWNER', null, 0);
    logger.info('Restaurant registered', { restaurantId: result.restaurant.id, email: data.email });
    return {
        user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
        },
        restaurant: {
            id: result.restaurant.id,
            name: result.restaurant.name,
            slug: result.restaurant.slug,
        },
        tokens,
    };
}
export async function login(email, password) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { restaurant: true },
    });
    if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid email or password');
    }
    if (!user.restaurant.isActive) {
        throw new AppError(403, 'Restaurant account is suspended');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new AppError(401, 'Invalid email or password');
    }
    const tokens = generateTokens(user.id, user.restaurantId, user.role, user.branchId, user.tokenVersion);
    logger.info('User logged in', { userId: user.id, email });
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            branchId: user.branchId,
        },
        restaurant: {
            id: user.restaurant.id,
            name: user.restaurant.name,
            slug: user.restaurant.slug,
            plan: user.restaurant.plan,
        },
        tokens,
    };
}
export async function refreshAccessToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { restaurant: true },
    });
    if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
        throw new AppError(401, 'Invalid refresh token');
    }
    const tokens = generateTokens(user.id, user.restaurantId, user.role, user.branchId, user.tokenVersion);
    return { tokens };
}
export async function forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Don't reveal whether email exists
        return { message: 'If an account exists, a reset link will be sent' };
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Store in Redis with 1 hour expiry
    const { redis } = await import('../../config/redis.js');
    await redis.set(`reset:${resetTokenHash}`, user.id, 'EX', 3600);
    logger.info('Password reset requested', { userId: user.id, email });
    // In production, send email with resetToken
    return { message: 'If an account exists, a reset link will be sent', resetToken };
}
export async function resetPassword(token, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { redis } = await import('../../config/redis.js');
    const userId = await redis.get(`reset:${tokenHash}`);
    if (!userId) {
        throw new AppError(400, 'Invalid or expired reset token');
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash,
            tokenVersion: { increment: 1 },
        },
    });
    await redis.del(`reset:${tokenHash}`);
    logger.info('Password reset completed', { userId });
    return { message: 'Password reset successfully' };
}
export async function logout(userId) {
    await prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
    });
}
function generateTokens(userId, restaurantId, role, branchId, tokenVersion) {
    const accessPayload = {
        userId,
        restaurantId,
        role: role,
        branchId,
    };
    const refreshPayload = {
        userId,
        tokenVersion,
    };
    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
}
// Super Admin auth
export async function superAdminLogin(email, password) {
    const admin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!admin) {
        throw new AppError(401, 'Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
        throw new AppError(401, 'Invalid credentials');
    }
    const token = jwt.sign({ superAdminId: admin.id, scope: 'superadmin' }, env.JWT_SUPERADMIN_SECRET, { expiresIn: '8h' });
    return { token, admin: { id: admin.id, email: admin.email } };
}
//# sourceMappingURL=auth.service.js.map