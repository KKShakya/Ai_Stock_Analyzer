// app/dashboard/stocks/[symbol]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Star, Plus, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SectionCard from "@/components/ui/section-card";
import MetricCard from "@/components/ui/metricCard";
import { Button } from "@/components/ui/button";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useAuthStore } from "@/hooks/use-auth";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  pe: number;
  dividend: number;
  beta: number;
}

export default function StockPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth and watchlist integration
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  
  const inWatchlist = isInWatchlist(symbol?.toUpperCase() || "");

  useEffect(() => {
    if (symbol) {
      fetchStockData(symbol.toUpperCase());
    }
  }, [symbol]);

  const fetchStockData = async (stockSymbol: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/stocks/${stockSymbol}`);
      if (response.ok) {
        const data = await response.json();
        setStockData(data);
      } else {
        // Fallback to mock data
        setStockData({
          symbol: stockSymbol,
          name: getCompanyName(stockSymbol),
          price: Math.random() * 500 + 50,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 1000000) + 500000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          high52w: Math.random() * 600 + 100,
          low52w: Math.random() * 300 + 20,
          pe: Math.random() * 30 + 10,
          dividend: Math.random() * 5,
          beta: Math.random() * 2 + 0.5,
        });
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyName = (symbol: string): string => {
    const companies: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'AMZN': 'Amazon.com, Inc.',
      'META': 'Meta Platforms, Inc.',
      'RELIANCE': 'Reliance Industries',
      'TCS': 'Tata Consultancy Services',
      'INFY': 'Infosys Limited',
    };
    return companies[symbol] || `${symbol} Corporation`;
  };

  // Enhanced watchlist toggle with auth check
  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (inWatchlist) {
      removeFromWatchlist(symbol.toUpperCase());
    } else {
      addToWatchlist(symbol.toUpperCase());
    }
  };

  const formatNumber = (num: number, isPrice = false): string => {
    if (isPrice) return num.toFixed(2);
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-muted to-muted/50 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gradient-to-r from-muted to-muted/50 rounded-2xl animate-pulse"></div>
            <div className="h-4 w-32 bg-gradient-to-r from-muted to-muted/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-card to-card/80 border rounded-3xl p-6 animate-pulse backdrop-blur-sm">
              <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-xl mb-3"></div>
              <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-2xl mb-3"></div>
              <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-xl w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingDown className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Stock Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find data for symbol "{symbol}"
          </p>
          <Link href="/dashboard">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-4 w-4 mr-2 inline" />
              Back to Dashboard
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header with Glassmorphism */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <motion.button
              className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </motion.button>
          </Link>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
            >
              {stockData.symbol}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              {stockData.name}
            </motion.p>
          </div>
        </div>
        
        {/* Enhanced Watchlist Button */}
        <motion.button
          onClick={handleWatchlistToggle}
          className={`
            relative px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl group overflow-hidden
            ${inWatchlist && isAuthenticated
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
              : 'bg-white/90 dark:bg-gray-800/90 text-foreground border border-border/50'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background gradient for non-watchlist state */}
          {!inWatchlist && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              layoutId="watchlistGradient"
            />
          )}

          <div className="relative z-10 flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                {/* <LogIn className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-200" /> */}
                <Star className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''} transition-all duration-200`} />
                <span className="group-hover:text-blue-600 transition-colors duration-200">
                  Add to watchlist
                </span>
              </>
            ) : (
              <>
                <Star className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''} transition-all duration-200`} />
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </>
            )}
          </div>

          {/* Subtle shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
            style={{ width: '100%' }}
          />
        </motion.button>
      </div>

      {/* Modern Price Section with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-bold text-foreground">
            ${formatNumber(stockData.price, true)}
          </span>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              stockData.change >= 0 
                ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                : 'bg-red-500/20 text-red-600 border border-red-500/30'
            }`}
          >
            {stockData.change >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="text-lg font-medium">
              {stockData.change >= 0 ? '+' : ''}{formatNumber(stockData.change, true)}
            </span>
            <span className="text-lg font-medium">
              ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Volume"
          value={formatNumber(stockData.volume)}
          change={0}
          changePercent={0}
          isPositive={true}
        />
        <MetricCard
          title="Market Cap"
          value={`$${formatNumber(stockData.marketCap)}`}
          change={0}
          changePercent={0}
          isPositive={true}
        />
        <MetricCard
          title="P/E Ratio"
          value={stockData.pe.toFixed(2)}
          change={0}
          changePercent={0}
          isPositive={true}
        />
        <MetricCard
          title="Dividend Yield"
          value={`${stockData.dividend.toFixed(2)}%`}
          change={0}
          changePercent={0}
          isPositive={true}
        />
      </motion.div>

      {/* Enhanced Additional Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <SectionCard
          title="Trading Range"
          subtitle="52-week high and low"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-muted/50 to-transparent">
              <span className="text-muted-foreground font-medium">52W High</span>
              <span className="font-semibold text-green-600">${formatNumber(stockData.high52w, true)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-muted/50 to-transparent">
              <span className="text-muted-foreground font-medium">52W Low</span>
              <span className="font-semibold text-red-600">${formatNumber(stockData.low52w, true)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-muted/50 to-transparent">
              <span className="text-muted-foreground font-medium">Beta</span>
              <span className="font-semibold">{stockData.beta.toFixed(2)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          subtitle="Analyze and track this stock"
        >
          <div className="space-y-4">
            <motion.button
              className="w-full p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                Ask AI About {stockData.symbol}
              </div>
            </motion.button>
            
            <motion.button
              className="w-full p-4 bg-white/90 dark:bg-gray-800/90 border border-border/50 backdrop-blur-md text-foreground rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                View Historical Data
              </div>
            </motion.button>
            
            <motion.button
              className="w-full p-4 bg-white/90 dark:bg-gray-800/90 border border-border/50 backdrop-blur-md text-foreground rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                Set Price Alert
              </div>
            </motion.button>
          </div>
        </SectionCard>
      </motion.div>
    </div>
  );
}
