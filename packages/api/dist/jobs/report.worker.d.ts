import { Worker } from 'bullmq';
interface ReportJobData {
    type: 'daily' | 'weekly' | 'monthly';
    restaurantId: string;
    branchId?: string;
}
export declare function createReportWorker(connection: {
    host: string;
    port: number;
}): Worker<ReportJobData, any, string>;
export {};
//# sourceMappingURL=report.worker.d.ts.map