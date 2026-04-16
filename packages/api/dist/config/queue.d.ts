import { Queue } from 'bullmq';
declare const connection: {
    host: string;
    port: number;
};
export declare const inventoryQueue: Queue<any, any, string, any, any, string>;
export declare const notificationQueue: Queue<any, any, string, any, any, string>;
export declare const reportQueue: Queue<any, any, string, any, any, string>;
export declare function initWorkers(): void;
export { connection as bullConnection };
//# sourceMappingURL=queue.d.ts.map