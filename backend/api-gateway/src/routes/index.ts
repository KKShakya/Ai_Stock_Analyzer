import { Router } from "express";
import type { Request, Response } from "express";
import fetch from "node-fetch";
import { env } from "../config/env";
import { createProxyMiddleware } from "http-proxy-middleware";

const MARKET_SERVICE_URL =
  process.env.MARKET_SERVICE_URL || "http://localhost:5001";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5002";
const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    service: "api-gateway",
    status: "ok",
    time: new Date().toISOString(),
  });
});

// User Service Proxy - Fixed
router.use(
  "/auth",
  createProxyMiddleware({
    target: `${USER_SERVICE_URL}/auth`,
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

// Proxy for market overview data
router.get("/market/overview", async (req, res) => {
  try {
    const response = await fetch(`${MARKET_SERVICE_URL}/market/overview`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to connect to Market Service",
      details: err.message,
    });
  }
});

// Proxy for market chart data
// expected query parameter: index (e.g., NIFTY 50, BANKNIFTY)
router.get("/market/chart", async (req, res) => {
  try {
    const response = await fetch(
      `${MARKET_SERVICE_URL}/market/chart?index=${req.query.index}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to connect to Market Service",
      details: err.message,
    });
  }
});

export default router;
