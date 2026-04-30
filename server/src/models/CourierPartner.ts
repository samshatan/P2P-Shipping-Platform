import mongoose from 'mongoose';

const courierPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  is_active: { type: Boolean, default: true },
  markup_percent: { type: Number, default: 0 },
  api_key_name: { type: String },
  rating: { type: Number, default: 4.5 }
}, {
  timestamps: true
});

export const CourierPartner = mongoose.model('CourierPartner', courierPartnerSchema);
