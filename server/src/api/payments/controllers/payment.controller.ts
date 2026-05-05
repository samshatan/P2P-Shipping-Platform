import { Request, Response } from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { Shipment } from '../../../models/Shipment';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { shipment_id } = req.body;
    const userId = req.user!.userId;

    const shipment = await Shipment.findOne({ _id: shipment_id, user_id: userId });

    if (!shipment) {
        return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const options = {
        amount: shipment.price_paise, // amount in paise
        currency: 'INR',
        receipt: `receipt_${shipment._id}`,
    };

    const order = await razorpay.orders.create(options);

    shipment.razorpay_order_id = order.id;
    await shipment.save();

    res.status(200).json({
        success: true,
        data: {
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        }
    });
});

export const verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        shipment_id 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        const shipment = await Shipment.findById(shipment_id);
        if (shipment) {
            shipment.status = 'PAID';
            shipment.payment_status = 'PAID';
            shipment.razorpay_payment_id = razorpay_payment_id;
            shipment.razorpay_signature = razorpay_signature;
            await shipment.save();
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
});
