import { Worker } from 'bullmq';
interface InventoryJobData {
    orderId: string;
    restaurantId: string;
    branchId: string;
    items: Array<{
        menuItemId: string;
        quantity: number;
    }>;
}
export declare function createInventoryWorker(connection: {
    host: string;
    port: number;
}): Worker<InventoryJobData, any, string>;
export {};
//# sourceMappingURL=inventory.worker.d.ts.map