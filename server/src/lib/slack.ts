/**
 * BE3 — Day 23: Slack Webhook Integration
 * 
 * Sends critical alerts and internal system notifications to Slack.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const IS_MOCK = !SLACK_WEBHOOK_URL;

export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SUCCESS = 'SUCCESS'
}

/**
 * Sends an alert message to the configured Slack webhook.
 */
export async function sendSlackAlert(message: string, level: AlertLevel = AlertLevel.INFO): Promise<boolean> {
  const emojiMap: Record<AlertLevel, string> = {
    [AlertLevel.INFO]: 'ℹ️',
    [AlertLevel.WARNING]: '⚠️',
    [AlertLevel.CRITICAL]: '🚨',
    [AlertLevel.SUCCESS]: '✅'
  };

  const payload = {
    text: `${emojiMap[level]} *[SwiftRoute System Alert]*\n*Level:* ${level}\n*Message:* ${message}\n*Time:* ${new Date().toLocaleString()}`
  };

  if (IS_MOCK) {
    console.log('\n💬 [MOCK SLACK ALERT]:');
    console.log(`   Level: ${level}`);
    console.log(`   Message: ${message}`);
    console.log('   Status: Simulated Dispatch\n');
    return true;
  }

  try {
    const response = await axios.post(SLACK_WEBHOOK_URL!, payload);
    return response.status === 200;
  } catch (error) {
    console.error('❌ [slack] Alert Dispatch Failed:', error instanceof Error ? error.message : error);
    return false;
  }
}
