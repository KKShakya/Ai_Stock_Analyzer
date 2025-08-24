// market-service/app.ts - Enhanced version
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { MarketDataController } from './controllers/marketDataController';
import { requestLogger } from './middlewares/logger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5003;

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8080"],
  credentials: true
}));
app.use(express.json());

// Initialize controller
const marketController = new MarketDataController();


// Request logging
app.use(requestLogger);


// **Enhanced routes with real API integration**
app.get('/health', (req, res) => {
  res.json({ 
    service: 'market-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    upstoxEnabled: !!process.env.UPSTOX_ACCESS_TOKEN
  });
});

// 

// Chart data - enhanced with real historical data
app.get('/market/chart', async (req, res) => {
  try {
    await marketController.getHistoricalData(req, res);
  } catch (error) {
    // Fallback to your existing dummy data
    console.warn('Historical API failed, using fallback data:', error);
    const index = String(req.query.index || 'NIFTY 50');
    const DUMMY_CHART_DATA: Record<string, { date: string; close: number }[]> = {
      "NIFTY 50": [
        { date: "2025-08-12", close: 24710 },
        { date: "2025-08-13", close: 24790 },
        { date: "2025-08-14", close: 24755 },
        { date: "2025-08-15", close: 24820 },
        { date: "2025-08-16", close: 24837 },
        { date: "2025-08-17", close: 24885 },
        { date: "2025-08-18", close: 24920 },
      ]
    };
    const prices = DUMMY_CHART_DATA[index] || DUMMY_CHART_DATA['NIFTY 50'];
    res.json({ index, prices });
  }
});

app.get('/market/overview', async (req, res) => {
  await marketController.getMarketOverview(req, res);
})


// **New API endpoints for real market data**
app.get('/market/quote/:symbol', async (req, res) => {
  await marketController.getQuote(req, res);
});

app.get('/market/quotes', async (req, res) => {
  await marketController.getBatchQuotes(req, res);
});

app.get('/market/search', async (req, res) => {
  await marketController.searchStocks(req, res);
});

// Error handling
// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal gateway error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found`
  });
});

export default app;
