// api-gateway/src/routes/userProxy.ts
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { userRateLimiter } from '../middlewares/rateLimiter';
import { Request, Response } from 'express';

const router = Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';

// Your working design - just adding rate limiting
router.use(
  "/auth",
  userRateLimiter, // Only addition: rate limiting with rate-limiter-flexible
  createProxyMiddleware({
    target: `${USER_SERVICE_URL}/auth`, // Keep your working target
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    logLevel: "debug",
    on: {
      error: (err: Error, req: Request, res: Response) => {
        console.error("User Service Proxy Error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to connect to User Service",
            details: err.message,
          })
        );
      },
    },
  })
);

router.use(
  "/user",
  userRateLimiter, // Only addition: rate limiting
  createProxyMiddleware({
    target: `${USER_SERVICE_URL}/user`, // Keep your working target
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    logLevel: "debug",
    on: {
      error: (err: Error, req: Request, res: Response) => {
        console.error("User Service Proxy Error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to connect to User Service",
            details: err.message,
          })
        );
      },
    },
  })
);

export default router;
