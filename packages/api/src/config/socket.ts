// ═══════════════════════════════════════════
// DineSmart OS — Socket.io Server Configuration
// ═══════════════════════════════════════════

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from './redis.js';
import { env } from './env.js';
import { logger } from './logger.js';
import jwt from 'jsonwebtoken';
import type { JwtAccessPayload } from '@dinesmart/shared';
import { SOCKET_ROOMS } from '@dinesmart/shared';

let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [
        env.FRONTEND_CUSTOMER_URL,
        env.FRONTEND_URL,
        env.FRONTEND_SUPERADMIN_URL,
      ],
      credentials: true,
    },
    adapter: createAdapter(redisPub, redisSub) as ReturnType<typeof createAdapter>,
  });

  const restaurantNs = io.of('/restaurant');

  restaurantNs.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    
    // Customer connections don't need auth
    if (socket.handshake.auth?.role === 'customer') {
      return next();
    }

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  restaurantNs.on('connection', (socket) => {
    const user = (socket as any).user as JwtAccessPayload | undefined;

    logger.info('Socket connected', { socketId: socket.id, userId: user?.userId });

    socket.on('join:table', (tableId: string) => {
      socket.join(SOCKET_ROOMS.table(tableId));
      logger.debug(`Socket ${socket.id} joined table:${tableId}`);
    });

    socket.on('join:kitchen', () => {
      if (user?.branchId) {
        socket.join(SOCKET_ROOMS.kitchen(user.branchId));
        socket.join(SOCKET_ROOMS.branch(user.branchId));
        logger.debug(`Socket ${socket.id} joined kitchen:${user.branchId}`);
      }
    });

    socket.on('join:billing', () => {
      if (user?.branchId) {
        socket.join(SOCKET_ROOMS.billing(user.branchId));
        socket.join(SOCKET_ROOMS.branch(user.branchId));
        logger.debug(`Socket ${socket.id} joined billing:${user.branchId}`);
      }
    });

    socket.on('join:restaurant', () => {
      if (user?.restaurantId) {
        socket.join(SOCKET_ROOMS.restaurant(user.restaurantId));
        logger.debug(`Socket ${socket.id} joined restaurant:${user.restaurantId}`);
      }
    });

    socket.on('leave:table', (tableId: string) => {
      socket.leave(SOCKET_ROOMS.table(tableId));
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket ${socket.id} disconnected`);
    });
  });

  logger.info('✅ Socket.io server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocketServer first.');
  }
  return io;
}

export function getRestaurantNamespace() {
  return getIO().of('/restaurant');
}
