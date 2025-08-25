import { create } from 'zustand';

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  // For candlestick support
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface ChartData {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  chartType: 'line' | 'candlestick';
  data: PricePoint[];
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

interface PriceChartStore {
  // Data
  chartData: ChartData | null;
  isLoading: boolean;
  error: string | null;
  
  // UI State
  selectedTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  chartType: 'line' | 'candlestick';
  
  // Actions
  setTimeframe: (timeframe: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
  setChartType: (type: 'line' | 'candlestick') => void;
  fetchChartData: (symbol: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePriceChartStore = create<PriceChartStore>((set, get) => ({
  // Initial State
  chartData: null,
  isLoading: false,
  error: null,
  selectedTimeframe: '1D',
  chartType: 'line',
  
  // Actions
  setTimeframe: (timeframe) => {
    set({ selectedTimeframe: timeframe });
    // Auto-fetch when timeframe changes
    const { chartData } = get();
    if (chartData?.symbol) {
      get().fetchChartData(chartData.symbol);
    }
  },
  
  setChartType: (type) => {
    set({ chartType: type });
    // No need to re-fetch data, just re-render
  },
  
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  fetchChartData: async (symbol) => {
    const { selectedTimeframe, chartType } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 RICH MOCK DATA - Replace this later with real API
      const mockData = generateRealisticMockData(symbol, selectedTimeframe, chartType);
      
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        chartData: {
          symbol,
          timeframe: selectedTimeframe,
          chartType,
          ...mockData
        },
        isLoading: false 
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chart data',
        isLoading: false 
      });
    }
  }
}));

// 🔥 COMPLETE ENHANCED MOCK DATA GENERATOR
const generateRealisticMockData = (symbol: string, timeframe: string, chartType: 'line' | 'candlestick') => {
  const dataPointsMap = {
    '1D': 78,   // Every 5 minutes (9:15 AM - 3:30 PM)
    '1W': 35,   // Every 2 hours over a week
    '1M': 22,   // Daily over a month
    '3M': 65,   // Daily over 3 months
    '1Y': 52    // Weekly over a year
  };

  const pointCount = dataPointsMap[timeframe] || 30;
  
  // Symbol-specific base prices
  const basePrices: { [key: string]: number } = {
    'NIFTY 50': 24500 + Math.random() * 500,      // 24500-25000
    'BANKNIFTY': 51000 + Math.random() * 1000,    // 51000-52000
    'SENSEX': 80000 + Math.random() * 2000,       // 80000-82000
  };
  
  const basePrice = basePrices[symbol] || 25000;
  const data: PricePoint[] = [];
  
  let currentPrice = basePrice;
  const now = Date.now();
  const timeInterval = getTimeInterval(timeframe);

  // Generate realistic market movements
  for (let i = 0; i < pointCount; i++) {
    const timestamp = now - (pointCount - i - 1) * timeInterval;
    
    if (chartType === 'candlestick') {
      // Generate OHLC data for candlesticks
      const open = currentPrice;
      const volatility = currentPrice * getVolatility(symbol, timeframe);
      
      // Generate realistic high/low spreads
      const range = volatility * (0.5 + Math.random() * 0.8);
      const high = open + range * (0.3 + Math.random() * 0.7);
      const low = open - range * (0.3 + Math.random() * 0.7);
      
      // Close price with trend bias
      const trendBias = getTrendBias(i, pointCount, symbol);
      const close = low + (high - low) * (0.2 + Math.random() * 0.6 + trendBias);
      
      data.push({
        timestamp,
        price: close, // For backward compatibility
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: generateVolume(symbol, timeframe, i, pointCount)
      });
      
      currentPrice = close;
    } else {
      // Generate line chart data with realistic movements
      const volatility = currentPrice * getVolatility(symbol, timeframe);
      const trendBias = getTrendBias(i, pointCount, symbol);
      const change = (Math.random() - 0.5) * volatility * 2 + trendBias * currentPrice * 0.01;
      
      currentPrice += change;
      currentPrice = Math.round(currentPrice * 100) / 100;
      
      data.push({
        timestamp,
        price: currentPrice,
        volume: generateVolume(symbol, timeframe, i, pointCount)
      });
    }
  }

  // Calculate overall change
  const firstPrice = data[0]?.price || basePrice;
  const lastPrice = data[data.length - 1]?.price || basePrice;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  return {
    data,
    currentPrice: lastPrice,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    lastUpdated: Date.now()
  };
};

// Helper functions for realistic data generation
const getTimeInterval = (timeframe: string): number => {
  const intervals: { [key: string]: number } = {
    '1D': 5 * 60 * 1000,      // 5 minutes
    '1W': 2 * 60 * 60 * 1000, // 2 hours
    '1M': 24 * 60 * 60 * 1000, // 1 day
    '3M': 24 * 60 * 60 * 1000, // 1 day
    '1Y': 7 * 24 * 60 * 60 * 1000 // 1 week
  };
  return intervals[timeframe] || intervals['1D'];
};

const getVolatility = (symbol: string, timeframe: string): number => {
  const baseVolatilities: { [key: string]: number } = {
    'NIFTY 50': 0.015,     // 1.5% volatility
    'BANKNIFTY': 0.025,    // 2.5% volatility 
    'SENSEX': 0.012        // 1.2% volatility
  };
  
  const timeframeMultipliers: { [key: string]: number } = {
    '1D': 1.0,
    '1W': 0.8,
    '1M': 0.6,
    '3M': 0.4,
    '1Y': 0.3
  };
  
  const baseVol = baseVolatilities[symbol] || 0.015;
  const multiplier = timeframeMultipliers[timeframe] || 1.0;
  
  return baseVol * multiplier;
};

const getTrendBias = (index: number, total: number, symbol: string): number => {
  // Add subtle trend bias to make data look more realistic
  const progress = index / total;
  
  // Different symbols can have different trend patterns
  const trendPatterns: { [key: string]: number } = {
    'NIFTY 50': Math.sin(progress * Math.PI * 2) * 0.3,  // Oscillating
    'BANKNIFTY': progress * 0.2 - 0.1,                   // Slight upward trend
    'SENSEX': Math.cos(progress * Math.PI * 3) * 0.2     // More volatile
  };
  
  return trendPatterns[symbol] || 0;
};

const generateVolume = (symbol: string, timeframe: string, index: number, total: number): number => {
  const baseVolumes: { [key: string]: number } = {
    'NIFTY 50': 2000000,
    'BANKNIFTY': 1500000,
    'SENSEX': 1800000
  };
  
  const baseVolume = baseVolumes[symbol] || 1000000;
  
  // Add volume patterns (higher at open/close, lower in middle)
  const progress = index / total;
  const volumeMultiplier = 0.5 + Math.abs(Math.sin(progress * Math.PI)) * 1.5;
  
  // Add random variation
  const randomVariation = 0.7 + Math.random() * 0.6;
  
  return Math.floor(baseVolume * volumeMultiplier * randomVariation);
};
