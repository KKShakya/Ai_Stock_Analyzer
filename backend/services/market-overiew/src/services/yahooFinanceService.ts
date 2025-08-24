// src/services/yahooFinanceService.ts
import axios, { AxiosInstance } from 'axios';
import { StockQuote, HistoricalData } from '../models/stockData';

export class YahooFinanceService {
  private client: AxiosInstance;
  private baseUrl = 'https://query1.finance.yahoo.com';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Stock-Analyzer/1.0)'
      },
      timeout: 15000
    });
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const response = await this.client.get(`/v7/finance/quote?symbols=${yahooSymbol}`);
      
      if (response.data && response.data.quoteResponse && response.data.quoteResponse.result) {
        const quote = response.data.quoteResponse.result[0];
        return this.formatQuoteData(symbol, quote);
      }
      
      throw new Error(`No data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance getQuote error for ${symbol}:`, error);
      throw error;
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      // Yahoo Finance allows multiple symbols in one request
      const yahooSymbols = symbols.map(symbol => this.convertToYahooSymbol(symbol));
      const response = await this.client.get(`/v7/finance/quote?symbols=${yahooSymbols.join(',')}`);
      
      if (response.data && response.data.quoteResponse && response.data.quoteResponse.result) {
        return response.data.quoteResponse.result.map((quote: any, index: number) => 
          this.formatQuoteData(symbols[index], quote)
        );
      }
      
      return [];
    } catch (error) {
      console.error('Yahoo Finance getBatchQuotes error:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, period: string = '1mo'): Promise<HistoricalData> {
    try {
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const interval = this.getInterval(period);
      
      const response = await this.client.get(`/v8/finance/chart/${yahooSymbol}?period1=0&period2=9999999999&interval=${interval}`);
      
      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        return this.formatHistoricalData(symbol, result);
      }
      
      throw new Error(`No historical data found for symbol: ${symbol}`);
    } catch (error) {
      console.error(`Yahoo Finance getHistoricalData error for ${symbol}:`, error);
      throw error;
    }
  }

  async searchStocks(query: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`);
      
      if (response.data && response.data.quotes) {
        // Filter for Indian stocks (.NS, .BO endings)
        return response.data.quotes.filter((quote: any) => 
          quote.symbol.endsWith('.NS') || quote.symbol.endsWith('.BO')
        );
      }
      
      return [];
    } catch (error) {
      console.error('Yahoo Finance search error:', error);
      return [];
    }
  }

  private convertToYahooSymbol(symbol: string): string {
    // Convert NSE symbols to Yahoo format (add .NS suffix)
    if (symbol.includes('.')) {
      return symbol; // Already has exchange suffix
    }
    
    // Default to NSE for Indian stocks
    return `${symbol}.NS`;
  }

  private getInterval(period: string): string {
    const intervalMap: { [key: string]: string } = {
      '1d': '1m',
      '5d': '5m',
      '1mo': '1d',
      '3mo': '1d',
      '6mo': '1d',
      '1y': '1wk',
      '2y': '1wk',
      '5y': '1mo',
      '10y': '1mo'
    };
    
    return intervalMap[period] || '1d';
  }

  private formatQuoteData(symbol: string, quote: any): StockQuote {
    return {
      symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      open: quote.regularMarketOpen || 0,
      close: quote.regularMarketPreviousClose || 0,
      marketCap: quote.marketCap || 0,
      pe: quote.trailingPE || 0,
      high52w: quote.fiftyTwoWeekHigh || 0,
      low52w: quote.fiftyTwoWeekLow || 0,
      timestamp: Date.now(),
      source: 'yahoo'
    };
  }

  private formatHistoricalData(symbol: string, result: any): HistoricalData {
    const timestamps = result.timestamp || [];
    const ohlc = result.indicators?.quote?.[0] || {};
    
    const data = timestamps.map((timestamp: number, index: number) => ({
      timestamp: timestamp * 1000, // Convert to milliseconds
      open: ohlc.open?.[index] || 0,
      high: ohlc.high?.[index] || 0,
      low: ohlc.low?.[index] || 0,
      close: ohlc.close?.[index] || 0,
      volume: ohlc.volume?.[index] || 0
    }));

    return {
      symbol,
      data,
      source: 'yahoo'
    };
  }
}
