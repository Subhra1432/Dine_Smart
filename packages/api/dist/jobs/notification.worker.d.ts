import { Worker } from 'bullmq';
interface NotificationJobData {
    type: 'email' | 'whatsapp' | 'sms';
    to: string;
    subject?: string;
    body: string;
    restaurantId: string;
}
export declare function createNotificationWorker(connection: {
    host: string;
    port: number;
}): Worker<NotificationJobData, any, string>;
export {};
//# sourceMappingURL=notification.worker.d.ts.map