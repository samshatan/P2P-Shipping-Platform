import { Queue, QueueEvents } from 'bullmq';
import { redis } from './redis';

const connection = redis;

export const trackingPollQueue = new Queue('tracking-poll', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export const notificationQueue = new Queue('notification', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

export interface TrackingPollJobData {
  shipment_id: string;
  awb: string;
  courier: 'delhivery' | 'dtdc' | 'xpressbees';
}

export interface NotificationJobData {
  user_id: string;
  shipment_id?: string;
  event_type: NotificationEvent;
  channels: NotificationChannel[];
  payload: Record<string, string | number>;
}

export type NotificationChannel = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';

export type NotificationEvent =
  | 'BOOKING_CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'RTO_INITIATED'
  | 'COD_COLLECTED'
  | 'PAYOUT_SENT'
  | 'DELIVERY_OTP'
  | 'WELCOME_USER';

export async function enqueueTrackingPoll(
  data: TrackingPollJobData,
  delayMs: number = 15 * 60 * 1000
): Promise<void> {
  await trackingPollQueue.add(`poll:${data.awb}`, data, {
    delay: delayMs,
    repeat: {
      every: 15 * 60 * 1000,
      limit: 960,
    },
  });
}

export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  await notificationQueue.add(`notify:${data.event_type}:${data.user_id}`, data);
}

export async function closeQueues(): Promise<void> {
  await Promise.all([
    trackingPollQueue.close(),
    notificationQueue.close(),
  ]);
}

export async function getQueueHealth(): Promise<Record<string, object>> {
  const [trackingCounts, notifyCounts] = await Promise.all([
    trackingPollQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
  ]);

  return {
    'tracking-poll': trackingCounts,
    notification: notifyCounts,
  };
}
