// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Always log the error
  console.error('ERROR DETAILS:');
  console.error('Message:', err.message);
  console.error('Status:', err.status || 500);
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('Stack:', err.stack);
  console.error('Time:', new Date().toISOString());
  console.error('---');

  // Don't expose error details in production
  const isDevelopment = config.server.env === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
};
