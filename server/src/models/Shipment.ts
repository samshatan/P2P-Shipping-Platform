import mongoose from 'mongoose';

const shipmentAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  flat: { type: String },
  country: { type: String, default: 'India' }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  awb: { type: String, unique: true, sparse: true, index: true },
  
  pickup_address: { type: shipmentAddressSchema, required: true },
  delivery_address: { type: shipmentAddressSchema, required: true },
  
  courier_id: { type: String, required: true }, // Can store courier slug or ID
  courier_name: { type: String },
  
  weight_grams: { type: Number, required: true },
  dimensions: {
    length: { type: Number, default: 10 },
    width: { type: Number, default: 10 },
    height: { type: Number, default: 10 }
  },
  
  status: { 
    type: String, 
    enum: ['DRAFT', 'BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RTO'],
    default: 'DRAFT',
    index: true
  },
  
  price_paise: { type: Number, required: true },
  is_cod: { type: Boolean, default: false },
  cod_amount: { type: Number, default: 0 },
  
  parcel_type: { type: String, default: 'PARCEL' },
  label_url: { type: String },
  delivery_otp: { type: String },
  
  booked_at: { type: Date },
  delivered_at: { type: Date },
  cancelled_at: { type: Date },
  cancel_reason: { type: String }
}, {
  timestamps: true
});

// Virtual for formatted price in Rupees
shipmentSchema.virtual('price_in_rupees').get(function() {
  return (this.price_paise / 100).toFixed(2);
});

export const Shipment = mongoose.model('Shipment', shipmentSchema);
