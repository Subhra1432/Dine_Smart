// ═══════════════════════════════════════════
// DineSmart OS — Socket.io Server Configuration
// ═══════════════════════════════════════════
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from './redis.js';
import { env } from './env.js';
import { logger } from './logger.js';
import jwt from 'jsonwebtoken';
import { SOCKET_ROOMS } from '@dinesmart/shared';
let io;
export function initSocketServer(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                env.FRONTEND_CUSTOMER_URL,
                env.FRONTEND_STAFF_URL,
                env.FRONTEND_SUPERADMIN_URL,
            ],
            credentials: true,
        },
        adapter: createAdapter(redisPub, redisSub),
    });
    const restaurantNs = io.of('/restaurant');
    restaurantNs.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        // Customer connections don't need auth
        if (socket.handshake.auth?.role === 'customer') {
            return next();
        }
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
            socket['user'] = decoded;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    restaurantNs.on('connection', (socket) => {
        const user = socket['user'];
        logger.info('Socket connected', { socketId: socket.id, userId: user?.userId });
        socket.on('join:table', (tableId) => {
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
        socket.on('leave:table', (tableId) => {
            socket.leave(SOCKET_ROOMS.table(tableId));
        });
        socket.on('disconnect', () => {
            logger.debug(`Socket ${socket.id} disconnected`);
        });
    });
    logger.info('✅ Socket.io server initialized');
    return io;
}
export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initSocketServer first.');
    }
    return io;
}
export function getRestaurantNamespace() {
    return getIO().of('/restaurant');
}
//# sourceMappingURL=socket.js.map