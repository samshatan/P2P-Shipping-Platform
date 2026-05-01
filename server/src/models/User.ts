import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  flat: { type: String },
  country: { type: String, default: 'India' },
  is_default: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, // Only needed for traditional login
  name: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin', 'partner', 'support'],
    default: 'user'
  },
  saved_addresses: [addressSchema],
  avatar: { type: String },
  google_id: { type: String },
  is_active: { type: Boolean, default: true },
  last_login: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export const Address = mongoose.model('Address', addressSchema); // Exported for reuse if needed
