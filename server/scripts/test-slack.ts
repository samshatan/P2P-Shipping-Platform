import { sendSlackAlert, AlertLevel } from '../src/lib/slack';
import * as dotenv from 'dotenv';
dotenv.config();

async function testSlack() {
  console.log('🧪 Starting Slack Alert Integration Test...\n');

  // Test 1: Info Alert
  console.log('📡 Testing INFO Alert...');
  await sendSlackAlert('A new user has registered on the platform.', AlertLevel.INFO);

  // Test 2: Success Alert
  console.log('📡 Testing SUCCESS Alert...');
  await sendSlackAlert('Daily COD reconciliation completed successfully.', AlertLevel.SUCCESS);

  // Test 3: Warning Alert
  console.log('📡 Testing WARNING Alert...');
  await sendSlackAlert('Delayed tracking updates detected for Delhivery.', AlertLevel.WARNING);

  // Test 4: Critical Alert
  console.log('📡 Testing CRITICAL Alert...');
  await sendSlackAlert('Database connection pool is reaching 90% capacity!', AlertLevel.CRITICAL);

  console.log('\n✨ Slack Integration Test Complete.');
}

testSlack();
