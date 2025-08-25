// market-service/app.ts - Enhanced version
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { MarketDataController } from './controllers/marketDataController';
import { requestLogger } from './middlewares/logger';
import marketRoutes from './routes/marketRoutes';

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


app.use('/market',marketRoutes)


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
