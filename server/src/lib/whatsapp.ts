import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_SOURCE_NUMBER = process.env.GUPSHUP_SOURCE_NUMBER;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME || 'SwiftRoute';

export const sendWhatsAppMessage = async (
  phone: string,
  templateId: string,
  params: string[] = []
) => {
  if (!GUPSHUP_API_KEY) {
    return { success: true, messageId: 'mock-wa-id-' + Date.now() };
  }

  try {
    const response = await axios.post(
      'https://api.gupshup.io/wa/api/v1/template/msg',
      new URLSearchParams({
        source: GUPSHUP_SOURCE_NUMBER || '',
        destination: phone,
        template: JSON.stringify({ id: templateId, params }),
        channel: 'whatsapp',
        app: GUPSHUP_APP_NAME
      }),
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          apikey: GUPSHUP_API_KEY
        }
      }
    );

    return { success: response.data.status === 'submitted', data: response.data };
  } catch (error) {
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
};

export const WhatsAppTemplates = {
  BOOKING_CONFIRMATION: 'booking_confirm_01',
  OUT_FOR_DELIVERY: 'ofd_alert_02',
  DELIVERED: 'delivered_succ_03',
  DELIVERY_OTP: 'delivery_otp_v1'
};
