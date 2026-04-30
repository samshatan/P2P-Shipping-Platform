import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
  type: { type: String, enum: ['WEIGHT_MISMATCH', 'DAMAGE', 'MISSING_ITEM', 'LATE_DELIVERY', 'OTHER'], required: true },
  description: { type: String, required: true },
  evidence_urls: [{ type: String }],
  status: { type: String, enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  resolution_notes: { type: String }
}, {
  timestamps: true
});

export const Dispute = mongoose.model('Dispute', disputeSchema);
