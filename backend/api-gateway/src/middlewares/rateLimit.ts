import type { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ points: 120, duration: 60 });

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    await limiter.consume(req.ip || 'global');
    next();
  } catch {
    res.status(429).json({ error: 'Too Many Requests' });
  }
}
