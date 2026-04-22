import db from '../src/Database/db';
import { generateManifests } from '../src/lib/manifest';
import * as dotenv from 'dotenv';
dotenv.config();

async function testManifest() {
    console.log('🧪 Starting Manifest Generation Test...\n');

    try {
        // 1. Setup Mock User
        const userRes = await db.query(
            "INSERT INTO users (phone, name, email) VALUES ('9999999999', 'Test Manifest User', 'manifest@test.com') ON CONFLICT (phone) DO UPDATE SET phone=EXCLUDED.phone RETURNING id"
        );
        const userId = userRes.rows[0].id;

        // 2. Setup Mock Addresses
        const addrRes = await db.query(
            `INSERT INTO addresses (user_id, label, name, phone, pincode, state, city, area) 
             VALUES ($1, 'Warehouse', 'Sender Name', '9999999999', '110001', 'Delhi', 'New Delhi', 'Connaught Place')
             RETURNING id`,
            [userId]
        );
        const addrId = addrRes.rows[0].id;

        // 3. Setup Mock Couriers if needed
        let courierRes = await db.query("SELECT id, name FROM couriers LIMIT 2");
        if (courierRes.rows.length < 2) {
            console.log('🚛 Seeding mock couriers...');
            await db.query(`
                INSERT INTO couriers (name, code, is_active) 
                VALUES 
                ('Delhivery', 'delhivery', true),
                ('DTDC', 'dtdc', true)
                ON CONFLICT (code) DO NOTHING
            `);
            courierRes = await db.query("SELECT id, name FROM couriers LIMIT 2");
        }
        const couriers = courierRes.rows;

        // 4. Create Mock Shipments (BOOKED status)
        console.log('📦 Creating mock shipments...');
        const shipmentIds: string[] = [];
        
        for (const courier of couriers) {
            const res = await db.query(
                `INSERT INTO shipments (user_id, awb, pickup_address_id, delivery_address_id, courier_id, weight_grams, status)
                 VALUES ($1, $2, $3, $3, $4, 500, 'BOOKED')
                 RETURNING id`,
                [userId, `AWB-${courier.name.toUpperCase()}-${Math.floor(Math.random()*10000)}`, addrId, courier.id]
            );
            shipmentIds.push(res.rows[0].id);
        }

        console.log(`✅ Created ${shipmentIds.length} shipments.`);

        // 5. Generate Manifests
        console.log('📄 Calling generateManifests()...');
        const results = await generateManifests(shipmentIds);

        console.log('\n✨ TEST RESULTS ✨');
        results.forEach((res, i) => {
            console.log(`\n--- Manifest #${i+1} ---`);
            console.log(`Courier:  ${res.courier}`);
            console.log(`Count:    ${res.count}`);
            console.log(`URL:      ${res.url}`);
            console.log(`Hash:     ${res.hash.slice(0, 16)}...`);
        });

        console.log('\n✅ Manifest Generation Test Successful!');

    } catch (err) {
        console.error('❌ Test Failed:', err);
    } finally {
        await db.end();
        process.exit();
    }
}

testManifest();
