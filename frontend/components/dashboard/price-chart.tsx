"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Maximize2,
  RefreshCw,
  Activity,
  Volume2
} from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { usePriceChartStore } from "@/store/price-chart-store";

interface PriceChartProps {
  symbol: string;
  className?: string;
  showControls?: boolean;
}

export default function PriceChart({ symbol, className, showControls = true }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    chartData,
    isLoading,
    selectedTimeframe,
    setTimeframe,
    fetchChartData
  } = usePriceChartStore();

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, price: number, time: string } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const timeframes = [
    { key: '1D' as const, label: '1D', description: 'Today' },
    { key: '1W' as const, label: '1W', description: 'This Week' },
    { key: '1M' as const, label: '1M', description: 'This Month' },
    { key: '3M' as const, label: '3M', description: '3 Months' },
    { key: '1Y' as const, label: '1Y', description: 'This Year' },
  ];

  // Fetch chart data when symbol or timeframe changes
  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol);
    }
  }, [symbol, selectedTimeframe]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw chart
  useEffect(() => {
    if (!chartData || !canvasRef.current || canvasSize.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width * 2; // Retina display
    canvas.height = canvasSize.height * 2;
    ctx.scale(2, 2);

    drawChart(ctx, chartData, canvasSize);
  }, [chartData, canvasSize]);

  const drawChart = (ctx: CanvasRenderingContext2D, data: typeof chartData, size: typeof canvasSize) => {
    if (!data) return;

    ctx.clearRect(0, 0, size.width, size.height);

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = size.width - padding.left - padding.right;
    const chartHeight = size.height - padding.top - padding.bottom;

    const prices = data.data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, size.height - padding.bottom);
    const isPositive = data.changePercent >= 0;

    if (isPositive) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(size.width - padding.right, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, size.height - padding.bottom);
      ctx.stroke();
    }

    // Draw area under curve
    ctx.beginPath();
    data.data.forEach((point, index) => {
      const x = padding.left + (index / (data.data.length - 1)) * chartWidth;
      const y = padding.top + (1 - (point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close the path for area fill
    ctx.lineTo(size.width - padding.right, size.height - padding.bottom);
    ctx.lineTo(padding.left, size.height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
    ctx.lineWidth = 2;

    data.data.forEach((point, index) => {
      const x = padding.left + (index / (data.data.length - 1)) * chartWidth;
      const y = padding.top + (1 - (point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw price labels
    ctx.fillStyle = 'rgb(107, 114, 128)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (priceRange / 4) * i;
      const y = padding.top + (chartHeight / 4) * i + 4;
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 10, y);
    }

    // Draw time labels
    ctx.textAlign = 'center';
    const timeLabels = getTimeLabels(data.data, selectedTimeframe);
    timeLabels.forEach((label, index) => {
      const x = padding.left + (index / (timeLabels.length - 1)) * chartWidth;
      ctx.fillText(label, x, size.height - padding.bottom + 20);
    });
  };

  const getTimeLabels = (data: any[], timeframe: string): string[] => {
    const labelCount = 6;
    const step = Math.floor(data.length / (labelCount - 1));
    const labels = [];

    for (let i = 0; i < labelCount; i++) {
      const index = Math.min(i * step, data.length - 1);
      const timestamp = data[index].timestamp;
      const date = new Date(timestamp);

      let label = '';
      switch (timeframe) {
        case '1D':
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          break;
        case '1W':
          label = date.toLocaleDateString([], { weekday: 'short' });
          break;
        case '1M':
        case '3M':
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        case '1Y':
          label = date.toLocaleDateString([], { month: 'short' });
          break;
        default:
          label = date.toLocaleDateString();
      }
      labels.push(label);
    }

    return labels;
  };

  const handleTimeframeChange = (timeframe: typeof selectedTimeframe) => {
    setTimeframe(timeframe);
  };

  const handleRefresh = () => {
    if (symbol) {
      fetchChartData(symbol);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number): { text: string; color: string; icon: any } => {
    const isPositive = change >= 0;
    return {
      text: `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };

  return (
    <SectionCard
      title={`${symbol} Price Chart`}
      subtitle={chartData ? `${selectedTimeframe} • Last updated ${new Date(chartData.lastUpdated).toLocaleTimeString()}` : 'Loading...'}
      icon={<BarChart3 className="h-5 w-5" />}
      className={className}
      contentClassName="p-0"
    >
      <div className="h-full flex flex-col">
        {/* Price Header */}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b border-border/50 bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(chartData.currentPrice)}
                </span>
                <div className={`flex items-center gap-1 ${formatChange(chartData.change, chartData.changePercent).color}`}>
                  {formatChange(chartData.change, chartData.changePercent).icon({ className: "h-4 w-4" })}
                  <span className="font-medium">
                    {formatChange(chartData.change, chartData.changePercent).text}
                  </span>
                </div>
              </div>

              {showControls && (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`h-4 w-4 group-hover:rotate-180 transition-transform duration-300 ${isLoading ? 'animate-spin' : ''}`} />
                  </motion.button>

                  <motion.button
                    className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Maximize2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Timeframe Controls */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 border-b border-border/50 bg-gradient-to-r from-background/40 to-background/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              {timeframes.map((tf) => (
                <motion.button
                  key={tf.key}
                  onClick={() => handleTimeframeChange(tf.key)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm
                    ${selectedTimeframe === tf.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-gray-800/80 text-foreground border border-border/50 hover:shadow-md'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tf.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chart Container */}
        <div className="flex-1 relative" ref={containerRef}>
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Loading chart data...</span>
                </div>
              </motion.div>
            ) : (
              <motion.canvas
                ref={canvasRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
                style={{ width: canvasSize.width, height: canvasSize.height }}
              />
            )}
          </AnimatePresence>

          {/* Hover tooltip */}
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-xl pointer-events-none"
              style={{
                left: hoveredPoint.x + 10,
                top: hoveredPoint.y - 60,
              }}
            >
              <div className="text-sm font-medium">{formatPrice(hoveredPoint.price)}</div>
              <div className="text-xs text-muted-foreground">{hoveredPoint.time}</div>
            </motion.div>
          )}
        </div>

        {/* Volume Indicator */}
        {chartData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 border-t border-border/50 bg-gradient-to-r from-background/20 to-background/40 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                <span>Avg Volume: {((chartData.data.reduce((sum, d) => sum + d.volume, 0) / chartData.data.length) / 1000000).toFixed(2)}M</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {chartData.data.length} data points
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SectionCard>
  );
}
