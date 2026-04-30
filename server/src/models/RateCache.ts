import mongoose from 'mongoose';

const rateCacheSchema = new mongoose.Schema({
  pickup_pincode: { type: String, required: true },
  delivery_pincode: { type: String, required: true },
  weight_grams: { type: Number, required: true },
  is_cod: { type: Boolean, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } } // Automatic TTL deletion
}, {
  timestamps: true
});

// Composite index for fast lookups
rateCacheSchema.index({ pickup_pincode: 1, delivery_pincode: 1, weight_grams: 1, is_cod: 1 }, { unique: true });

export const RateCache = mongoose.model('RateCache', rateCacheSchema);
