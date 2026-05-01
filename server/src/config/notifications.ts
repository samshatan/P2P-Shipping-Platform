/**
 * Notification Templates & Configuration
 */

export interface NotificationTemplate {
  title: string;
  body: string;
  whatsapp: string;
  subject: string;
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  BOOKING_CONFIRMED: {
    title: '📦 Booking Confirmed!',
    body: 'Your shipment AWB {{awb}} has been booked with {{courier}}.',
    whatsapp: 'Your Parcel shipment (AWB: {{awb}}) is confirmed! Pickup expected within {{pickup_sla}} hours.',
    subject: 'Parcel — Shipment Booked ✅',
  },
  PICKED_UP: {
    title: '🚗 Picked Up!',
    body: 'Your package (AWB: {{awb}}) has been picked up.',
    whatsapp: 'Your Parcel package (AWB: {{awb}}) has been picked up by {{courier}}.',
    subject: 'Parcel — Package Picked Up 🚗',
  },
  IN_TRANSIT: {
    title: '🚚 In Transit',
    body: 'Your package is on its way! Current location: {{location}}.',
    whatsapp: 'Your Parcel package (AWB: {{awb}}) is in transit. Current location: {{location}}.',
    subject: 'Parcel — Package In Transit 🚚',
  },
  OUT_FOR_DELIVERY: {
    title: '🛵 Out for Delivery!',
    body: 'Your package will be delivered today. OTP: {{otp}}',
    whatsapp: 'Your Parcel delivery is arriving today! Share OTP {{otp}} with the delivery agent.',
    subject: 'Parcel — Out for Delivery 🛵',
  },
  DELIVERED: {
    title: '✅ Delivered!',
    body: 'Your package (AWB: {{awb}}) has been delivered.',
    whatsapp: 'Your Parcel package (AWB: {{awb}}) has been delivered. Thank you for shipping with us!',
    subject: 'Parcel — Delivered ✅',
  },
  DELAYED: {
    title: '⏳ Delivery Delayed',
    body: 'Your package (AWB: {{awb}}) is delayed. New ETA: {{eta}}.',
    whatsapp: 'Parcel update: Your package (AWB: {{awb}}) is delayed. New estimated delivery: {{eta}}.',
    subject: 'Parcel — Delivery Delayed ⏳',
  },
  RTO_INITIATED: {
    title: '↩️ Return Initiated',
    body: 'Your package (AWB: {{awb}}) is being returned to origin.',
    whatsapp: 'Parcel alert: Your package (AWB: {{awb}}) could not be delivered and is being returned.',
    subject: 'Parcel — Return to Origin ↩️',
  },
  DELIVERY_OTP: {
    title: '🔑 Delivery OTP',
    body: 'Your delivery OTP is {{otp}}. Share with the delivery agent only.',
    whatsapp: 'Parcel Secure Delivery: Your OTP is {{otp}}. Do NOT share with anyone else.',
    subject: 'Parcel — Your Delivery OTP 🔑',
  },
  WELCOME_USER: {
    title: '👋 Welcome to Parcel!',
    body: 'Welcome aboard, {{name}}! We are excited to help you ship your first package.',
    whatsapp: 'Hi {{name}}, welcome to Parcel! You are now ready to compare and book shipments across India.',
    subject: 'Welcome to Parcel! 👋',
  }
};

/**
 * Helper to replace {{key}} with values from payload
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}
