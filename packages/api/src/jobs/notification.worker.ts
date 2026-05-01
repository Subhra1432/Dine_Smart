// ═══════════════════════════════════════════
// DineSmart OS — Notification Worker
// ═══════════════════════════════════════════

import { Worker } from 'bullmq';
import { logger } from '../config/logger.js';

interface NotificationJobData {
  type: 'email' | 'whatsapp' | 'sms';
  to: string;
  subject?: string;
  body: string;
  restaurantId: string;
}

export function createNotificationWorker(connection: { host: string; port: number }) {
  const worker = new Worker<NotificationJobData>(
    'notifications',
    async (job) => {
      const { type, to, subject, body } = job.data;
      logger.info('Processing notification', { type, to });

      switch (type) {
        case 'email':
          // In production, use Resend or Nodemailer
          logger.info('Would send email', { to, subject, body: body.substring(0, 100) });
          break;
        case 'whatsapp':
          logger.info('WhatsApp notification stub', { to, body: body.substring(0, 100) });
          break;
        case 'sms':
          logger.info('SMS notification stub', { to, body: body.substring(0, 100) });
          break;
      }
    },
    { connection, concurrency: 10 }
  );

  worker.on('failed', (job, err) => {
    logger.error('Notification job failed', { jobId: job?.id, error: err.message });
  });

  return worker;
}
