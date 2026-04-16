// ═══════════════════════════════════════════
// DineSmart OS — Main Application Entry Point
// ═══════════════════════════════════════════

import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initSocketServer } from './config/socket.js';
import { initWorkers } from './config/queue.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticatedRateLimiter } from './middleware/rateLimiter.js';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import restaurantRoutes from './modules/restaurant/restaurant.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import kitchenRoutes from './modules/kitchen/kitchen.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import couponRoutes from './modules/coupons/coupons.routes.js';
import loyaltyRoutes from './modules/loyalty/loyalty.routes.js';
import superadminRoutes from './modules/superadmin/superadmin.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';

const app = express();
const httpServer = createServer(app);

// ── Global Middleware ────────────────────

app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(cors({
  origin: [
    env.FRONTEND_CUSTOMER_URL,
    env.FRONTEND_URL,
    
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// ── Health Check ─────────────────────────

app.get('/', (_req, res) => {
  res.json({
    message: '🚀 DineSmart OS API is alive and kicking!',
    docs: 'https://docs.dinesmart.app',
    health: '/api/health',
    version: '1.0.0'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API Routes ───────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurant', authenticatedRateLimiter, restaurantRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/billing', authenticatedRateLimiter, billingRoutes);
app.use('/api/v1/kitchen', authenticatedRateLimiter, kitchenRoutes);
app.use('/api/v1/analytics', authenticatedRateLimiter, analyticsRoutes);
app.use('/api/v1/inventory', authenticatedRateLimiter, inventoryRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/loyalty', authenticatedRateLimiter, loyaltyRoutes);
app.use('/api/v1/superadmin', superadminRoutes);
app.use('/api/v1/notifications', authenticatedRateLimiter, notificationRoutes);

// ── 404 Handler ──────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global Error Handler ─────────────────

app.use(errorHandler);

// ── Start Server ─────────────────────────

initSocketServer(httpServer);

try {
  initWorkers();
} catch (err) {
  logger.warn('Failed to initialize workers (Redis may not be running)', { error: err });
}

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 DineSmart OS API running on port ${env.PORT}`);
  logger.info(`📊 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API URL: ${env.API_BASE_URL}`);
});

export default app;
