// api-gateway/src/middleware/rateLimiter.ts
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

// Redis client setup
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),

  // Connection settings
  connectTimeout: 10000, // 10 second connection timeout
  commandTimeout: 5000, // 5 second command timeout
  enableOfflineQueue: false, // Don't queue when offline
  lazyConnect: true, // Connect on first command

  // Retry strategy with limits
  retryStrategy(times) {
    if (times > 3) {
      console.error(`Redis failed after ${times} attempts - giving up`);
      return null; // Stop retrying
    }

    // Exponential backoff with minimum 1000ms (avoids ioredis bug)
    const delay = Math.max(Math.min(times * 1000, 10000), 1000);
    console.log(`Redis retry ${times} in ${delay}ms`);
    return delay;
  },

  maxRetriesPerRequest: 1, // Don't retry commands
});



// Graceful error handling
redisClient.on("error", (error) => {
  console.log("Redis error (using memory fallback):", error.message);
  // Continue without Redis - don't crash the app
});

// Global rate limiter applies to all API requests
const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "global_rl",
  points: 1000, // Number of requests
  duration: 15 * 60, // Per 15 minutes
  blockDuration: 5 * 60, // Block for 5 minutes if limit exceeded
  inMemoryBlockOnConsumed: 1000, // Avoid extra Redis calls when blocked
  inMemoryBlockDuration: 5 * 60, // Block in memory for 5 minutes
});

// Market data specific rate limiter - more restrictive
const marketLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "market_rl",
  points: 200, // 200 requests
  duration: 5 * 60, // Per 5 minutes
  blockDuration: 10 * 60, // Block for 10 minutes
  inMemoryBlockOnConsumed: 200,
  inMemoryBlockDuration: 10 * 60,
});

// User service rate limiter
const userLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "user_rl",
  points: 100, // 100 requests
  duration: 5 * 60, // Per 5 minutes
  blockDuration: 5 * 60, // Block for 5 minutes
  inMemoryBlockOnConsumed: 100,
  inMemoryBlockDuration: 5 * 60,
});

// Insurance limiter - fallback when Redis is down
const insuranceLimiter = new RateLimiterMemory({
  points: 20, // Much lower limit when Redis is down
  duration: 60, // Per minute
});

// Add insurance limiter to all Redis limiters
globalLimiter.insuranceLimiter = insuranceLimiter;
marketLimiter.insuranceLimiter = insuranceLimiter;
userLimiter.insuranceLimiter = insuranceLimiter;

// Helper function to create rate limit middleware
const createRateLimitMiddleware = (limiter: RateLimiterRedis, name: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP address as the key (you can also use user ID if authenticated)
      const key = req.ip;

      // Consume 1 point
      const rateLimiterRes = await limiter.consume(key);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": Math.ceil(
          Date.now() + rateLimiterRes.msBeforeNext / 1000
        ),
      });

      next();
    } catch (rateLimiterRes: any) {
      // Rate limit exceeded
      const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;

      res.set({
        "Retry-After": String(secs),
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": Math.ceil(
          Date.now() + rateLimiterRes.msBeforeNext / 1000
        ),
      });

      console.warn(`${name} Rate limit exceeded for IP: ${req.ip}`);

      return res.status(429).json({
        success: false,
        error: "Too Many Requests",
        message: `Rate limit exceeded for ${name}. Try again in ${secs} seconds.`,
        retryAfter: secs,
      });
    }
  };
};

// Export middleware functions
export const globalRateLimiter = createRateLimitMiddleware(
  globalLimiter,
  "Global"
);
export const marketRateLimiter = createRateLimitMiddleware(
  marketLimiter,
  "Market API"
);
export const userRateLimiter = createRateLimitMiddleware(
  userLimiter,
  "User API"
);

// Advanced rate limiter for authenticated users - different limits based on user plan
export const createUserBasedRateLimiter = (
  limiter: RateLimiterRedis,
  name: string
) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // Use user ID if authenticated, otherwise fall back to IP
      const key = req.user?.id || req.ip;
      const pointsToConsume = req.user ? 1 : 5; // Consume more points for unauthenticated users

      const rateLimiterRes = await limiter.consume(key, pointsToConsume);

      res.set({
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": Math.ceil(
          Date.now() + rateLimiterRes.msBeforeNext / 1000
        ),
      });

      next();
    } catch (rateLimiterRes: any) {
      const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;

      res.set({
        "Retry-After": String(secs),
        "X-RateLimit-Limit": limiter.points,
        "X-RateLimit-Remaining": 0,
      });

      return res.status(429).json({
        success: false,
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${secs} seconds.`,
        retryAfter: secs,
      });
    }
  };
};

export const smartMarketLimiter = createUserBasedRateLimiter(
  marketLimiter,
  "Smart Market"
);
