// src/models/StockData.ts
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  marketCap?: number;
  pe?: number;
  high52w?: number;
  low52w?: number;
  timestamp: number;
  source: 'upstox' | 'yahoo' | 'cache';
}

export interface HistoricalData {
  symbol: string;
  data: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  source: 'upstox' | 'yahoo' | 'cache';
}

export interface MarketOverview {
  indices: {
    nifty50: StockQuote;
    sensex: StockQuote;
    bankNifty: StockQuote;
  };
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  mostActive: StockQuote[];
  lastUpdated: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  currency: string;
  marketCap?: number;
}
