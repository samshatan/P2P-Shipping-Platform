import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to carry decoded user info
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * BE3 — Day 3: Auth Middleware
 * Decodes email-based JWT and attaches user to Request
 */
export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    // ── Check header present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authorization header missing or malformed' },
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    // ── Verify JWT signature
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
            userId: string;
            email: string;
            role: string;
        };

        // Attach user to request — available in all downstream controllers
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired. Please refresh.' },
            });
            return;
        }

        res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid access token' },
        });
    }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specific roles (e.g., ADMIN)
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
