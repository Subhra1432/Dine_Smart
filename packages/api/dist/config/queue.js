// ═══════════════════════════════════════════
// DineSmart OS — BullMQ Queue Configuration
// ═══════════════════════════════════════════
import { Queue } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';
const connection = {
    host: redis.options.host || 'localhost',
    port: redis.options.port || 6379,
};
// ── Queues ───────────────────────────────
export const inventoryQueue = new Queue('inventory-deduction', { connection });
export const notificationQueue = new Queue('notifications', { connection });
export const reportQueue = new Queue('reports', { connection });
// ── Initialize Workers ──────────────────
export function initWorkers() {
    // Worker imports are done lazily to avoid circular deps
    import('../jobs/inventory.worker.js').then(({ createInventoryWorker }) => {
        createInventoryWorker(connection);
        logger.info('✅ Inventory worker started');
    });
    import('../jobs/notification.worker.js').then(({ createNotificationWorker }) => {
        createNotificationWorker(connection);
        logger.info('✅ Notification worker started');
    });
    import('../jobs/report.worker.js').then(({ createReportWorker }) => {
        createReportWorker(connection);
        logger.info('✅ Report worker started');
    });
}
export { connection as bullConnection };
//# sourceMappingURL=queue.js.map