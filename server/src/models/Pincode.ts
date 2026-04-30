import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true, index: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  is_serviceable: { type: Boolean, default: true },
  estimated_days: { type: Number, default: 3 }
}, {
  timestamps: true
});

export const Pincode = mongoose.model('Pincode', pincodeSchema);
