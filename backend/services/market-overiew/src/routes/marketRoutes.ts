
import { Router } from 'express';
import { MarketDataController } from '../controllers/marketDataController';

const router = Router();
const marketController = new MarketDataController();

// Quote endpoints
router.get('/quote/:symbol', (req, res) => marketController.getQuote(req, res));
router.get('/quotes', (req, res) => marketController.getBatchQuotes(req, res));

// Historical data
router.get('/historical/:symbol', (req, res) => marketController.getHistoricalData(req, res));

// Search
router.get('/search', (req, res) => marketController.searchStocks(req, res));

// Market overview
router.get('/overview', (req, res) => marketController.getMarketOverview(req, res));

// Health check
router.get('/health', (req, res) => marketController.getHealth(req, res));

export default router;
