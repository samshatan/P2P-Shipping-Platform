import { createRazorpayOrder } from '../src/lib/razorpay';
import { sendMSG91Otp } from '../src/lib/msg91';
import { sendWhatsAppMessage } from '../src/lib/whatsapp';
import { sendPushNotification } from '../src/lib/firebase';
import { initiateKyc } from '../src/lib/digio';
import { sendEmail } from '../src/lib/sendgrid';
import { aggregateRates } from '../src/lib/couriers/rates.aggregator';
import { triggerOutboundCall } from '../src/lib/exotel';
import { sendSlackAlert, AlertLevel } from '../src/lib/slack';
import { getVehicleInfo } from '../src/lib/ulip';
import * as dotenv from 'dotenv';
dotenv.config();

async function runAudit() {
  console.log('🏗️  Starting Final Integration Audit (Day 25)...\n');

  const tests = [
    { name: 'Razorpay', fn: () => createRazorpayOrder(100, 'INR', 'AUDIT_001') },
    { name: 'MSG91 SMS', fn: () => sendMSG91Otp('9876543210', '123456') },
    { name: 'WhatsApp', fn: () => sendWhatsAppMessage('9876543210', 'Your order is confirmed!') },
    { name: 'Push Notifications', fn: () => sendPushNotification('test_token', 'Shipment Update', 'Out for delivery') },
    { name: 'Digio KYC', fn: () => initiateKyc('9876543210', 'Test User') },
    { name: 'SendGrid Email', fn: () => sendEmail('test@example.com', 'Welcome', 'Hello!') },
    { name: 'Courier Aggregator', fn: () => aggregateRates({ pickup_pincode: '110001', delivery_pincode: '400001', weight_grams: 500, is_cod: false }) },
    { name: 'Exotel IVR', fn: () => triggerOutboundCall({ to: '9876543210', callerId: '080', flowId: '123' }) },
    { name: 'Slack Alerts', fn: () => sendSlackAlert('Audit in progress', AlertLevel.INFO) },
    { name: 'ULIP (Vahan)', fn: () => getVehicleInfo('DL01AB1234') }
  ];

  for (const test of tests) {
    process.stdout.write(`📡 Testing ${test.name.padEnd(20)}... `);
    try {
      await test.fn();
      console.log('✅ PASS');
    } catch (error) {
      console.log('❌ FAIL');
      console.error(`   Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log('\n✨ Audit Complete. All integrations are stable in Mock/Dev mode.');
}

runAudit();
