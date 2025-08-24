// frontend/store/market-data-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { marketClient, StockQuote, HistoricalData } from '../lib/api/market-client';

interface MarketDataState {
  // Data
  quotes: Map<string, StockQuote>;
  historicalData: Map<string, HistoricalData>;
  dashboardData: any | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // WebSocket State
  isConnected: boolean;
  subscriptions: Set<string>;

  // Actions
  getQuote: (symbol: string) => Promise<StockQuote>;
  getHistoricalData: (symbol: string, timeframe?: string) => Promise<HistoricalData>;
  searchStocks: (query: string) => Promise<any[]>;
  getDashboardData: () => Promise<void>;
  
  // Real-time actions
  connectWebSocket: () => Promise<void>;
  subscribeToStock: (symbol: string) => void;
  unsubscribeFromStock: (symbol: string) => void;
  
  // Utility actions
  clearError: () => void;
  clearCache: () => void;
}

export const useMarketDataStore = create<MarketDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      quotes: new Map(),
      historicalData: new Map(),
      dashboardData: null,
      isLoading: false,
      error: null,
      lastUpdated: 0,
      isConnected: false,
      subscriptions: new Set(),

      // Quote fetching with caching
      getQuote: async (symbol: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const quote = await marketClient.getQuote(symbol);
          
          set(state => ({
            quotes: new Map(state.quotes).set(symbol, quote),
            isLoading: false,
            lastUpdated: Date.now()
          }));
          
          return quote;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quote';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Historical data fetching
      getHistoricalData: async (symbol: string, timeframe = '1mo') => {
        set({ isLoading: true, error: null });
        
        try {
          const data = await marketClient.getHistoricalData(symbol, timeframe);
          const key = `${symbol}:${timeframe}`;
          
          set(state => ({
            historicalData: new Map(state.historicalData).set(key, data),
            isLoading: false,
            lastUpdated: Date.now()
          }));
          
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical data';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Stock search
      searchStocks: async (query: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const results = await marketClient.searchStocks(query);
          set({ isLoading: false });
          return results;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Search failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Dashboard data
      getDashboardData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const data = await marketClient.getDashboardData();
          set({ 
            dashboardData: data, 
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // WebSocket connection
      connectWebSocket: async () => {
        try {
          await marketClient.connectWebSocket();
          set({ isConnected: true });
        } catch (error) {
          console.error('WebSocket connection failed:', error);
          set({ isConnected: false });
        }
      },

      // Subscribe to real-time updates
      subscribeToStock: (symbol: string) => {
        const { subscriptions } = get();
        if (subscriptions.has(symbol)) return;

        marketClient.subscribeToStock(symbol, (data) => {
          set(state => ({
            quotes: new Map(state.quotes).set(symbol, {
              symbol: data.symbol,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              volume: data.volume,
              source: 'websocket' as const,
              timestamp: data.timestamp
            })
          }));
        });

        set(state => ({
          subscriptions: new Set(state.subscriptions).add(symbol)
        }));
      },

      // Unsubscribe from updates
      unsubscribeFromStock: (symbol: string) => {
        marketClient.unsubscribeFromStock(symbol);
        
        set(state => {
          const newSubscriptions = new Set(state.subscriptions);
          newSubscriptions.delete(symbol);
          return { subscriptions: newSubscriptions };
        });
      },

      // Utility actions
      clearError: () => set({ error: null }),
      
      clearCache: () => set({ 
        quotes: new Map(), 
        historicalData: new Map(),
        dashboardData: null
      })
    }),
    {
      name: 'market-data-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist quotes and dashboard data, not loading states
        quotes: Array.from(state.quotes.entries()),
        dashboardData: state.dashboardData,
        lastUpdated: state.lastUpdated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert quotes array back to Map
          state.quotes = new Map(state.quotes as any);
          state.historicalData = new Map();
          state.isLoading = false;
          state.error = null;
          state.isConnected = false;
          state.subscriptions = new Set();
        }
      }
    }
  )
);
