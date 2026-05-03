import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';

// Extend Express Request to carry decoded user info
export type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
        role: string;
        name: string;
    };
};

/**
 * Auth Middleware
 * Decodes MongoDB-based JWT and attaches user document info to Request
 */
export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authorization header missing or malformed' },
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Fetch user from MongoDB to ensure they still exist/are active
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.is_active) {
            res.status(401).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User account not found or deactivated' },
            });
            return;
        }

        // Attach user info to request
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name
        };

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Session has expired. Please log in again.' },
            });
            return;
        }

        res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid session token' },
        });
    }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
            });
            return;
        }

        next();
    };
};
