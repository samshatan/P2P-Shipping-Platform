/**
 * BE1 — Day 9: BullMQ Workers
 *
 * Processes jobs from queues defined in queues.ts
 * - Tracking Poll Worker: Polls courier APIs for status updates
 * - Notification Worker: Dispatches multi-channel notifications
 * - COD Payout Worker: Triggers Cashfree bank transfers
 *
 * Initialize with startWorkers() from server/src/index.ts
 */

import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { TrackingEvent } from './mongo';
import { TrackingPollJobData, NotificationJobData, CodPayoutJobData } from './queues';

// Lazy imports to avoid circular deps at startup
const connection = redis;

// ─── Tracking Poll Worker ─────────────────────────────────────────────────────

function createTrackingPollWorker() {
  return new Worker<TrackingPollJobData>(
    'tracking-poll',
    async (job: Job<TrackingPollJobData>) => {
      const { awb, courier, shipment_id } = job.data;
      console.log(`📡 [tracking-poll] Polling ${courier.toUpperCase()} for AWB: ${awb}`);

      try {
        // Dynamic import based on courier
        let statusData: { status: string; location?: string; description?: string } | null = null;

        if (courier === 'delhivery') {
          // Delhivery has webhooks — polling is a fallback
          // In production, this would call Delhivery Track API
          console.log(`[tracking-poll] Delhivery uses webhooks; skipping poll for AWB ${awb}`);
          return;
        }

        if (courier === 'dtdc' || courier === 'xpressbees') {
          // These couriers need polling — mock for now until credentials are live
          statusData = {
            status: 'IN_TRANSIT',
            location: 'Sorting Hub',
            description: `Package in transit via ${courier.toUpperCase()}`,
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

        console.log(`✅ [tracking-poll] Saved status for AWB ${awb}: ${statusData.status}`);
      } catch (err) {
        console.error(`❌ [tracking-poll] Failed for AWB ${awb}:`, err);
        throw err; // BullMQ will retry
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );
}

// ─── Notification Dispatcher Worker ──────────────────────────────────────────

function createNotificationWorker() {
  return new Worker<NotificationJobData>(
    'notification',
    async (job: Job<NotificationJobData>) => {
      const { user_id, shipment_id, event_type, channels, payload } = job.data;
      console.log(`🔔 [notification] Dispatching ${event_type} → user ${user_id} via [${channels.join(', ')}]`);

      const promises = channels.map(async (channel) => {
        try {
          switch (channel) {
            case 'SMS': {
              const { sendMSG91Otp } = await import('./msg91');
              // SMS notifications use msg91 transport (using message as OTP field for generic notifications)
              console.log(`📩 [SMS] ${event_type} → user ${user_id}`);
              // In production swap to a dedicated send-notification SMS template function
              break;
            }
            case 'WHATSAPP': {
              const { sendWhatsAppMessage } = await import('./whatsapp');
              const message = buildWhatsAppMessage(event_type, payload);
              await sendWhatsAppMessage(payload.phone as string, message);
              break;
            }
            case 'PUSH': {
              const { sendPushNotification } = await import('./firebase');
              const { title, body } = buildPushNotification(event_type, payload);
              if (payload.fcm_token) {
                await sendPushNotification(payload.fcm_token as string, title, body, {
                  event_type,
                  shipment_id: shipment_id || '',
                });
              }
              break;
            }
            case 'EMAIL': {
              const { sendEmail } = await import('./sendgrid');
              const { subject, html } = buildEmailContent(event_type, payload);
              await sendEmail(
                payload.email as string,
                subject,
                html,
              );
              break;
            }
          }
        } catch (err) {
          console.error(`❌ [notification] ${channel} failed for ${event_type}:`, err);
          // Don't rethrow — partial failures are acceptable for notifications
        }
      });

      await Promise.allSettled(promises);
      console.log(`✅ [notification] ${event_type} dispatched to ${channels.length} channels`);
    },
    {
      connection,
      concurrency: 20,
    }
  );
}

// ─── COD Payout Worker ────────────────────────────────────────────────────────

function createCodPayoutWorker() {
  return new Worker<CodPayoutJobData>(
    'cod-payout',
    async (job: Job<CodPayoutJobData>) => {
      const { shipment_id, user_id, amount_paise, awb } = job.data;
      console.log(`💸 [cod-payout] Processing payout for shipment ${shipment_id}, amount: ₹${amount_paise / 100}`);

      try {
        // TODO: Call Cashfree payout API in production
        // For now, mock the transfer and log
        console.log(`[cod-payout] MOCK — Initiating Cashfree payout for user ${user_id}`);
        console.log(`[cod-payout] Amount: ₹${amount_paise / 100} | AWB: ${awb}`);

        // In production:
        // const payoutRef = await cashfreeClient.initiatePayout({ user_id, amount_paise });
        // await db.query(
        //   `UPDATE cod_remittances SET status = 'PROCESSING', bank_ref = $1 WHERE shipment_id = $2`,
        //   [payoutRef, shipment_id]
        // );

        console.log(`✅ [cod-payout] Payout mock completed for shipment ${shipment_id}`);
      } catch (err) {
        console.error(`❌ [cod-payout] Payout failed for shipment ${shipment_id}:`, err);
        throw err; // BullMQ will retry once
      }
    },
    {
      connection,
      concurrency: 2, // Low concurrency — financial operations
    }
  );
}

// ─── Message Builders ─────────────────────────────────────────────────────────

const EVENT_MESSAGES: Record<string, { title: string; body: string; whatsapp: string; subject: string }> = {
  BOOKING_CONFIRMED: {
    title: '📦 Booking Confirmed!',
    body: 'Your shipment AWB {{awb}} has been booked with {{courier}}.',
    whatsapp: 'Your SwiftRoute shipment (AWB: {{awb}}) is confirmed! Pickup expected within {{pickup_sla}} hours.',
    subject: 'SwiftRoute — Shipment Booked ✅',
  },
  PICKED_UP: {
    title: '🚗 Picked Up!',
    body: 'Your package (AWB: {{awb}}) has been picked up.',
    whatsapp: 'Your SwiftRoute package (AWB: {{awb}}) has been picked up by {{courier}}.',
    subject: 'SwiftRoute — Package Picked Up 🚗',
  },
  IN_TRANSIT: {
    title: '🚚 In Transit',
    body: 'Your package is on its way! Current location: {{location}}.',
    whatsapp: 'Your SwiftRoute package (AWB: {{awb}}) is in transit. Current location: {{location}}.',
    subject: 'SwiftRoute — Package In Transit 🚚',
  },
  OUT_FOR_DELIVERY: {
    title: '🛵 Out for Delivery!',
    body: 'Your package will be delivered today. OTP: {{otp}}',
    whatsapp: 'Your SwiftRoute delivery is arriving today! Share OTP {{otp}} with the delivery agent.',
    subject: 'SwiftRoute — Out for Delivery 🛵',
  },
  DELIVERED: {
    title: '✅ Delivered!',
    body: 'Your package (AWB: {{awb}}) has been delivered.',
    whatsapp: 'Your SwiftRoute package (AWB: {{awb}}) has been delivered. Thank you for shipping with us!',
    subject: 'SwiftRoute — Delivered ✅',
  },
  DELAYED: {
    title: '⏳ Delivery Delayed',
    body: 'Your package (AWB: {{awb}}) is delayed. New ETA: {{eta}}.',
    whatsapp: 'SwiftRoute update: Your package (AWB: {{awb}}) is delayed. New estimated delivery: {{eta}}.',
    subject: 'SwiftRoute — Delivery Delayed ⏳',
  },
  RTO_INITIATED: {
    title: '↩️ Return Initiated',
    body: 'Your package (AWB: {{awb}}) is being returned to origin.',
    whatsapp: 'SwiftRoute alert: Your package (AWB: {{awb}}) could not be delivered and is being returned.',
    subject: 'SwiftRoute — Return to Origin ↩️',
  },
  COD_COLLECTED: {
    title: '💰 COD Collected',
    body: 'COD amount of ₹{{amount}} collected for AWB: {{awb}}.',
    whatsapp: 'SwiftRoute: Cash of ₹{{amount}} collected for your delivery (AWB: {{awb}}).',
    subject: 'SwiftRoute — COD Collected 💰',
  },
  PAYOUT_SENT: {
    title: '💸 Payout Sent!',
    body: '₹{{amount}} has been transferred to your bank account.',
    whatsapp: 'SwiftRoute: ₹{{amount}} COD payout has been initiated to your bank account.',
    subject: 'SwiftRoute — Payout Transferred 💸',
  },
  DELIVERY_OTP: {
    title: '🔑 Delivery OTP',
    body: 'Your delivery OTP is {{otp}}. Share with the delivery agent only.',
    whatsapp: 'SwiftRoute Secure Delivery: Your OTP is {{otp}}. Do NOT share with anyone else.',
    subject: 'SwiftRoute — Your Delivery OTP 🔑',
  },
};

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}

function buildWhatsAppMessage(event: string, payload: Record<string, string | number>): string {
  const template = EVENT_MESSAGES[event]?.whatsapp ?? `SwiftRoute: ${event}`;
  return interpolate(template, payload);
}

function buildPushNotification(event: string, payload: Record<string, string | number>) {
  const msg = EVENT_MESSAGES[event];
  return {
    title: msg?.title ?? 'SwiftRoute Notification',
    body: interpolate(msg?.body ?? event, payload),
  };
}

function buildEmailContent(event: string, payload: Record<string, string | number>) {
  const msg = EVENT_MESSAGES[event];
  const body = interpolate(msg?.body ?? event, payload);
  return {
    subject: msg?.subject ?? `SwiftRoute — ${event}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6366f1">${msg?.title ?? event}</h2>
        <p>${body}</p>
        <hr/>
        <small style="color:#888">SwiftRoute P2P Shipping Platform</small>
      </div>
    `,
  };
}

// ─── Startup ──────────────────────────────────────────────────────────────────

let workers: Worker[] = [];

export function startWorkers(): void {
  if (process.env.ENABLE_WORKERS !== 'true') {
    console.log('ℹ️  Workers disabled (set ENABLE_WORKERS=true to enable)');
    return;
  }

  workers = [
    createTrackingPollWorker(),
    createNotificationWorker(),
    createCodPayoutWorker(),
  ];

  workers.forEach((w) => {
    w.on('completed', (job) => console.log(`✅ [${job.queueName}] Job ${job.id} completed`));
    w.on('failed', (job, err) => console.error(`❌ [${job?.queueName}] Job ${job?.id} failed:`, err));
  });

  console.log('🏭 BullMQ workers started: tracking-poll | notification | cod-payout');
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  console.log('🛑 BullMQ workers stopped');
}
