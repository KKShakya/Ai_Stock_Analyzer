// src/controllers/marketDataController.ts
import { Request, Response } from "express";
import { UpstoxService } from "../services/upstoxServices";
import { ChartDataService } from "../services/nseServices";
import { YahooFinanceService } from "../services/yahooFinanceService";
import { CacheService } from "../services/cacheService";
import { RateLimitService } from "../services/rateLimitService";
import {
  StockQuote,
  HistoricalData,
  MarketOverview,
} from "../models/stockData";

export class MarketDataController {
  private upstoxService: UpstoxService;
  private yahooService: YahooFinanceService;
  private cacheService: CacheService;
  private rateLimitService: RateLimitService;
  private ChartDataService: ChartDataService;

  constructor() {
    this.upstoxService = new UpstoxService();
    this.yahooService = new YahooFinanceService();
    this.cacheService = new CacheService();
    this.rateLimitService = new RateLimitService();
    this.ChartDataService = new ChartDataService();
  }

  // GET /api/market/quote/:symbol
  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const userId = (req.headers["x-user-id"] as string) || "anonymous";

      // Check cache first
      const cacheKey = `quote:${symbol}`;
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        res.json({
          success: true,
          data: { ...cachedData, source: "cache" },
          cached: true,
        });
        return;
      }

      // Check rate limits
      if (!this.rateLimitService.canMakeRequest(userId, "upstox")) {
        res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          retryAfter: this.rateLimitService.getResetTime(userId, "upstox"),
        });
        return;
      }

      let stockData: StockQuote;

      try {
        // Try Upstox first
        stockData = await this.upstoxService.getQuote(symbol);
        this.rateLimitService.recordRequest(userId, "upstox");
      } catch (upstoxError) {
        console.warn(
          `Upstox failed for ${symbol}, trying Yahoo Finance:`,
          upstoxError
        );

        // Fallback to Yahoo Finance
        try {
          stockData = await this.yahooService.getQuote(symbol);
          this.rateLimitService.recordRequest(userId, "yahoo");
        } catch (yahooError) {
          console.error(`Both services failed for ${symbol}:`, yahooError);
          res.status(503).json({
            success: false,
            error: "Market data services temporarily unavailable",
            details: "Please try again later",
          });
          return;
        }
      }

      // Cache for 30 seconds for real-time quotes
      await this.cacheService.set(cacheKey, stockData, 30);

      res.json({
        success: true,
        data: stockData,
        cached: false,
      });
    } catch (error) {
      console.error("Market data controller error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // GET /api/market/quotes (batch quotes)
  async getBatchQuotes(req: Request, res: Response): Promise<void> {
    try {
      const symbols = req.query.symbols as string;
      const userId = (req.headers["x-user-id"] as string) || "anonymous";

      if (!symbols) {
        res.status(400).json({
          success: false,
          error: "Symbols parameter is required",
        });
        return;
      }

      const symbolList = symbols
        .split(",")
        .map((s) => s.trim())
        .slice(0, 50); // Limit to 50 symbols

      // Check cache for all symbols
      const cachedQuotes: StockQuote[] = [];
      const uncachedSymbols: string[] = [];

      for (const symbol of symbolList) {
        const cacheKey = `quote:${symbol}`;
        const cachedData = await this.cacheService.get(cacheKey);
        if (cachedData) {
          cachedQuotes.push({ ...cachedData, source: "cache" as const });
        } else {
          uncachedSymbols.push(symbol);
        }
      }

      let freshQuotes: StockQuote[] = [];

      if (uncachedSymbols.length > 0) {
        // Check rate limits
        if (!this.rateLimitService.canMakeRequest(userId, "upstox")) {
          // Return only cached data if rate limited
          res.json({
            success: true,
            data: cachedQuotes,
            message: "Rate limited, returning cached data only",
            cached: true,
          });
          return;
        }

        try {
          // Try Upstox first
          freshQuotes = await this.upstoxService.getBatchQuotes(
            uncachedSymbols
          );
          this.rateLimitService.recordRequest(userId, "upstox");
        } catch (upstoxError) {
          console.warn(
            "Upstox batch failed, trying Yahoo Finance:",
            upstoxError
          );

          try {
            freshQuotes = await this.yahooService.getBatchQuotes(
              uncachedSymbols
            );
            this.rateLimitService.recordRequest(userId, "yahoo");
          } catch (yahooError) {
            console.error("Both services failed for batch quotes:", yahooError);
            // Return cached data if available
            if (cachedQuotes.length > 0) {
              res.json({
                success: true,
                data: cachedQuotes,
                message: "Services unavailable, returning cached data",
                cached: true,
              });
              return;
            }
          }
        }

        // Cache fresh data
        for (const quote of freshQuotes) {
          const cacheKey = `quote:${quote.symbol}`;
          await this.cacheService.set(cacheKey, quote, 30);
        }
      }

      const allQuotes = [...cachedQuotes, ...freshQuotes];

      res.json({
        success: true,
        data: allQuotes,
        cached: cachedQuotes.length > 0,
        fresh: freshQuotes.length,
      });
    } catch (error) {
      console.error("Batch quotes error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // GET /api/market/historical/:symbol
  async getHistoricalData(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const { period = "1mo", interval = "1d" } = req.query;
      const userId = (req.headers["x-user-id"] as string) || "anonymous";

      // Check cache first (historical data can be cached longer)
      const cacheKey = `historical:${symbol}:${period}:${interval}`;
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        res.json({
          success: true,
          data: { ...cachedData, source: "cache" },
          cached: true,
        });
        return;
      }

      // Check rate limits
      if (!this.rateLimitService.canMakeRequest(userId, "yahoo")) {
        res.status(429).json({
          success: false,
          error: "Rate limit exceeded for historical data",
        });
        return;
      }

      // Yahoo Finance is better for historical data
      const historicalData = await this.yahooService.getHistoricalData(
        symbol,
        period as string
      );
      this.rateLimitService.recordRequest(userId, "yahoo");

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, historicalData, 3600);

      res.json({
        success: true,
        data: historicalData,
        cached: false,
      });
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch historical data",
      });
    }
  }

  // GET /api/market/search
  async searchStocks(req: Request, res: Response): Promise<void> {
    try {
      const { q: query } = req.query;
      const userId = (req.headers["x-user-id"] as string) || "anonymous";

      if (!query || typeof query !== "string") {
        res.status(400).json({
          success: false,
          error: "Search query is required",
        });
        return;
      }

      // Check cache
      const cacheKey = `search:${query.toLowerCase()}`;
      const cachedResults = await this.cacheService.get(cacheKey);
      if (cachedResults) {
        res.json({
          success: true,
          data: cachedResults,
          cached: true,
        });
        return;
      }

      // Check rate limits
      if (!this.rateLimitService.canMakeRequest(userId, "yahoo")) {
        res.status(429).json({
          success: false,
          error: "Search rate limit exceeded",
        });
        return;
      }

      const results = await this.yahooService.searchStocks(query);
      this.rateLimitService.recordRequest(userId, "yahoo");

      // Cache search results for 5 minutes
      await this.cacheService.set(cacheKey, results, 300);

      res.json({
        success: true,
        data: results,
        cached: false,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        error: "Search failed",
      });
    }
  }

  // GET /api/market/overview
  async getMarketOverview(req: Request, res: Response): Promise<void> {
    try {
      // Cache check first
      const cacheKey = "market:overview";
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        res.json({
          success: true,
          indices: cachedData,
          source: "cache",
          lastUpdated: new Date().toISOString(),
        });
        return;
      }

      // Get the 4 main indices using OHLC endpoint (more reliable)
      const indices = ["NIFTY", "SENSEX", "BANKNIFTY", "VIX"];

      // 🔥 SWITCH TO OHLC ENDPOINT - More reliable for indices
      const indexData = await this.upstoxService.getBatchOHLCQuotes(indices);

      // Format EXACTLY as your frontend expects
      const formattedIndices = indexData.map((data) => ({
        name: this.getDisplayName(data.symbol),
        value: data.lastPrice, // Use last_price from OHLC
        change: data.change,
        changePct: data.changePercent,
      }));

      // Cache for 30 seconds
      await this.cacheService.set(cacheKey, formattedIndices, 30);

      // Response structure matching your component
      res.json({
        success: true,
        indices: formattedIndices,
        source: "live",
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Market overview error:", error);

      // Fallback to dummy data so your component never breaks
      res.json({
        success: true,
        indices: [
          { name: "NIFTY 50", value: 24870.1, change: 74.4, changePct: 0.3 },
          { name: "SENSEX", value: 81306.85, change: 245.3, changePct: 0.31 },
          {
            name: "BANKNIFTY",
            value: 52250.8,
            change: -122.7,
            changePct: -0.23,
          },
          { name: "VIX", value: 13.2, change: -0.8, changePct: -5.7 },
        ],
        source: "fallback",
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  //GET /api/market/chart?index=NIFTY 50
  async getChartData(req: Request, res: Response): Promise<void> {
    try {
      const {
        symbol = "NIFTY 50",
        timeframe = "1D",
        type = "candlestick",
      } = req.query;

      console.log(`Fetching HISTORICAL chart data: ${symbol}, ${timeframe}`);

      let chartData;

      try {
        // 🔥 GET MULTIPLE MONTHS OF DATA FOR EACH TIMEFRAME
        chartData = await this.upstoxService.getHistoricalCandles(
          symbol as string,
          timeframe as string
        );
      } catch (error) {
        console.warn(`Historical API failed, using mock data:`, error);
        chartData = this.upstoxService.generateRealisticHistoricalData(
          symbol as string,
          timeframe as string,
          type as string
        );
      }

      res.json({
        success: true,
        data: {
          symbol: symbol as string,
          timeframe: timeframe as string,
          chartType: type as string,
          data: chartData.data,
          currentPrice: chartData.currentPrice,
          change: chartData.change,
          changePercent: chartData.changePercent,
          totalPoints: chartData.data.length,
          source: chartData.source,
          lastUpdated: Date.now(),
        },
      });
    } catch (error) {
      console.error(`Chart API error:`, error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch chart data",
      });
    }
  }

  private generateChartData(
    symbol: string,
    timeframe: string,
    chartType: string
  ) {
    const dataPointsMap = {
      "1D": 78,
      "1W": 35,
      "1M": 22,
      "1Y": 52,
    };

    const pointCount = dataPointsMap[timeframe] || 50;
    const basePrice =
      symbol === "NIFTY 50" ? 24750 : symbol === "BANKNIFTY" ? 51200 : 81500;
    const data = [];

    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);
    const timeInterval = 300; // 5 minutes

    for (let i = 0; i < pointCount; i++) {
      const timestamp = now - (pointCount - i - 1) * timeInterval;

      if (chartType === "candlestick") {
        const open = currentPrice;
        const volatility = currentPrice * 0.012;
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);

        data.push({
          time: timestamp,
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
        });
        currentPrice = close;
      } else {
        const change = (Math.random() - 0.5) * 50;
        currentPrice += change;

        data.push({
          time: timestamp,
          value: Math.round(currentPrice * 100) / 100,
        });
      }
    }

    const firstPrice =
      chartType === "candlestick" ? data[0]?.close : data[0]?.value;
    const lastPrice =
      chartType === "candlestick"
        ? data[data.length - 1]?.close
        : data[data.length - 1]?.value;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      data,
      currentPrice: lastPrice,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  }

  // Add this method to your MarketDataController class
  private generateRealisticChartData(
    symbol: string,
    timeframe: string,
    type: string
  ) {
    const dataPointsMap = {
      "1D": 78,
      "1W": 35,
      "1M": 22,
      "1Y": 52,
    };

    const pointCount =
      dataPointsMap[timeframe as keyof typeof dataPointsMap] || 50;

    const basePrices = {
      "NIFTY 50": 24750,
      BANKNIFTY: 51200,
      SENSEX: 81500,
    };

    const basePrice = basePrices[symbol as keyof typeof basePrices] || 24750;
    const data = [];

    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);
    const timeInterval = 300; // 5 minutes

    for (let i = 0; i < pointCount; i++) {
      const timestamp = now - (pointCount - i - 1) * timeInterval;

      if (type === "candlestick") {
        const open = currentPrice;
        const volatility = currentPrice * 0.012;

        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);

        data.push({
          time: timestamp,
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
        });

        currentPrice = close;
      } else {
        const change = (Math.random() - 0.5) * 50;
        currentPrice += change;

        data.push({
          time: timestamp,
          value: Math.round(currentPrice * 100) / 100,
        });
      }
    }

    const firstPrice = type === "candlestick" ? data[0]?.close : data[0]?.value;
    const lastPrice =
      type === "candlestick"
        ? data[data.length - 1]?.close
        : data[data.length - 1]?.value;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      data,
      currentPrice: lastPrice,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      source: "fallback",
    };
  }

  private getDisplayName(symbol: string): string {
    const nameMap = {
      NIFTY: "NIFTY 50",
      SENSEX: "SENSEX",
      BANKNIFTY: "BANKNIFTY",
      // 'VIX': 'VIX'
    };
    return nameMap[symbol] || symbol;
  }

  // GET /api/market/health
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const cacheStats = await this.cacheService.getStats();
      const rateLimitStats = this.rateLimitService.getStats();

      res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          upstox: process.env.UPSTOX_ACCESS_TOKEN
            ? "configured"
            : "not configured",
          yahoo: "available",
          cache: cacheStats,
          rateLimit: rateLimitStats,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Health check failed",
      });
    }
  }
}
