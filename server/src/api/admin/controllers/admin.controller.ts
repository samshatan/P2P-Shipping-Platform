import { Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';

/**
 * GET /admin/revenue/dashboard
 * Aggregates platform-wide metrics for the admin dashboard.
 */
export const getRevenueDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;

    // 1. Core Metrics
    const metricsResult = await pool.query(`
        SELECT 
            COUNT(*) as total_shipments,
            COALESCE(SUM(charge), 0) * 100 as total_gmv_paise,
            COALESCE(AVG(charge), 0) * 100 as arps_paise
        FROM shipments
        WHERE created_at > NOW() - INTERVAL '${days} days'
        AND status != 'CANCELLED'
    `);

    // 2. Status Breakdown
    const statusResult = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM shipments
        WHERE created_at > NOW() - INTERVAL '${days} days'
        GROUP BY status
    `);

    // 3. User Growth
    const userResult = await pool.query(`
        SELECT COUNT(*) as total_users
        FROM users
    `);

    return res.status(200).json({
        success: true,
        data: {
            metrics: {
                total_shipments: parseInt(metricsResult.rows[0].total_shipments),
                total_gmv_paise: Math.round(parseFloat(metricsResult.rows[0].total_gmv_paise)),
                arps_paise: Math.round(parseFloat(metricsResult.rows[0].arps_paise)),
                total_users: parseInt(userResult.rows[0].total_users)
            },
            status_breakdown: statusResult.rows
        }
    });
});

/**
 * GET /admin/couriers
 * Lists all courier partners and their current configuration.
 */
export const listCouriers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await pool.query('SELECT * FROM couriers ORDER BY name ASC');
    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

/**
 * PATCH /admin/couriers/:id
 * Updates courier status or configuration (e.g. markup)
 */
export const updateCourier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { is_active, api_config } = req.body;

    const fields: string[] = [];
    const params: any[] = [];

    if (is_active !== undefined) {
        params.push(is_active);
        fields.push(`is_active = $${params.length}`);
    }

    if (api_config !== undefined) {
        params.push(JSON.stringify(api_config));
        fields.push(`api_config = $${params.length}`);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            error: { code: 'VAL_001', message: 'No fields to update' }
        });
    }

    params.push(id);
    const result = await pool.query(`
        UPDATE couriers 
        SET ${fields.join(', ')}, updated_at = NOW() 
        WHERE id = $${params.length} 
        RETURNING *
    `, params);

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'COUR_001', message: 'Courier not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: result.rows[0]
    });
});

/**
 * GET /admin/users
 * List users with optional KYC status filter
 */
export const listUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { kyc_status } = req.query;
    
    let query = 'SELECT id, name, email, phone, role, kyc_status, created_at FROM users';
    const params: any[] = [];

    if (kyc_status) {
        query += ' WHERE kyc_status = $1';
        params.push(kyc_status);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    return res.status(200).json({
        success: true,
        data: result.rows
    });
});

/**
 * PATCH /admin/users/:id/kyc
 * Manually approve or reject user KYC
 */
export const updateUserKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // VERIFIED or REJECTED

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: { code: 'VAL_002', message: 'Invalid KYC status' }
        });
    }

    const result = await pool.query(`
        UPDATE users 
        SET kyc_status = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING id, name, email, kyc_status
    `, [status, id]);

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_001', message: 'User not found' }
        });
    }

    return res.status(200).json({
        success: true,
        data: result.rows[0]
    });
});

/**
 * GET /admin/shipments
 * List all shipments on the platform for administrative monitoring.
 */
export const listAllShipments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(`
        SELECT 
            s.*, 
            u.name as user_name, u.email as user_email,
            c.name as courier_name
        FROM shipments s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN couriers c ON s.courier_id = c.id
        ORDER BY s.created_at DESC
        LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return res.status(200).json({
        success: true,
        data: {
            shipments: result.rows,
            pagination: {
                limit,
                offset
            }
        }
    });
});
