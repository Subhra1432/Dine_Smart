// ═══════════════════════════════════════════
// DineSmart OS — Inventory Deduction Worker
// ═══════════════════════════════════════════
import { Worker } from 'bullmq';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { getRestaurantNamespace } from '../config/socket.js';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '@dinesmart/shared';
export function createInventoryWorker(connection) {
    const worker = new Worker('inventory-deduction', async (job) => {
        const { orderId, restaurantId, branchId, items } = job.data;
        logger.info('Processing inventory deduction', { orderId });
        for (const item of items) {
            // Find inventory links for this menu item
            const links = await prisma.menuItemInventory.findMany({
                where: { menuItemId: item.menuItemId },
                include: { inventoryItem: true },
            });
            for (const link of links) {
                const deductAmount = link.quantityUsed * item.quantity;
                const updated = await prisma.inventoryItem.update({
                    where: { id: link.inventoryItemId },
                    data: { currentStock: { decrement: deductAmount } },
                });
                // Log the stock change
                await prisma.stockHistory.create({
                    data: {
                        inventoryItemId: link.inventoryItemId,
                        changeDelta: -deductAmount,
                        reason: `Auto-deduction for order ${orderId}`,
                    },
                });
                // Check if below threshold
                if (updated.currentStock <= updated.minThreshold) {
                    // Auto-disable menu items that use this ingredient
                    const affectedItems = await prisma.menuItemInventory.findMany({
                        where: { inventoryItemId: link.inventoryItemId },
                        select: { menuItemId: true },
                    });
                    for (const affected of affectedItems) {
                        await prisma.menuItem.update({
                            where: { id: affected.menuItemId },
                            data: { isAvailable: false },
                        });
                    }
                    // Create notification
                    await prisma.notification.create({
                        data: {
                            restaurantId,
                            branchId,
                            type: 'LOW_STOCK',
                            title: `Low Stock: ${updated.name}`,
                            body: `${updated.name} is below threshold (${updated.currentStock} ${updated.unit} remaining). Affected menu items have been disabled.`,
                        },
                    });
                    // Emit socket event
                    try {
                        const ns = getRestaurantNamespace();
                        ns.to(SOCKET_ROOMS.restaurant(restaurantId)).emit(SOCKET_EVENTS.INVENTORY_LOW_STOCK, {
                            inventoryItemId: updated.id,
                            name: updated.name,
                            currentStock: updated.currentStock,
                            minThreshold: updated.minThreshold,
                        });
                    }
                    catch (err) {
                        logger.warn('Socket emit failed for low stock', { error: err });
                    }
                }
            }
        }
        logger.info('Inventory deduction complete', { orderId });
    }, { connection, concurrency: 5 });
    worker.on('failed', (job, err) => {
        logger.error('Inventory deduction job failed', { jobId: job?.id, error: err.message });
    });
    return worker;
}
//# sourceMappingURL=inventory.worker.js.map