import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import pool from '../../../Database/db';

// DAY 22: GET /admin/dashboard/revenue
// Daily GMV + Average Revenue Per Shipment (ARPS)
export const getRevenueDashboard = asyncHandler(async (req: Request, res: Response) => {
    const from = (req.query.from as string) || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = (req.query.to   as string) || new Date().toISOString().split('T')[0];

    // ── 1. Daily GMV breakdown
    const gmvResult = await pool.query(
        `SELECT
            DATE(p.created_at)                          AS date,
            COUNT(p.id)                                 AS total_orders,
            SUM(p.amount_paise)                         AS gmv_paise,
            AVG(p.amount_paise)                         AS avg_order_value_paise,
            COUNT(CASE WHEN s.is_cod THEN 1 END)        AS cod_orders,
            COUNT(CASE WHEN NOT s.is_cod THEN 1 END)    AS prepaid_orders
         FROM payments p
         JOIN shipments s ON s.id = p.shipment_id
         WHERE p.status = 'CAPTURED'
           AND p.created_at::date BETWEEN $1 AND $2
         GROUP BY DATE(p.created_at)
         ORDER BY date ASC`,
        [from, to]
    );

    // ── 2. Summary stats 
    const summaryResult = await pool.query(
        `SELECT
            COUNT(p.id)              AS total_orders,
            SUM(p.amount_paise)      AS total_gmv_paise,
            AVG(p.amount_paise)      AS arps_paise,
            COUNT(DISTINCT s.user_id) AS unique_customers
         FROM payments p
         JOIN shipments s ON s.id = p.shipment_id
         WHERE p.status = 'CAPTURED'
           AND p.created_at::date BETWEEN $1 AND $2`,
        [from, to]
    );

    // ── 3. Status breakdown
    const statusResult = await pool.query(
        `SELECT
            status,
            COUNT(*) AS count
         FROM shipments
         WHERE created_at::date BETWEEN $1 AND $2
         GROUP BY status
         ORDER BY count DESC`,
        [from, to]
    );

    // ── 4. Top couriers by volume
    const courierResult = await pool.query(
        `SELECT
            cp.name                 AS courier,
            COUNT(s.id)             AS shipments,
            SUM(p.amount_paise)     AS revenue_paise,
            AVG(p.amount_paise)     AS avg_value_paise
         FROM shipments s
         LEFT JOIN courier_partners cp ON cp.id = s.courier_id
         LEFT JOIN payments p ON p.shipment_id = s.id AND p.status = 'CAPTURED'
         WHERE s.created_at::date BETWEEN $1 AND $2
           AND s.status NOT IN ('DRAFT', 'CANCELLED')
         GROUP BY cp.name
         ORDER BY shipments DESC
         LIMIT 5`,
        [from, to]
    );

    const summary = summaryResult.rows[0];

    return res.status(200).json({
        success: true,
        data: {
            period: { from, to },
            summary: {
                total_orders:      parseInt(summary.total_orders, 10),
                total_gmv_paise:   parseInt(summary.total_gmv_paise || '0', 10),
                total_gmv_rupees:  ((parseInt(summary.total_gmv_paise || '0', 10)) / 100).toFixed(2),
                arps_paise:        Math.round(parseFloat(summary.arps_paise || '0')),
                arps_rupees:       (parseFloat(summary.arps_paise || '0') / 100).toFixed(2),
                unique_customers:  parseInt(summary.unique_customers, 10),
            },
            daily_gmv:      gmvResult.rows,
            status_breakdown: statusResult.rows,
            top_couriers:   courierResult.rows,
        },
    });
});

// GET /admin/dashboard/users
// User growth, new registrations, KYC funnel
export const getUserMetrics = asyncHandler(async (req: Request, res: Response) => {
    const from = (req.query.from as string) || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = (req.query.to   as string) || new Date().toISOString().split('T')[0];

    // Daily new user registrations
    const registrationsResult = await pool.query(
        `SELECT
            DATE(created_at) AS date,
            COUNT(*)         AS new_users
         FROM users
         WHERE created_at::date BETWEEN $1 AND $2
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [from, to]
    );

    // KYC funnel
    const kycResult = await pool.query(
        `SELECT
            kyc_status,
            COUNT(*) AS count
         FROM users
         GROUP BY kyc_status`
    );

    // Total user count
    const totalResult = await pool.query(
        `SELECT COUNT(*) AS total FROM users`
    );

    return res.status(200).json({
        success: true,
        data: {
            period: { from, to },
            total_users:     parseInt(totalResult.rows[0].total, 10),
            daily_signups:   registrationsResult.rows,
            kyc_funnel:      kycResult.rows,
        },
    });
});

// GET /admin/dashboard/shipments
// Shipment pipeline — RTO%, on-time delivery, COD pending
export const getShipmentMetrics = asyncHandler(async (req: Request, res: Response) => {
    const from = (req.query.from as string) || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = (req.query.to   as string) || new Date().toISOString().split('T')[0];

    // Overall funnel
    const funnelResult = await pool.query(
        `SELECT
            COUNT(*)                                                  AS total_shipments,
            COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END)         AS delivered,
            COUNT(CASE WHEN status = 'RETURNED'  THEN 1 END)         AS returned,
            COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)         AS cancelled,
            COUNT(CASE WHEN status = 'IN_TRANSIT' THEN 1 END)        AS in_transit,
            COUNT(CASE WHEN status = 'OUT_FOR_DELIVERY' THEN 1 END)  AS out_for_delivery,
            COUNT(CASE WHEN status = 'EXCEPTION'  THEN 1 END)        AS exceptions,
            ROUND(
                COUNT(CASE WHEN status = 'RETURNED' THEN 1 END)::numeric
                / NULLIF(COUNT(CASE WHEN status IN ('DELIVERED','RETURNED') THEN 1 END), 0) * 100
            , 2)                                                      AS rto_percent
         FROM shipments
         WHERE created_at::date BETWEEN $1 AND $2`,
        [from, to]
    );

    // COD pending payout
    const codResult = await pool.query(
        `SELECT
            COUNT(*)           AS total_cod_collected,
            SUM(amount_paise)  AS total_cod_paise
         FROM cod_collections
         WHERE status = 'COLLECTED'`
    );

    // Open disputes
    const disputeResult = await pool.query(
        `SELECT status, COUNT(*) AS count FROM disputes GROUP BY status`
    );

    const funnel = funnelResult.rows[0];

    return res.status(200).json({
        success: true,
        data: {
            period: { from, to },
            funnel: {
                total:            parseInt(funnel.total_shipments, 10),
                delivered:        parseInt(funnel.delivered, 10),
                in_transit:       parseInt(funnel.in_transit, 10),
                out_for_delivery: parseInt(funnel.out_for_delivery, 10),
                returned:         parseInt(funnel.returned, 10),
                cancelled:        parseInt(funnel.cancelled, 10),
                exceptions:       parseInt(funnel.exceptions, 10),
                rto_percent:      parseFloat(funnel.rto_percent || '0'),
            },
            cod_pending: {
                count:           parseInt(codResult.rows[0]?.total_cod_collected || '0', 10),
                total_paise:     parseInt(codResult.rows[0]?.total_cod_paise     || '0', 10),
                total_rupees:   ((parseInt(codResult.rows[0]?.total_cod_paise    || '0', 10)) / 100).toFixed(2),
            },
            disputes: disputeResult.rows,
        },
    });
});
