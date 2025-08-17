import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';

export function notFound(_: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, __: NextFunction) {
  logger.error({ err, id: (req as any).requestId });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
