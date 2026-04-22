import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const passwords = ['swiftpass123', 'swiftroute123', 'postgres', 'password', ''];

async function debug() {
  for (const pw of passwords) {
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'swiftroute',
      password: pw,
      port: 5432,
    });

    try {
      console.log(`Trying password: "${pw}"...`);
      await client.connect();
      console.log(`✅ SUCCESS with password: "${pw}"`);
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ FAILED with password: "${pw}" - ${err.message}`);
    }
  }
}

debug();
