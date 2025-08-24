// api-gateway/src/routes/marketProxy.ts
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { marketRateLimiter } from '../middlewares/rateLimiter';
import { Request, Response } from 'express';

const router = Router();

const MARKET_SERVICE_URL = process.env.MARKET_SERVICE_URL || 'http://localhost:5003';

// Market Service Proxy - Following your userProxy pattern exactly
router.use(
  "/market",
  marketRateLimiter, // Only rate limiting, no auth at gateway level
  createProxyMiddleware({
    target: `${MARKET_SERVICE_URL}/market`, // Direct target mapping like userProxy
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    logLevel: "debug",
    onProxyReq: (proxyReq, req: any, res) => {
      console.log(`[Market Proxy] ${req.method} ${req.path} -> ${MARKET_SERVICE_URL}/market`);
    },
    on: {
      error: (err: Error, req: Request, res: Response) => {
        console.error("Market Service Proxy Error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to connect to Market Service",
            details: err.message,
          })
        );
      },
    },
  })
);

export default router;
