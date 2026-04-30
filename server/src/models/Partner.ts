import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact_person: { type: String, required: true },
  fleet_size: { type: String },
  business_type: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  notes: { type: String },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewed_at: { type: Date }
}, {
  timestamps: true
});

export const Partner = mongoose.model('Partner', partnerSchema);
