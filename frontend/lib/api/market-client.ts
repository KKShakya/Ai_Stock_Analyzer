// frontend/lib/api/market-client.ts
import { io, Socket } from 'socket.io-client';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  source: 'upstox' | 'yahoo' | 'cache';
  timestamp: number;
}

export interface HistoricalData {
  symbol: string;
  timeframe: string;
  data: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export class MarketClient {
  private baseURL: string;
  private socket: Socket | null = null;
  private subscriptions: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  private async getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/api/v1/market/quote/${symbol}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getHistoricalData(symbol: string, timeframe: string = '1mo'): Promise<HistoricalData> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseURL}/api/v1/market/historical/${symbol}?timeframe=${timeframe}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }

    const result = await response.json();
    return result.data;
  }

  async searchStocks(query: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseURL}/api/v1/market/search?q=${encodeURIComponent(query)}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Stock search failed');
    }

    const result = await response.json();
    return result.data;
  }

  async getDashboardData(): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/api/v1/market/dashboard`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const result = await response.json();
    return result.data;
  }

  // Real-time WebSocket methods
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('accessToken');
      
      this.socket = io(this.baseURL, {
        auth: { token },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection failed:', error);
        reject(error);
      });

      this.socket.on('price-update', (data) => {
        const callback = this.subscriptions.get(data.symbol);
        if (callback) {
          callback(data);
        }
      });
    });
  }

  subscribeToStock(symbol: string, callback: (data: any) => void): void {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }

    this.subscriptions.set(symbol, callback);
    this.socket.emit('subscribe-stock', { 
      symbol, 
      userId: this.getCurrentUserId() 
    });
  }

  unsubscribeFromStock(symbol: string): void {
    if (!this.socket) return;

    this.subscriptions.delete(symbol);
    this.socket.emit('unsubscribe-stock', { 
      symbol, 
      userId: this.getCurrentUserId() 
    });
  }

  private getCurrentUserId(): string {
    // Get user ID from your auth store or JWT token
    return 'user-id'; // Replace with actual implementation
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
  }
}

// Singleton instance
export const marketClient = new MarketClient();
