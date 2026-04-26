import { triggerOutboundCall, verifyDeliveryCall } from '../src/lib/exotel';
import * as dotenv from 'dotenv';
dotenv.config();

async function testExotel() {
  console.log('🧪 Starting Exotel IVR Integration Test...\n');

  // Test 1: Basic Outbound Call
  console.log('📡 Testing Basic Outbound Call...');
  const res1 = await triggerOutboundCall({
    to: '9876543210',
    callerId: '0804719xxxx',
    flowId: '654321',
    metadata: { test: true, purpose: 'general_alert' }
  });
  console.log('Result:', res1.success ? '✅ Success' : '❌ Failed', res1.callId ? `(ID: ${res1.callId})` : '');

  console.log('\n---------------------------------------------\n');

  // Test 2: Specialized Delivery Verification Call
  console.log('🚀 Testing Delivery Verification Helper...');
  const res2 = await verifyDeliveryCall('9876543210', 'AWB123456789');
  console.log('Result:', res2 ? '✅ Success' : '❌ Failed');

  console.log('\n✨ Exotel Integration Test Complete.');
}

testExotel();
