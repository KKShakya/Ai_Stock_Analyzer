"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createChart, ColorType, LineStyle, CandlestickSeries, LineSeries } from 'lightweight-charts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Maximize2,
  ChevronDown,
  LineChart,
  CandlestickChart
} from "lucide-react";
import SectionCard from "@/components/ui/section-card";

interface PriceChartProps {
  symbol?: string;
  className?: string;
}

export default function PriceChart({ symbol = 'NIFTY 50', className }: PriceChartProps) {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const candlestickSeries = useRef<any>(null);
  const lineSeries = useRef<any>(null);

  const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const indices = [
    { value: 'NIFTY 50', label: 'Nifty 50' },
    { value: 'BANKNIFTY', label: 'Bank Nifty' },
    { value: 'SENSEX', label: 'Sensex' }
  ];

  const timeframes = [
    { key: '1D' as const, label: '1D' },
    { key: '1W' as const, label: '1W' },
    { key: '1M' as const, label: '1M' },
    { key: '1Y' as const, label: '1Y' },
  ];

  // 🔥 COMPLETE MOCK DATA GENERATOR
  const generateChartData = (symbol: string, timeframe: string, chartType: string) => {

    const dataPointsMap = {
      '1D': 50,
      '1W': 35,
      '1M': 22,
      '1Y': 52
    };

    const pointCount = dataPointsMap[timeframe as keyof typeof dataPointsMap] || 50;

    const basePrices = {
      'NIFTY 50': 24750,
      'BANKNIFTY': 51200,
      'SENSEX': 81500
    };

    const basePrice = basePrices[symbol as keyof typeof basePrices] || 24750;
    const data = [];

    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);
    const timeInterval = 300;

    for (let i = 0; i < pointCount; i++) {
      const timestamp = now - (pointCount - i - 1) * timeInterval;

      if (chartType === 'candlestick') {
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

    const firstPrice = chartType === 'candlestick' ? data[0]?.close : data[0]?.value;
    const lastPrice = chartType === 'candlestick' ? data[data.length - 1]?.close : data[data.length - 1]?.value;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      symbol,
      timeframe,
      chartType,
      data,
      currentPrice: lastPrice,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      lastUpdated: Date.now()
    };
  };

  // Generate and set chart data
  // 🔥 UPDATED - Real API Call with Proper Data Transformation
  const fetchChartData = async (symbol: string, timeframe: string) => {
    console.log('FETCHING CHART DATA:', symbol, timeframe, chartType);
    setIsLoading(true);

    try {
      // 🔥 CALL YOUR NEW CHART ENDPOINT
      const response = await fetch(
        `http://localhost:8080/api/v1/market/chart?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&type=${chartType}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('CHART API SUCCESS:', apiData);

      if (apiData.success && apiData.data) {
        // Data is already properly formatted by backend
        setChartData(apiData.data);
        updateChart(apiData.data);
        console.log(`LOADED ${apiData.data.totalPoints} candles from ${apiData.data.source}`);
      } else {
        throw new Error(`API returned error: ${apiData.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.warn(`API FAILED, using mock fallback:`, error);

      // FALLBACK: Use mock data when API fails
      const mockData = generateChartData(symbol, timeframe, chartType);
      setChartData(mockData);
      updateChart(mockData);
      console.log('MOCK DATA LOADED');

    } finally {
      setIsLoading(false);
    }
  };


  // Initialize chart
  useEffect(() => {

    if (!chartContainerRef.current) {
      return;
    }

    try {
      chart.current = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#a9adb4ff',
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,

        // 🔥 ENHANCED GRID - Light Gray Background Grid
        grid: {
          vertLines: {
            color: '#e4e4e4ff',        // Light gray vertical lines
            style: LineStyle.Solid,  // Solid lines (not dashed)
            visible: true            // Make sure they're visible
          },
          horzLines: {
            color: '#e4e4e4ff',        // Light gray horizontal lines  
            style: LineStyle.Solid,  // Solid lines (not dashed)
            visible: true            // Make sure they're visible
          },
        },

        crosshair: {
          mode: 1,
          // Enhanced crosshair visibility
          vertLine: {
            width: 1,
            color: '#6b7280',        // Slightly darker gray for crosshair
            style: LineStyle.Solid,
            visible: true,
          },
          horzLine: {
            width: 1,
            color: '#6b7280',        // Slightly darker gray for crosshair
            style: LineStyle.Solid,
            visible: true,
          },
        },

        rightPriceScale: {
          borderColor: '#4b5563',    // Border color
          scaleMargins: { top: 0.1, bottom: 0.1 },
          // Enhanced price scale visibility
          textColor: '#a9adb4ff',

        },

        timeScale: {
          borderColor: '#4b5563',    // Border color
          timeVisible: true,
          secondsVisible: false,
        },


      });


      const handleResize = () => {
        if (chart.current && chartContainerRef.current) {
          chart.current.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart.current) {
          chart.current.remove();
        }
      };
    } catch (error) {
    }
  }, []);


  // 🔥 FIXED - Using v5 API with addSeries()
  const updateChart = (data: any) => {

    if (!chart.current) {
      return;
    }

    if (!data?.data || !Array.isArray(data.data)) {
      return;
    }

    try {
      // Remove existing series
      if (candlestickSeries.current) {
        chart.current.removeSeries(candlestickSeries.current);
        candlestickSeries.current = null;
      }
      if (lineSeries.current) {
        chart.current.removeSeries(lineSeries.current);
        lineSeries.current = null;
      }

      if (chartType === 'candlestick') {

        // 🔥 V5 API - Use addSeries() with CandlestickSeries
        candlestickSeries.current = chart.current.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderDownColor: '#ef4444',
          borderUpColor: '#22c55e',
          wickDownColor: '#ef4444',
          wickUpColor: '#22c55e',
        });

        candlestickSeries.current.setData(data.data);
      } else {

        // 🔥 V5 API - Use addSeries() with LineSeries
        lineSeries.current = chart.current.addSeries(LineSeries, {
          color: data.changePercent >= 0 ? '#22c55e' : '#ef4444',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });

        lineSeries.current.setData(data.data);
      }

      chart.current.timeScale().fitContent();

    } catch (error) {
    }
  };

  // Trigger data generation
  useEffect(() => {
    fetchChartData(selectedIndex, selectedTimeframe);
  }, [selectedIndex, selectedTimeframe, chartType]);

  const handleExpand = () => {
    const urlSafeSymbol = selectedIndex.replace(/\s+/g, '-').toLowerCase();
    router.push(`/dashboard/stocks/${urlSafeSymbol}?timeframe=${selectedTimeframe}&type=${chartType}&symbol=${encodeURIComponent(selectedIndex)}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SectionCard
      title="Price Chart"
      icon={<BarChart3 className="h-5 w-5" />}
      className={`${className} h-120 relative`}
      contentClassName="p-0 flex flex-col h-full"
    >
      {/* Controls */}
      <div className="p-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {/* Index Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white/80 dark:bg-gray-800/80 border border-border/50 rounded-lg hover:shadow-md transition-all"
            >
              {indices.find(i => i.value === selectedIndex)?.label}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-border/50 rounded-lg shadow-xl z-10"
              >
                {indices.map((index) => (
                  <button
                    key={index.value}
                    onClick={() => {
                      setSelectedIndex(index.value);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {index.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Chart Type Toggle */}
          <button
            onClick={() => setChartType(chartType === 'line' ? 'candlestick' : 'line')}
            className="p-1.5 rounded-md bg-white/80 dark:bg-gray-800/80 border border-border/50 hover:shadow-md transition-all"
          >
            {chartType === 'line' ? <LineChart className="h-3 w-3" /> : <CandlestickChart className="h-3 w-3" />}
          </button>
        </div>

        {/* Price & Timeframes */}
        <div className="flex items-center justify-between">
          {chartData && (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{formatPrice(chartData.currentPrice)}</span>
              <div className={`flex items-center gap-1 ${chartData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {chartData.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">
                  {chartData.changePercent >= 0 ? '+' : ''}{chartData.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setSelectedTimeframe(tf.key)}
                className={`px-2 py-1 text-xs rounded transition-all ${selectedTimeframe === tf.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/80 dark:bg-gray-800/80 hover:shadow-sm'
                  }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        <div ref={chartContainerRef} className="w-full h-full" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="animate-pulse text-sm">Loading...</div>
          </div>
        )}
      </div>

      {/* Expand Button */}
      <motion.button
        onClick={handleExpand}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Maximize2 className="h-4 w-4" />
      </motion.button>
      {/*  DATA DISCLAIMER */}
      <div className="absolute bottom-1 left-2 z-10">
        <div className="text-xs text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
          Historical data - Updated daily with 1-2 day delay
        </div>
      </div>
    </SectionCard>
  );
}
