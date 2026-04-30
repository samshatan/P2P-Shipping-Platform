import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { Shipment } from '../../../models/Shipment';
import { User } from '../../../models/User';
import { Partner } from '../../../models/Partner';

// ─────────────────────────────────────────────────────────────
// GET /admin/stats
// ─────────────────────────────────────────────────────────────
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    const totalShipments = await Shipment.countDocuments();
    const activeUsers = await User.countDocuments({ role: 'user' });
    const pendingPartners = await Partner.countDocuments({ status: 'PENDING' });
    
    // Calculate total revenue (example logic)
    const revenueResult = await Shipment.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: "$price_paise" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? (revenueResult[0].total / 100).toFixed(2) : "0.00";

    return res.status(200).json({
        success: true,
        data: {
            stats: {
                total_shipments: totalShipments,
                active_users: activeUsers,
                pending_partners: pendingPartners,
                total_revenue: `₹${totalRevenue}`
            }
        }
    });
});

// ─────────────────────────────────────────────────────────────
// GET /admin/partners
// ─────────────────────────────────────────────────────────────
export const getPartnerRequests = asyncHandler(async (req: Request, res: Response) => {
    const partners = await Partner.find().sort({ createdAt: -1 });
    return res.status(200).json({
        success: true,
        data: { partners }
    });
});

// ─────────────────────────────────────────────────────────────
// POST /admin/partners/:id/approve
// ─────────────────────────────────────────────────────────────
export const approvePartner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const partner = await Partner.findById(id);

    if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    partner.status = 'APPROVED';
    await partner.save();

    // Optionally create a User record with role 'partner'
    await User.create({
        name: partner.company_name,
        email: partner.email,
        role: 'partner',
        is_active: true
    });

    return res.status(200).json({
        success: true,
        message: 'Partner approved and user account created.'
    });
});

// ─────────────────────────────────────────────────────────────
// STUBS FOR MISSING ROUTES
// ─────────────────────────────────────────────────────────────
export const getRevenueDashboard = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const listCouriers = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const updateCourier = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const updateUserKyc = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const listAllShipments = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const getUserMetrics = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});

export const getShipmentMetrics = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: 'Not Implemented' });
});
