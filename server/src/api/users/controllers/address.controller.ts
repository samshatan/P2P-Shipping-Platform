import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { Pincode } from '../../../models/Pincode';

/**
 * Search Address/Pincode Controller
 * Now uses MongoDB Pincode collection for serviceability and location lookup.
 */
export const searchAddress = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: { code: 'ADDR_001', message: 'Search query must be at least 2 characters' }
        });
    }

    // Search pincodes by number or city name
    const results = await Pincode.find({
        $or: [
            { pincode: { $regex: query.trim(), $options: 'i' } },
            { city: { $regex: query.trim(), $options: 'i' } }
        ]
    })
    .limit(10)
    .lean();

    return res.status(200).json({
        success: true,
        data: {
            query,
            results: results.map(r => ({
                id: r._id,
                name: r.city,
                area: r.city,
                city: r.city,
                state: r.state,
                pincode: r.pincode,
                landmark_type: 'CITY'
            }))
        }
    });
});
