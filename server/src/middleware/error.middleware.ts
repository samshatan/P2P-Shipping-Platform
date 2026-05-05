import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  data?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.path} >> ${message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
    data: err.data
  });

  res.status(statusCode).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.data && { data: err.data })
    }
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    }
  });
};
