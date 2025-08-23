// store/price-chart-store.ts
import { create } from 'zustand';

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  data: PricePoint[];
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

interface PriceChartState {
  chartData: ChartData | null;
  isLoading: boolean;
  selectedTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  
  // Actions
  setChartData: (data: ChartData) => void;
  setLoading: (loading: boolean) => void;
  setTimeframe: (timeframe: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
  fetchChartData: (symbol: string, timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y') => Promise<void>;
}

export const usePriceChartStore = create<PriceChartState>((set, get) => ({
  chartData: null,
  isLoading: false,
  selectedTimeframe: '1D',
  
  setChartData: (chartData) => set({ chartData }),
  setLoading: (isLoading) => set({ isLoading }),
  setTimeframe: (selectedTimeframe) => set({ selectedTimeframe }),
  
  // Future-ready API call - currently uses mock data
  fetchChartData: async (symbol: string, timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y') => {
    const { setLoading, setChartData, selectedTimeframe } = get();
    const tf = timeframe || selectedTimeframe;
    
    set({ selectedTimeframe: tf });
    setLoading(true);
    
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/stocks/${symbol}/chart?timeframe=${tf}`);
      // const data = await response.json();
      
      // For now, generate mock data
      setTimeout(() => {
        const mockData = generateMockChartData(symbol, tf);
        setChartData(mockData);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Chart data fetch error:', error);
      setLoading(false);
    }
  }
}));

// Mock data generator (replace with real API later)
function generateMockChartData(symbol: string, timeframe: string): ChartData {
  const now = Date.now();
  const dataPoints = getDataPointsForTimeframe(timeframe);
  const intervalMs = getIntervalForTimeframe(timeframe);
  
  let basePrice = Math.random() * 300 + 100; // Random starting price
  const volatility = 0.02; // 2% volatility
  
  const data: PricePoint[] = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - 1 - i) * intervalMs;
    
    // Generate realistic price movement
    const randomWalk = (Math.random() - 0.5) * volatility;
    const trend = Math.sin(i / dataPoints * Math.PI * 2) * 0.001; // Subtle trend
    basePrice *= (1 + randomWalk + trend);
    
    data.push({
      timestamp,
      price: basePrice,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;
  
  return {
    symbol,
    timeframe: timeframe as any,
    data,
    currentPrice: lastPrice,
    change,
    changePercent,
    lastUpdated: now
  };
}

function getDataPointsForTimeframe(timeframe: string): number {
  switch (timeframe) {
    case '1D': return 78; // Every 5 minutes during trading hours
    case '1W': return 35; // Every 2 hours
    case '1M': return 30; // Daily
    case '3M': return 65; // Daily
    case '1Y': return 52; // Weekly
    default: return 30;
  }
}

function getIntervalForTimeframe(timeframe: string): number {
  switch (timeframe) {
    case '1D': return 5 * 60 * 1000; // 5 minutes
    case '1W': return 2 * 60 * 60 * 1000; // 2 hours
    case '1M': return 24 * 60 * 60 * 1000; // 1 day
    case '3M': return 24 * 60 * 60 * 1000; // 1 day
    case '1Y': return 7 * 24 * 60 * 60 * 1000; // 1 week
    default: return 24 * 60 * 60 * 1000;
  }
}
