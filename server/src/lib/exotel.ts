/**
 * BE3 — Day 19: Exotel IVR Integration
 * 
 * Handles automated voice calls for delivery verification and critical alerts.
 * 
 * Logic:
 * 1. Check for Exotel credentials in environment.
 * 2. If missing, fall back to Mock Mode (Console logging).
 * 3. Use Exotel 'Connect Calls' API to trigger outbound IVR.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const EXOTEL_SID = process.env.EXOTEL_SID;
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY;
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN;
const EXOTEL_SUBDOMAIN = process.env.EXOTEL_SUBDOMAIN || 'api.exotel.com';

// Mock mode if credentials are missing
const IS_MOCK = !EXOTEL_SID || !EXOTEL_API_KEY || !EXOTEL_API_TOKEN;

/**
 * Interface for Exotel Call Parameters
 */
export interface ExotelCallParams {
  to: string;             // User's phone number
  callerId: string;       // Your Exotel Virtual Number
  flowId: string;         // IVR Flow ID from Exotel Dashboard
  metadata?: Record<string, any>;
}

/**
 * Triggers an automated outbound call via Exotel.
 */
export async function triggerOutboundCall(params: ExotelCallParams): Promise<{ success: boolean; callId?: string }> {
  if (IS_MOCK) {
    console.log('\n📞 [MOCK EXOTEL] Outbound Call Triggered:');
    console.log(`   To: ${params.to}`);
    console.log(`   CallerId: ${params.callerId}`);
    console.log(`   FlowId: ${params.flowId}`);
    console.log(`   Metadata:`, params.metadata || 'None');
    console.log('   Status: Simulated Success\n');
    return { success: true, callId: `mock_call_${Date.now()}` };
  }

  const url = `https://${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}@${EXOTEL_SUBDOMAIN}/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`;

  try {
    const response = await axios.post(url, new URLSearchParams({
      From: params.to,
      CallerId: params.callerId,
      Url: `http://my.exotel.com/${EXOTEL_SID}/examl/${params.flowId}`,
      CallType: 'transcribe' // Example parameter
    }));

    if (response.status === 200) {
      console.log(`✅ [exotel] Call successfully triggered to ${params.to}`);
      return { success: true, callId: response.data.Call.Sid };
    }
    
    return { success: false };
  } catch (error) {
    console.error('❌ [exotel] Call Dispatch Failed:', error instanceof Error ? error.message : error);
    return { success: false };
  }
}

/**
 * Specialized helper for high-security delivery verification calls.
 */
export async function verifyDeliveryCall(phone: string, awb: string): Promise<boolean> {
    console.log(`🚀 [exotel] Initiating delivery verification call for AWB: ${awb}`);
    const res = await triggerOutboundCall({
        to: phone,
        callerId: process.env.EXOTEL_VIRTUAL_NUMBER || '0804719xxxx',
        flowId: process.env.EXOTEL_VERIFICATION_FLOW_ID || '123456',
        metadata: { awb, type: 'delivery_verification' }
    });
    return res.success;
}
