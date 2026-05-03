import crypto from 'crypto';
import { Request, Response } from 'express';
import { TrackingEvent } from './mongo';
import { Shipment } from '../models/Shipment';
import { enqueueNotification } from './queues';
import type { NotificationEvent } from './queues';

const DELHIVERY_STATUS_MAP: Record<string, string> = {
  'Manifested':         'BOOKED',
  'In Transit':         'IN_TRANSIT',
  'Out For Delivery':   'OUT_FOR_DELIVERY',
  'Delivered':          'DELIVERED',
  'RTO Initiated':      'RTO_INITIATED',
  'RTO Delivered':      'RTO_DELIVERED',
  'Undelivered':        'FAILED_DELIVERY',
  'Pickup Awaited':     'PICKUP_AWAITED',
  'Pickup Cancelled':   'PICKUP_CANCELLED',
  'Picked Up':          'PICKED_UP',
};

const DTDC_STATUS_MAP: Record<string, string> = {
  'BOOKING':         'BOOKED',
  'INBOUND':         'IN_TRANSIT',
  'OUTBOUND':        'IN_TRANSIT',
  'OUT FOR DELIVERY':'OUT_FOR_DELIVERY',
  'DELIVERED':       'DELIVERED',
  'RTO':             'RTO_INITIATED',
  'PICKUP':          'PICKED_UP',
};

function mapToNotificationEvent(normalizedStatus: string): NotificationEvent | null {
  const map: Record<string, NotificationEvent> = {
    PICKED_UP:         'PICKED_UP',
    IN_TRANSIT:        'IN_TRANSIT',
    OUT_FOR_DELIVERY:  'OUT_FOR_DELIVERY',
    DELIVERED:         'DELIVERED',
    RTO_INITIATED:     'RTO_INITIATED',
  };
  return map[normalizedStatus] ?? null;
}

async function saveTrackingEvent(
  awb: string,
  status: string,
  location: string,
  description: string,
  courier: string
) {
  await TrackingEvent.create({
    awb_number: awb,
    shipment_id: awb,
    status,
    location,
    description,
    timestamp: new Date(),
    meta: { courier, source: 'WEBHOOK' },
  });

  const shipment = await Shipment.findOneAndUpdate(
    { awb: awb },
    { $set: { status: status, updatedAt: new Date() } },
    { new: true }
  );

  if (!shipment) {
    return null;
  }

  const shipmentId = shipment._id.toString();
  const userId = shipment.user_id.toString();

  const notifEvent = mapToNotificationEvent(status);
  if (notifEvent) {
    await enqueueNotification({
      user_id: userId,
      shipment_id: shipmentId,
      event_type: notifEvent,
      channels: ['SMS', 'WHATSAPP', 'PUSH'],
      payload: { awb, courier, location, status },
    });
  }

  return { shipmentId, userId };
}

export async function handleDelhiveryWebhook(req: Request, res: Response): Promise<void> {
  try {
    const webhookSecret = process.env.DELHIVERY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-delhivery-signature'] as string;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSig) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const shipmentData = req.body?.ShipmentData as any[] | undefined;
    if (!shipmentData || !Array.isArray(shipmentData)) {
      res.status(400).json({ error: 'Invalid payload: ShipmentData missing' });
      return;
    }

    let processed = 0;
    let failed = 0;

    for (const item of shipmentData) {
      try {
        const shipment = item?.Shipment;
        if (!shipment) continue;

        const awb: string = shipment.AWB || shipment.Waybill;
        const rawStatus: string = shipment.Status?.Status || 'Unknown';
        const location: string = shipment.Status?.City || shipment.PickedupCity || 'Unknown';
        const description: string = shipment.Status?.StatusType || rawStatus;

        const normalizedStatus = DELHIVERY_STATUS_MAP[rawStatus] ?? rawStatus.toUpperCase().replace(/\s+/g, '_');

        await saveTrackingEvent(awb, normalizedStatus, location, description, 'delhivery');
        processed++;
      } catch (err) {
        failed++;
      }
    }

    res.status(200).json({ received: true, processed, failed });

  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleDtdcWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { trackingId, status: rawStatus, location, description } = req.body;

    if (!trackingId || !rawStatus) {
      res.status(400).json({ error: 'trackingId and status are required' });
      return;
    }

    const normalizedStatus = DTDC_STATUS_MAP[rawStatus?.toUpperCase()] ?? rawStatus.toUpperCase().replace(/\s+/g, '_');

    await saveTrackingEvent(
      trackingId,
      normalizedStatus,
      location || 'Unknown',
      description || rawStatus,
      'dtdc'
    );

    res.status(200).json({ received: true });

  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
