import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000","http://localhost:8080", ],
  credentials: true
}));
app.use(express.json());

// --- Static Dummy Chart Data ---
const DUMMY_CHART_DATA: Record<string, { date: string; close: number }[]> = {
  "NIFTY 50": [
    { date: "2025-08-12", close: 24710 },
    { date: "2025-08-13", close: 24790 },
    { date: "2025-08-14", close: 24755 },
    { date: "2025-08-15", close: 24820 },
    { date: "2025-08-16", close: 24837 },
    { date: "2025-08-17", close: 24885 },
    { date: "2025-08-18", close: 24920 },
  ],
  "BANKNIFTY": [
    { date: "2025-08-12", close: 52100 },
    { date: "2025-08-13", close: 52180 },
    { date: "2025-08-14", close: 52300 },
    { date: "2025-08-15", close: 52200 },
    { date: "2025-08-16", close: 52250 },
    { date: "2025-08-17", close: 52180 },
    { date: "2025-08-18", close: 52310 },
  ],
  "SENSEX": [
    { date: "2025-08-12", close: 82000 },
    { date: "2025-08-13", close: 82250 },
    { date: "2025-08-14", close: 82200 },
    { date: "2025-08-15", close: 82220 },
    { date: "2025-08-16", close: 82204 },
    { date: "2025-08-17", close: 82350 },
    { date: "2025-08-18", close: 82420 },
  ],
  "VIX": [
    { date: "2025-08-12", close: 12.6 },
    { date: "2025-08-13", close: 13.8 },
    { date: "2025-08-14", close: 14.2 },
    { date: "2025-08-15", close: 13.3 },
    { date: "2025-08-16", close: 13.2 },
    { date: "2025-08-17", close: 12.8 },
    { date: "2025-08-18", close: 12.4 },
  ]
};

const getMarketData = () => {
  const now = new Date();
  return {
    marketStatus: now.getHours() >= 9 && now.getHours() < 16 ? "open" : "closed",
    timestamp: now.toISOString(),
    indices: [
      { name: "NIFTY 50", value: 24837.2, change: +74.4, changePct: +0.30 },
      { name: "BANKNIFTY", value: 52250.8, change: -122.7, changePct: -0.23 },
      { name: "SENSEX", value: 82204.1, change: +245.3, changePct: +0.31 },
      { name: "VIX", value: 13.2, change: -0.8, changePct: -5.7 }
    ],
    nextOpenTime: "2025-08-18T09:15:00+05:30"
  };
};

// --- Health Route ---
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'market-service' });
});

// --- Market Overview Route ---
app.get('/market/overview', (req, res) => {
  res.json(getMarketData());
});

// --- Market Chart Route ---
app.get('/market/chart', (req, res) => {
  const index = String(req.query.index || 'NIFTY 50');
  const prices = DUMMY_CHART_DATA[index] || DUMMY_CHART_DATA['NIFTY 50'];
  res.json({ index, prices });
});

export default app;
