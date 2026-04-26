/**
 * BE3 — Day 15: Manifest Generation System
 * 
 * Handles per-courier batching of shipments into a signed PDF document.
 * 
 * Logic:
 * 1. Fetch shipments (BOOKED status) for given IDs.
 * 2. Group by Courier (Delhivery, DTDC, etc.)
 * 3. Generate a professional PDF handover doc using pdfkit.
 * 4. Content-addressing: Compute SHA256 of PDF.
 * 5. Upload to MinIO/S3 manifests/ prefix.
 * 6. Update shipments with the manifest URL.
 * 7. Emit 'logistics.manifest.created' Kafka event.
 */

import PDFDocument from 'pdfkit';
import * as crypto from 'crypto';
import { uploadFile } from './s3';
import { emitEvent, TOPICS } from './kafka';
import db from '../Database/db';

export interface ManifestResult {
  courier: string;
  count: number;
  url: string;
  hash: string;
}

/**
 * Generates and stores manifests for a batch of shipments.
 * @param shipmentIds Array of shipment UUIDs to include.
 */
export async function generateManifests(shipmentIds: string[]): Promise<ManifestResult[]> {
  if (!shipmentIds.length) return [];

  // 1. Fetch shipment details along with courier info
  const query = `
    SELECT 
      s.id, s.awb, s.weight_grams, s.status,
      c.name as courier_name,
      addr.name as receiver_name, addr.city as receiver_city, addr.pincode as receiver_pincode
    FROM shipments s
    JOIN couriers c ON s.courier_id = c.id
    JOIN addresses addr ON s.delivery_address_id = addr.id
    WHERE s.id = ANY($1) AND s.status = 'BOOKED'
  `;

  const { rows } = await db.query(query, [shipmentIds]);

  if (!rows.length) {
    throw new Error('No BOOKED shipments found for provided IDs');
  }

  // 2. Group by Courier
  const courierGroups: Record<string, any[]> = {};
  rows.forEach(row => {
    if (!courierGroups[row.courier_name]) courierGroups[row.courier_name] = [];
    courierGroups[row.courier_name].push(row);
  });

  const results: ManifestResult[] = [];

  // 3. Process each group
  for (const [courierName, shipments] of Object.entries(courierGroups)) {
    const manifestBuffer = await createPdfBuffer(courierName, shipments);
    const hash = crypto.createHash('sha256').update(manifestBuffer).digest('hex');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `manifests/${courierName.toLowerCase()}/${timestamp}_${hash.slice(0, 8)}.pdf`;

    // 4. Upload to S3
    await uploadFile(key, manifestBuffer, 'application/pdf');
    const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${process.env.MINIO_BUCKET || 'evidence-vault'}/${key}`;

    // 5. Update Shipments in DB
    const updateQuery = `
      UPDATE shipments 
      SET manifest_url = $1, manifest_hash = $2, updated_at = NOW()
      WHERE id = ANY($3)
    `;
    await db.query(updateQuery, [url, hash, shipments.map(s => s.id)]);

    // 6. Emit Kafka Event
    await emitEvent(TOPICS.MANIFEST_CREATED, {
      courier: courierName,
      shipment_count: shipments.length,
      manifest_url: url,
      manifest_hash: hash,
      shipment_ids: shipments.map(s => s.id),
      timestamp: new Date().toISOString()
    });

    results.push({ courier: courierName, count: shipments.length, url, hash });
    console.log(`✅ [manifest] Generated for ${courierName}: ${shipments.length} shipments`);
  }

  return results;
}

/**
 * Internal helper to generate PDF Buffer using pdfkit
 */
async function createPdfBuffer(courier: string, shipments: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header - Premium look
    doc.fontSize(25).text('SwiftRoute Handover Manifest', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text(`Courier Partner: ${courier}`);
    doc.font('Helvetica');
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Total Shipments: ${shipments.length}`);
    doc.moveDown();

    // Table Header
    const tableTop = 200;
    const awbX = 50;
    const receiverX = 150;
    const cityX = 300;
    const weightX = 450;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('AWB Number', awbX, tableTop);
    doc.text('Receiver', receiverX, tableTop);
    doc.text('City', cityX, tableTop);
    doc.text('Weight (g)', weightX, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    let y = tableTop + 25;
    doc.font('Helvetica');
    shipments.forEach(s => {
      if (y > 700) { doc.addPage(); y = 50; } // Basic pagination
      doc.text(s.awb || 'N/A', awbX, y);
      doc.text(s.receiver_name, receiverX, y, { width: 140 });
      doc.text(s.receiver_city, cityX, y);
      doc.text(s.weight_grams.toString(), weightX, y);
      y += 20;
    });

    // Signatures
    doc.moveDown(4);
    const signY = doc.y > 650 ? 650 : doc.y + 50;
    doc.text('_______________________', 50, signY);
    doc.text('Messenger Signature', 50, signY + 15);

    doc.text('_______________________', 350, signY);
    doc.text('Courier Agent Signature', 350, signY + 15);

    // Footer
    doc.fontSize(8).fillColor('grey').text('Generated by SwiftRoute Automations', 0, 750, { align: 'center' });

    doc.end();
  });
}
