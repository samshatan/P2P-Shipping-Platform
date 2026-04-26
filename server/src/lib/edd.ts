

const EDD_SERVICE_URL = process.env.EDD_SERVICE_URL || 'http://localhost:5002';

export interface EddRequest {
    pickup_pincode:   string;
    delivery_pincode: string;
    courier_slug:     string;
    weight_grams:     number;
}

export interface EddResult {
    predicted_days:          number;
    confidence:              number;
    predicted_delivery_date: string;  // YYYY-MM-DD
    zone:                    number;
    method:                  string;
}

export async function predictEdd(req: EddRequest): Promise<EddResult> {
    try {
        const response = await fetch(`${EDD_SERVICE_URL}/predict`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(req),
            signal:  AbortSignal.timeout(3000),   // 3s timeout — never block checkout
        });

        if (!response.ok) {
            throw new Error(`EDD service returned ${response.status}`);
        }

        const data = await response.json() as EddResult;
        return data;
    } catch (err) {
        console.warn('⚠️  EDD service unreachable — using fallback estimate:', err);
        return fallbackEdd(req);
    }
}


export async function predictEddBatch(reqs: EddRequest[]): Promise<EddResult[]> {
    try {
        const response = await fetch(`${EDD_SERVICE_URL}/predict/batch`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ shipments: reqs }),
            signal:  AbortSignal.timeout(5000),
        });

        if (!response.ok) throw new Error(`EDD batch service returned ${response.status}`);

        const data = await response.json() as { predictions: EddResult[] };
        return data.predictions;
    } catch (err) {
        console.warn('⚠️  EDD batch service unreachable — using fallback estimates:', err);
        return reqs.map(fallbackEdd);
    }
}

function fallbackEdd(req: EddRequest): EddResult {
    const zone = getZone(req.pickup_pincode, req.delivery_pincode);
    const zoneAdd: Record<number, number> = { 1: 0, 2: 0.5, 3: 1.0, 4: 2.5 };
    const baseDays: Record<string, number> = {
        delhivery:  2.4,
        dtdc:       3.1,
        xpressbees: 2.7,
    };

    const base        = baseDays[req.courier_slug] ?? 3.5;
    const days        = Math.ceil(base + (zoneAdd[zone] ?? 1.0));
    const deliveryDate = addBusinessDays(new Date(), days);

    return {
        predicted_days:          days,
        confidence:              0.70,
        predicted_delivery_date: deliveryDate.toISOString().split('T')[0],
        zone,
        method: 'rule_based_fallback',
    };
}

function getZone(pickup: string, delivery: string): number {
    if (pickup.slice(0, 3) === delivery.slice(0, 3)) return 1;
    if (pickup.slice(0, 2) === delivery.slice(0, 2)) return 2;
    const remote = new Set(['79', '19', '17', '74', '73']);
    if (remote.has(delivery.slice(0, 2))) return 4;
    return 3;
}

function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0) added++; // Skip Sundays
    }
    return result;
}
