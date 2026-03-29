import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

// ── GET /tracking/:awb ──────────────────────
// Reads from PostgreSQL (MongoDB integration is a future milestone)
export const getTracking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { awb } = req.params;

  if (!awb) {
    res.status(400).json(errorResponse('VALIDATION_001', 'AWB number is required'));
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
         s.id, s.awb, s.status, s.updated_at,
         c.name AS courier_name,
         da.city AS delivery_city,
         da.pincode AS delivery_pincode,
         s.created_at AS booked_at
       FROM shipments s
       LEFT JOIN couriers c ON c.id = s.courier_id
       LEFT JOIN addresses da ON da.id = s.delivery_address_id
       WHERE s.awb = $1`,
      [awb]
    );

    if (result.rows.length === 0) {
      res.status(404).json(errorResponse('SHIPMENT_007', 'AWB not found'));
      return;
    }

    const s = result.rows[0];

    // Build a timeline from shipment status
    const now = new Date().toISOString();
    const events = buildTrackingTimeline(s.status, s.booked_at, s.updated_at, s.delivery_city);

    const currentEvent = events[0] ?? {
      status: s.status.toLowerCase(),
      location: s.delivery_city || '',
      description: 'Status update',
      timestamp: s.updated_at,
    };

    res.status(200).json(
      successResponse({
        awb: s.awb,
        courier: s.courier_name,
        current_status: currentEvent.status,
        current_location: currentEvent.location,
        official_eta: getOfficialEta(s.status, s.booked_at),
        ai_eta: getAiEta(s.status, s.booked_at),
        events,
      })
    );
  } catch (err) {
    console.error('❌ getTracking failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch tracking data'));
  }
};

// ── POST /tracking/webhooks/delhivery ────────
export const delhiveryWebhook = async (req: Request, res: Response): Promise<void> => {
  // Delhivery sends tracking updates here
  try {
    const payload = req.body;

    // Parse Delhivery webhook payload structure
    const packages: Array<{
      AWB?: string;
      Status?: { Status?: string; StatusLocation?: string; StatusDateTime?: string; Instructions?: string };
    }> = payload?.packages || payload?.ShipmentData || [];

    for (const pkg of packages) {
      const awb = pkg?.AWB;
      const status = pkg?.Status?.Status;
      const location = pkg?.Status?.StatusLocation;
      const timestamp = pkg?.Status?.StatusDateTime;
      const description = pkg?.Status?.Instructions;

      if (!awb || !status) continue;

      // Map Delhivery status to internal status
      const mappedStatus = mapDelhiveryStatus(status);

      await pool.query(
        `UPDATE shipments SET status = $1, updated_at = NOW() WHERE awb = $2`,
        [mappedStatus, awb]
      );

      console.log(`📦 Delhivery update: AWB=${awb} Status=${mappedStatus} Location=${location}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ delhiveryWebhook error:', err);
    res.status(200).json({ received: true }); // always return 200 for webhooks
  }
};

// ── POST /tracking/webhooks/dtdc ─────────────
export const dtdcWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const awb = payload?.awbNumber || payload?.awb_number;
    const status = payload?.status;

    if (awb && status) {
      const mappedStatus = mapDtdcStatus(status);
      await pool.query(
        `UPDATE shipments SET status = $1, updated_at = NOW() WHERE awb = $2`,
        [mappedStatus, awb]
      );
      console.log(`📦 DTDC update: AWB=${awb} Status=${mappedStatus}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ dtdcWebhook error:', err);
    res.status(200).json({ received: true });
  }
};

// ── Helpers ──────────────────────────────────

function mapDelhiveryStatus(status: string): string {
  const map: Record<string, string> = {
    'Booked': 'BOOKED',
    'In Transit': 'IN_TRANSIT',
    'Reached Destination': 'IN_TRANSIT',
    'Out for Delivery': 'OUT_FOR_DELIVERY',
    'Delivered': 'DELIVERED',
    'RTO Initiated': 'RTO',
    'RTO Delivered': 'RTO',
    'Pickup Pending': 'BOOKED',
    'Picked Up': 'PICKED_UP',
  };
  return map[status] || 'IN_TRANSIT';
}

function mapDtdcStatus(status: string): string {
  const map: Record<string, string> = {
    'PICKED': 'PICKED_UP',
    'TRANSIT': 'IN_TRANSIT',
    'OFD': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'RTO': 'RTO',
  };
  return map[status.toUpperCase()] || 'IN_TRANSIT';
}

const MILLIS_PER_HOUR = 3_600_000;

function buildTrackingTimeline(
  status: string,
  bookedAt: Date,
  updatedAt: Date,
  city: string
): Array<{ status: string; location: string; description: string; timestamp: string }> {
  const timeline = [];
  const statuses = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const statusIndex = statuses.indexOf(status);

  // Unknown status — treat as BOOKED
  const effectiveIndex = statusIndex >= 0 ? statusIndex : 0;

  if (effectiveIndex >= 4) {
    timeline.push({ status: 'delivered', location: city, description: 'Package delivered successfully', timestamp: updatedAt.toISOString() });
  }
  if (effectiveIndex >= 3) {
    timeline.push({ status: 'out_for_delivery', location: `${city} Hub`, description: 'Shipment out for delivery', timestamp: new Date(updatedAt.getTime() - 3 * MILLIS_PER_HOUR).toISOString() });
  }
  if (effectiveIndex >= 2) {
    timeline.push({ status: 'in_transit', location: `${city} Sorting Facility`, description: 'Arrived at destination city', timestamp: new Date(updatedAt.getTime() - 12 * MILLIS_PER_HOUR).toISOString() });
  }
  if (effectiveIndex >= 1) {
    timeline.push({ status: 'picked_up', location: 'Origin Hub', description: 'Package picked up by courier', timestamp: new Date(bookedAt.getTime() + MILLIS_PER_HOUR).toISOString() });
  }
  // Always show BOOKED event
  timeline.push({ status: 'booked', location: 'Origin', description: 'Shipment booked successfully', timestamp: bookedAt.toISOString() });

  return timeline;
}

function getOfficialEta(status: string, bookedAt: Date): string | null {
  if (['DELIVERED', 'RTO', 'CANCELLED'].includes(status)) return null;
  const eta = new Date(bookedAt);
  eta.setDate(eta.getDate() + 4);
  return eta.toISOString().split('T')[0];
}

function getAiEta(status: string, bookedAt: Date): string | null {
  if (['DELIVERED', 'RTO', 'CANCELLED'].includes(status)) return null;
  const eta = new Date(bookedAt);
  eta.setDate(eta.getDate() + 5);
  return eta.toISOString().split('T')[0];
}
