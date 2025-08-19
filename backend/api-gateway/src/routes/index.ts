import { Router } from 'express';
import type { Request, Response } from 'express';
import fetch from 'node-fetch';
import { env } from '../config/env';

const MARKET_SERVICE_URL = process.env.MARKET_SERVICE_URL || "http://localhost:5001";
const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', time: new Date().toISOString() });
});


// user service routes
router.use('/auth', createProxyMiddleware({ 
  target: 'http://localhost:5002', 
  changeOrigin: true 
}));

router.use('/user', createProxyMiddleware({ 
  target: 'http://localhost:5002', 
  changeOrigin: true 
}));





// Proxy for market overview data
router.get("/market/overview", async (req, res) => {
  try {
    const response = await fetch(`${MARKET_SERVICE_URL}/market/overview`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to connect to Market Service", details: err.message });
  }
});

// Proxy for market chart data
// expected query parameter: index (e.g., NIFTY 50, BANKNIFTY)
router.get("/market/chart", async (req, res) => {
  try {
    const response = await fetch(`${MARKET_SERVICE_URL}/market/chart?index=${req.query.index}`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to connect to Market Service", details: err.message });
  }
});





export default router;
