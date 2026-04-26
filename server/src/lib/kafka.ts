import { Kafka, Partitioners } from 'kafkajs';
import * as dotenv from 'dotenv';
dotenv.config();

const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : [];

/**
 * SwiftRoute Kafka Client
 * Handles high-velocity event streaming.
 * If KAFKA_BROKERS is empty, it falls back to BullMQ for notifications.
 */
export const kafka = KAFKA_BROKERS.length > 0 ? new Kafka({
  clientId: 'swiftroute-server',
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    retries: 3
  }
}) : null;

// Singleton Producer
export const producer = kafka ? kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
}) : null;

/**
 * Emits a structured event to a Kafka topic.
 * REDIRECTS to BullMQ for NOTIFICATION_DISPATCH if Kafka is unavailable.
 * @param topic The target topic
 * @param payload The event data
 */
export const emitEvent = async (topic: string, payload: any) => {
  // ─── BullMQ Fallback for Notifications ──────────────────────────
  if (topic === 'notification.dispatch_request') {
    try {
      const { enqueueNotification } = await import('./queues');
      await enqueueNotification(payload);
      return;
    } catch (err) {
      console.error('❌ BullMQ Fallback Failed:', err);
    }
  }

  // ─── Kafka Emission ─────────────────────────────────────────────
  if (!producer) {
    console.log(`ℹ️ Kafka skipped [${topic}] (No brokers configured)`);
    return;
  }

  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(payload) },
      ],
    });
  } catch (error) {
    console.error(`❌ Kafka Emission Failed [${topic}]:`, error);
  }
};

/**
 * Topic Constants
 */
export const TOPICS = {
  SHIPMENT_UPDATED: 'shipment.status.updated',
  NOTIFICATION_DISPATCH: 'notification.dispatch_request',
  TRACKING_SYNC: 'tracking.manual_sync_trigger',
  USER_REGISTERED: 'user.account.created',
  MANIFEST_CREATED: 'logistics.manifest.created'
};
