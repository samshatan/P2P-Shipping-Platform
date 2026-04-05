import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_SOURCE_NUMBER = process.env.GUPSHUP_SOURCE_NUMBER;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME || 'SwiftRoute';

/**
 * SwiftRoute WhatsApp Integration (Gupshup)
 * Handles template-based messaging for shipping lifecycle and OTPs.
 */
export const sendWhatsAppMessage = async (
  phone: string, 
  templateId: string, 
  params: string[] = []
) => {
  // 1. Check for API Key (Mock Mode in Dev)
  if (!GUPSHUP_API_KEY) {
    console.log('\n--- 📱 MOCK WHATSAPP MESSAGE ---');
    console.log(`To: ${phone}`);
    console.log(`Template: ${templateId}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    console.log('--------------------------------\n');
    return { success: true, messageId: 'mock-wa-id-' + Date.now() };
  }

  // 2. Real API Call
  try {
    const response = await axios.post(
      'https://api.gupshup.io/wa/api/v1/template/msg',
      new URLSearchParams({
        source: GUPSHUP_SOURCE_NUMBER || '',
        destination: phone,
        template: JSON.stringify({ id: templateId, params }),
        'channel': 'whatsapp',
        'app': GUPSHUP_APP_NAME
      }),
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': GUPSHUP_API_KEY
        }
      }
    );

    return { success: response.data.status === 'submitted', data: response.data };
  } catch (error) {
    console.error('❌ Gupshup WhatsApp Failed:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
};

/**
 * Pre-defined Template Helpers
 */
export const WhatsAppTemplates = {
  BOOKING_CONFIRMATION: 'booking_confirm_01',
  OUT_FOR_DELIVERY: 'ofd_alert_02',
  DELIVERED: 'delivered_succ_03',
  DELIVERY_OTP: 'delivery_otp_v1'
};
