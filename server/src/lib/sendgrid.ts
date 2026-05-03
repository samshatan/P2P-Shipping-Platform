import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@swiftroute.in';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!SENDGRID_API_KEY) {
    return { success: true, messageId: 'mock-email-id-' + Date.now() };
  }

  try {
    const msg = { to, from: SENDGRID_FROM_EMAIL, subject, html };
    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error: any) {
    return { success: false, error: error.response?.body?.errors?.[0]?.message || error.message };
  }
};

export const sendBookingReceipt = async (to: string, shipmentId: string, amount: number) => {
  const subject = `Booking Confirmation - #${shipmentId}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>Thank you for booking with SwiftRoute!</h1>
      <p>Your shipment <b>#${shipmentId}</b> has been successfully booked.</p>
      <p><b>Amount:</b> ₹${(amount / 100).toFixed(2)}</p>
      <p>We will notify you once the package is picked up.</p>
    </div>
  `;
  return await sendEmail(to, subject, html);
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const subject = `Your SwiftRoute Verification Code: ${otp}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF5722;">SwiftRoute Verification</h2>
      <p>Use the following code to complete your login or registration:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 12px;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return await sendEmail(to, subject, html);
};
