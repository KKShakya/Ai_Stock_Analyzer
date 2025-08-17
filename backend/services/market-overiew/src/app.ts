import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'market-service' });
});

// Market overview
app.get('/market/overview', (req, res) => {
  res.json(getMarketData());
});

export default app;
