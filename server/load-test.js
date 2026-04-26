import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// ── CUSTOM METRICS ────────────────────────────────────────────
const otpLatency      = new Trend('otp_latency_ms');
const ratesLatency    = new Trend('rates_latency_ms');
const shipmentLatency = new Trend('shipment_create_latency_ms');
const paymentLatency  = new Trend('payment_initiate_latency_ms');
const trackingLatency = new Trend('tracking_latency_ms');
const bookingErrors   = new Counter('booking_errors');
const authSuccess     = new Rate('auth_success_rate');

// ── OPTIONS — Load Profile ────────────────────────────────────
export const options = {
    scenarios: {
        // Ramp up to 500 VUs over 2 min, hold for 5 min, ramp down
        stress_test: {
            executor:         'ramping-vus',
            startVUs:         0,
            stages: [
                { duration: '2m', target: 100 },
                { duration: '2m', target: 300 },
                { duration: '5m', target: 500 },
                { duration: '1m', target: 0   },
            ],
            gracefulRampDown: '30s',
        },
        // Spike test — sudden 1000 VU burst for 30s
        spike_test: {
            executor:  'constant-vus',
            vus:       1000,
            duration:  '30s',
            startTime: '10m',
        },
    },

    thresholds: {
        http_req_duration:           ['p(95)<200', 'p(99)<500'],
        http_req_failed:             ['rate<0.01'],
        auth_success_rate:           ['rate>0.99'],
        rates_latency_ms:            ['p(95)<1000'],
        shipment_create_latency_ms:  ['p(95)<300'],
        payment_initiate_latency_ms: ['p(95)<400'],
    },
};

// ── CONSTANTS ─────────────────────────────────────────────────
// __ENV is a k6 global — pass BASE_URL as: k6 run -e BASE_URL=http://... load-test.js
const BASE_URL     = __ENV.BASE_URL || 'http://localhost:3001';
const HEADERS_JSON = { 'Content-Type': 'application/json' };

// Test data pool — each VU picks a unique phone
const TEST_PHONES   = Array.from({ length: 500 }, function (_, i) {
    return '98765' + String(i).padStart(5, '0');
});
const TEST_PINCODES = ['110001', '400001', '560001', '700001', '600001'];
const TEST_COURIERS = ['courier-1', 'courier-2', 'courier-3'];

// ── HELPER ────────────────────────────────────────────────────
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function parseBody(res) {
    try {
        return JSON.parse(res.body);
    } catch (_) {
        return null;
    }
}

// ── MAIN VU SCRIPT ────────────────────────────────────────────
export default function () {
    const phone    = randomItem(TEST_PHONES);
    const pickup   = randomItem(TEST_PINCODES);
    const delivery = randomItem(TEST_PINCODES.filter(function (p) { return p !== pickup; }));
    let accessToken = '';
    let shipmentId  = '';

    // ── 1. AUTHENTICATION FLOW ────────────────────────────────
    group('Auth Flow', function () {
        // Send OTP
        const sendStart = Date.now();
        const sendRes   = http.post(
            BASE_URL + '/auth/send-otp',
            JSON.stringify({ phone: phone }),
            { headers: HEADERS_JSON }
        );
        otpLatency.add(Date.now() - sendStart);

        const sendOk = check(sendRes, {
            'send-otp status 200': function (r) { return r.status === 200; },
            'send-otp success':    function (r) {
                const body = parseBody(r);
                return body !== null && body.success === true;
            },
        });
        authSuccess.add(sendOk ? 1 : 0);

        if (!sendOk) {
            bookingErrors.add(1);
            return;
        }

        // Verify OTP — in test mode OTP is always '123456'
        const verifyRes = http.post(
            BASE_URL + '/auth/verify-otp',
            JSON.stringify({ phone: phone, otp: '123456' }),
            { headers: HEADERS_JSON }
        );

        const verifyOk = check(verifyRes, {
            'verify-otp status 200': function (r) { return r.status === 200; },
        });
        authSuccess.add(verifyOk ? 1 : 0);

        if (verifyOk) {
            const body = parseBody(verifyRes);
            if (body && body.data && body.data.access_token) {
                accessToken = body.data.access_token;
            } else {
                bookingErrors.add(1);
            }
        }
    });

    if (!accessToken) return;

    const authHeaders = {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + accessToken,
    };

    sleep(0.1);

    // ── 2. GET COURIER RATES ──────────────────────────────────
    group('Get Courier Rates', function () {
        const start = Date.now();
        const res   = http.get(
            BASE_URL + '/couriers/rates?pickup_pincode=' + pickup +
            '&delivery_pincode=' + delivery + '&weight_grams=500',
            { headers: authHeaders }
        );
        ratesLatency.add(Date.now() - start);

        check(res, {
            'rates status 200':  function (r) { return r.status === 200; },
            'rates has couriers': function (r) {
                const body = parseBody(r);
                return body !== null && body.success && Array.isArray(body.data.couriers);
            },
        });
    });

    sleep(0.2);

    // ── 3. CREATE SHIPMENT ────────────────────────────────────
    group('Create Shipment', function () {
        const start   = Date.now();
        const payload = {
            pickup_address: {
                name: 'Test Sender', phone: phone,
                flat: '1A', area: 'Test Area',
                city: 'Delhi', state: 'Delhi', pincode: pickup,
            },
            delivery_address: {
                name: 'Test Receiver', phone: phone,
                flat: '2B', area: 'Test Area',
                city: 'Mumbai', state: 'Maharashtra', pincode: delivery,
            },
            courier_id:   randomItem(TEST_COURIERS),
            weight:       500,
            parcel_type:  'PARCEL',
            is_cod:       false,
            amount_paise: 24900,
        };

        const res = http.post(
            BASE_URL + '/shipments/create',
            JSON.stringify(payload),
            { headers: authHeaders }
        );
        shipmentLatency.add(Date.now() - start);

        const ok = check(res, {
            'create shipment status 201': function (r) { return r.status === 201; },
        });

        if (ok) {
            const body = parseBody(res);
            if (body && body.data && body.data.shipment_id) {
                shipmentId = body.data.shipment_id;
            } else {
                bookingErrors.add(1);
            }
        }
    });

    if (!shipmentId) return;

    sleep(0.1);

    // ── 4. INITIATE PAYMENT ───────────────────────────────────
    group('Initiate Payment', function () {
        const start = Date.now();
        const res   = http.post(
            BASE_URL + '/payments/initiate',
            JSON.stringify({ shipment_id: shipmentId, amount_paise: 24900 }),
            { headers: authHeaders }
        );
        paymentLatency.add(Date.now() - start);

        check(res, {
            'payment initiate status 200': function (r) { return r.status === 200; },
            'payment has order_id':        function (r) {
                const body = parseBody(r);
                return body !== null && body.data && !!body.data.order_id;
            },
        });
    });

    sleep(0.2);

    // ── 5. GET USER SHIPMENTS (LIST) ──────────────────────────
    group('User Shipments List', function () {
        const res = http.get(
            BASE_URL + '/users/shipments?page=1&limit=10',
            { headers: authHeaders }
        );
        check(res, {
            'shipments list status 200': function (r) { return r.status === 200; },
        });
    });

    sleep(0.1);

    // ── 6. GET TRACKING ───────────────────────────────────────
    group('Tracking Lookup', function () {
        const start = Date.now();
        // Use __VU (Virtual User ID) + __ITER (iteration) for unique AWB per request
        const res   = http.get(
            BASE_URL + '/tracking/AWB' + __VU + '_' + __ITER + 'IN',
            { headers: authHeaders }
        );
        trackingLatency.add(Date.now() - start);
        // 404 is expected for a fresh AWB — just verify it responds fast
        check(res, {
            'tracking responds': function (r) { return r.status === 200 || r.status === 404; },
        });
    });

    sleep(0.5);
}

// ── TEARDOWN — print formatted summary ───────────────────────
export function handleSummary(data) {
    const dur     = data.metrics.http_req_duration;
    const failed  = data.metrics.http_req_failed;

    const p95     = (dur && dur.values && dur.values['p(95)'])  ? dur.values['p(95)']         : 0;
    const p99     = (dur && dur.values && dur.values['p(99)'])  ? dur.values['p(99)']         : 0;
    const errRate = (failed && failed.values && failed.values.rate) ? failed.values.rate * 100 : 0;

    const p95Pass  = p95     < 200 ? 'PASS' : 'FAIL';
    const p99Pass  = p99     < 500 ? 'PASS' : 'FAIL';
    const errPass  = errRate < 1   ? 'PASS' : 'FAIL';

    var summary = '';
    summary += '\n';
    summary += 'SwiftRoute Load Test - Final Summary\n';
    summary += '--------------------------------------\n';
    summary += 'p95 latency : ' + p95.toFixed(1) + ' ms   (target < 200ms) [' + p95Pass + ']\n';
    summary += 'p99 latency : ' + p99.toFixed(1) + ' ms   (target < 500ms) [' + p99Pass + ']\n';
    summary += 'Error rate  : ' + errRate.toFixed(2) + ' %    (target < 1%)    [' + errPass + ']\n';
    summary += '--------------------------------------\n';

    return { stdout: summary };
}
