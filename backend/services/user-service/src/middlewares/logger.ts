// src/middlewares/logger.ts
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`${req.method} ${req.originalUrl} - ${timestamp}`);
  next();
};
