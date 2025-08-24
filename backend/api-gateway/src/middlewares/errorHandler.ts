import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

interface ApiError extends Error {
  status?: number;
}

export function notFound(_req: Request, res: Response) {
  console.log(` ${_req.method} ${_req.originalUrl} - IP: ${_req.ip}`);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found.',
    status: 404,
    timestamp: new Date().toISOString(),
  });
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error({
    message: err.message,
    status,
    path: req.originalUrl,
    method: req.method,
    requestId: (req as any).id,
    stack: isProd ? undefined : err.stack,
  });

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
    message: err.message,
    status,
    path: req.originalUrl,
    requestId: (req as any).id || undefined,
    timestamp: new Date().toISOString(),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
