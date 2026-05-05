import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { getShiprocketTracking } from './couriers/shiprocket';
import { TrackingEvent } from './mongo';
import { TrackingPollJobData, NotificationJobData } from './queues';
import { NOTIFICATION_TEMPLATES, interpolate } from '../config/notifications';

const connection = redis;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function createTrackingPollWorker() {
  return new Worker<TrackingPollJobData>(
    'tracking-poll',
    async (job: Job<TrackingPollJobData>) => {
      const { awb, courier, shipment_id } = job.data;

      try {
        let statusData: { status: string; location?: string; description?: string; timestamp?: Date } | null = null;

        // 1. Check if Simulation (PCL- prefix)
        if (awb?.startsWith('PCL-')) {
          if (courier === 'dtdc' || courier === 'xpressbees' || courier === 'delhivery') {
            statusData = {
              status: 'IN_TRANSIT',
              location: 'Local Sorting Hub',
              description: `Package is being processed at ${courier.toUpperCase()} facility.`,
              timestamp: new Date()
            };
          }
        } 
        // 2. Real Shiprocket Tracking
        else if (awb) {
          const res = await getShiprocketTracking(awb);
          const trackData = res?.tracking_data?.shipment_track_activities?.[0];
          
          if (trackData) {
            statusData = {
              status: trackData.activity.toUpperCase().replace(/\s+/g, '_'),
              location: trackData.location,
              description: trackData.sr_status_label,
              timestamp: new Date(trackData.date)
            };
          }
        }

        if (!statusData) return;

        // 3. Save to MongoDB if it's a new unique event (simple check by timestamp/status)
        const exists = await TrackingEvent.findOne({ 
          awb_number: awb, 
          status: statusData.status,
          timestamp: statusData.timestamp 
        });

        if (!exists) {
          await TrackingEvent.create({
            awb_number: awb,
            shipment_id,
            status: statusData.status,
            location: statusData.location,
            description: statusData.description,
            timestamp: statusData.timestamp,
          });
        }

      } catch (err) {
        console.error('Tracking Poll Error:', err);
      }
    },
    { connection, concurrency: 5 }
  );
}

function createNotificationWorker() {
  return new Worker<NotificationJobData>(
    'notification',
    async (job: Job<NotificationJobData>) => {
      const { event_type, channels, payload } = job.data;

      const template = NOTIFICATION_TEMPLATES[event_type];
      if (!template) return;

      if (!IS_PRODUCTION) return;

      const promises = channels.map(async (channel) => {
        const message = interpolate(
          channel === 'WHATSAPP' ? template.whatsapp : template.body,
          payload
        );

        try {
          switch (channel) {
            case 'SMS':
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
        }
      });

      await Promise.allSettled(promises);
    },
    { connection, concurrency: 10 }
  );
}

let workers: Worker[] = [];

export function startWorkers(): void {
  if (process.env.ENABLE_WORKERS !== 'true') return;

  workers = [
    createTrackingPollWorker(),
    createNotificationWorker(),
  ];
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
}
