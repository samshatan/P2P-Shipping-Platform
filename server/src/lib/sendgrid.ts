import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@swiftroute.in';

/**
 * SwiftRoute Email Integration (SendGrid)
 * Handles transactional emails like booking receipts and system alerts.
 */
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('📧 SendGrid initialized successfully');
} else {
  console.warn('⚠️ SendGrid API Key missing. Mock mode enabled.');
}

/**
 * Sends a generic transactional email
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  // 1. Mock Mode
  if (!SENDGRID_API_KEY) {
    console.log('\n--- 📧 MOCK EMAIL NOTIFICATION ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML Snippet): ${html.substring(0, 50)}...`);
    console.log('----------------------------------\n');
    return { success: true, messageId: 'mock-email-id-' + Date.now() };
  }

  // 2. Real API Call
  try {
    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ SendGrid Email Failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

/**
 * Specialized Receipt Generator
 */
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

/**
 * OTP Email Helper
 */
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
