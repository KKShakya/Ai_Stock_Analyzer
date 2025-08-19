import { Request, Response, NextFunction } from 'express';
import { verifyToken, IJWTPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = payload;
  next();
};

// Rate limiting middleware (ready for paid tiers)
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user exceeded API calls (implement your logic)
  if (user.apiCallsUsed >= user.apiCallsLimit) {
    return res.status(429).json({ 
      error: 'API limit exceeded',
      limit: user.apiCallsLimit,
      used: user.apiCallsUsed,
      plan: user.plan
    });
  }
  
  next();
};
