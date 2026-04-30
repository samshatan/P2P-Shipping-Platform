/**
 * BullMQ Workers
 *
 * Processes jobs from queues defined in queues.ts
 * - Tracking Poll Worker: Polls courier APIs for status updates
 * - Notification Worker: Dispatches multi-channel notifications with Sandbox fallback
 */

import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { TrackingEvent } from './mongo';
import { TrackingPollJobData, NotificationJobData } from './queues';
import { NOTIFICATION_TEMPLATES, interpolate } from '../config/notifications';

const connection = redis;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Tracking Poll Worker ─────────────────────────────────────────────────────

function createTrackingPollWorker() {
  return new Worker<TrackingPollJobData>(
    'tracking-poll',
    async (job: Job<TrackingPollJobData>) => {
      const { awb, courier, shipment_id } = job.data;
      console.log(`📡 [tracking-poll] Polling ${courier.toUpperCase()} for AWB: ${awb}`);

      try {
        let statusData: { status: string; location?: string; description?: string } | null = null;

        if (courier === 'delhivery') {
          console.log(`[tracking-poll] Delhivery uses webhooks; skipping poll for AWB ${awb}`);
          return;
        }

        if (courier === 'dtdc' || courier === 'xpressbees') {
          // Mock movement for demo
          statusData = {
            status: 'IN_TRANSIT',
            location: 'Local Sorting Hub',
            description: `Package is being processed at ${courier.toUpperCase()} facility.`,
          };
        }

        if (!statusData) return;

        // Save to MongoDB
        await TrackingEvent.create({
          awb_number: awb,
          shipment_id,
          status: statusData.status,
          location: statusData.location,
          description: statusData.description,
          timestamp: new Date(),
        });

        console.log(`✅ [tracking-poll] Updated status for AWB ${awb}`);
      } catch (err) {
        console.error(`❌ [tracking-poll] Failed for AWB ${awb}:`, err);
        throw err;
      }
    },
    { connection, concurrency: 5 }
  );
}

// ─── Notification Dispatcher Worker ──────────────────────────────────────────

function createNotificationWorker() {
  return new Worker<NotificationJobData>(
    'notification',
    async (job: Job<NotificationJobData>) => {
      const { user_id, event_type, channels, payload } = job.data;
      
      const template = NOTIFICATION_TEMPLATES[event_type];
      if (!template) {
        console.error(`❌ [notification] No template found for event: ${event_type}`);
        return;
      }

      console.log(`🔔 [notification] Dispatching ${event_type} to user ${user_id}`);

      const promises = channels.map(async (channel) => {
        const message = interpolate(
          channel === 'WHATSAPP' ? template.whatsapp : template.body, 
          payload
        );

        // ─── SANDBOX MODE ─────────────────────────────────────────────────────
        // If not in production, just log the message and skip real API calls
        if (!IS_PRODUCTION) {
          console.log(`🛠️  [SANDBOX][${channel}] To: ${payload.phone || payload.email} | Content: ${message}`);
          return;
        }

        try {
          switch (channel) {
            case 'SMS':
              // msg91 integration (removed from src/lib, so would need a fresh implementation if needed)
              console.log(`[SMS] Sending via provider...`);
              break;
            case 'WHATSAPP': {
              const { sendWhatsAppMessage } = await import('./whatsapp');
              await sendWhatsAppMessage(payload.phone as string, message);
              break;
            }
            case 'EMAIL': {
              const { sendEmail } = await import('./sendgrid');
              await sendEmail(payload.email as string, template.subject, message);
              break;
            }
          }
        } catch (err) {
          console.error(`❌ [notification] ${channel} failed:`, err);
        }
      });

      await Promise.allSettled(promises);
      console.log(`✅ [notification] ${event_type} processing complete.`);
    },
    { connection, concurrency: 10 }
  );
}

// ─── Startup ──────────────────────────────────────────────────────────────────

let workers: Worker[] = [];

export function startWorkers(): void {
  if (process.env.ENABLE_WORKERS !== 'true') {
    console.log('ℹ️  Workers disabled (set ENABLE_WORKERS=true in .env)');
    return;
  }

  workers = [
    createTrackingPollWorker(),
    createNotificationWorker(),
  ];

  workers.forEach((w) => {
    w.on('completed', (job) => console.log(`✅ [${job.queueName}] Job ${job.id} done`));
    w.on('failed', (job, err) => console.error(`❌ [${job?.queueName}] Job ${job?.id} failed:`, err));
  });

  console.log('🏭 BullMQ workers active: tracking-poll | notification');
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  console.log('🛑 BullMQ workers stopped');
}
