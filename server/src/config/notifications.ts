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
    whatsapp: 'Your ShipEasy shipment (AWB: {{awb}}) is confirmed! Pickup expected within {{pickup_sla}} hours.',
    subject: 'ShipEasy — Shipment Booked ✅',
  },
  PICKED_UP: {
    title: '🚗 Picked Up!',
    body: 'Your package (AWB: {{awb}}) has been picked up.',
    whatsapp: 'Your ShipEasy package (AWB: {{awb}}) has been picked up by {{courier}}.',
    subject: 'ShipEasy — Package Picked Up 🚗',
  },
  IN_TRANSIT: {
    title: '🚚 In Transit',
    body: 'Your package is on its way! Current location: {{location}}.',
    whatsapp: 'Your ShipEasy package (AWB: {{awb}}) is in transit. Current location: {{location}}.',
    subject: 'ShipEasy — Package In Transit 🚚',
  },
  OUT_FOR_DELIVERY: {
    title: '🛵 Out for Delivery!',
    body: 'Your package will be delivered today. OTP: {{otp}}',
    whatsapp: 'Your ShipEasy delivery is arriving today! Share OTP {{otp}} with the delivery agent.',
    subject: 'ShipEasy — Out for Delivery 🛵',
  },
  DELIVERED: {
    title: '✅ Delivered!',
    body: 'Your package (AWB: {{awb}}) has been delivered.',
    whatsapp: 'Your ShipEasy package (AWB: {{awb}}) has been delivered. Thank you for shipping with us!',
    subject: 'ShipEasy — Delivered ✅',
  },
  DELAYED: {
    title: '⏳ Delivery Delayed',
    body: 'Your package (AWB: {{awb}}) is delayed. New ETA: {{eta}}.',
    whatsapp: 'ShipEasy update: Your package (AWB: {{awb}}) is delayed. New estimated delivery: {{eta}}.',
    subject: 'ShipEasy — Delivery Delayed ⏳',
  },
  RTO_INITIATED: {
    title: '↩️ Return Initiated',
    body: 'Your package (AWB: {{awb}}) is being returned to origin.',
    whatsapp: 'ShipEasy alert: Your package (AWB: {{awb}}) could not be delivered and is being returned.',
    subject: 'ShipEasy — Return to Origin ↩️',
  },
  DELIVERY_OTP: {
    title: '🔑 Delivery OTP',
    body: 'Your delivery OTP is {{otp}}. Share with the delivery agent only.',
    whatsapp: 'ShipEasy Secure Delivery: Your OTP is {{otp}}. Do NOT share with anyone else.',
    subject: 'ShipEasy — Your Delivery OTP 🔑',
  },
  WELCOME_USER: {
    title: '👋 Welcome to ShipEasy!',
    body: 'Welcome aboard, {{name}}! We are excited to help you ship your first package.',
    whatsapp: 'Hi {{name}}, welcome to ShipEasy! You are now ready to compare and book shipments across India.',
    subject: 'Welcome to ShipEasy! 👋',
  }
};

/**
 * Helper to replace {{key}} with values from payload
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}
