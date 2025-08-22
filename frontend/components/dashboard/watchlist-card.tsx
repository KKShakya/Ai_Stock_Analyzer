"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  Loader2,
  AlertCircle,
  Eye,
  LogIn
} from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useAuthStore } from "@/hooks/use-auth";

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt?: number;
  sector?: string;
}

export default function WatchlistCard() {
  const router = useRouter();
  
  // Add openLoginModal to the auth store destructuring
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const { userData } = useOnboardingStore();
  const {
    watchlist,
    watchlistData,
    isLoading,
    removeFromWatchlist,
    updateWatchlistData,
    setLoading
  } = useWatchlistStore();

  // Mock data for demo - replace with real API calls later
  const generateMockData = (symbols: string[]): WatchlistStock[] => {
    return symbols.map(symbol => ({
      symbol,
      name: getCompanyName(symbol),
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      addedAt: Date.now(),
      sector: getSector(symbol)
    }));
  };

  const getCompanyName = (symbol: string): string => {
    const companies: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'AMZN': 'Amazon.com, Inc.',
      'RELIANCE': 'Reliance Industries',
      'TCS': 'Tata Consultancy Services',
      'INFY': 'Infosys Limited',
      'HDFCBANK': 'HDFC Bank Limited',
    };
    return companies[symbol] || `${symbol} Corporation`;
  };

  const getSector = (symbol: string): string => {
    const sectors: { [key: string]: string } = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'TSLA': 'Automotive',
      'NVDA': 'Semiconductors',
      'AMZN': 'E-commerce',
      'RELIANCE': 'Energy',
      'TCS': 'IT Services',
      'INFY': 'IT Services',
      'HDFCBANK': 'Banking',
    };
    return sectors[symbol] || 'General';
  };

  // Handle login button click - Connected to your auth system
  const handleLoginClick = () => {
    openLoginModal();
  };

  // Fetch watchlist data
  useEffect(() => {
    if (watchlist.length > 0) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockData = generateMockData(watchlist);
        updateWatchlistData(mockData);
        setLoading(false);
      }, 1000);
    } else {
      updateWatchlistData([]);
      setLoading(false);
    }
  }, [watchlist]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (watchlist.length === 0) return;

    const interval = setInterval(() => {
      const refreshedData = generateMockData(watchlist);
      updateWatchlistData(refreshedData);
    }, 30000);

    return () => clearInterval(interval);
  }, [watchlist]);

  const handleStockClick = (symbol: string) => {
    router.push(`/dashboard/stocks/${symbol}`);
  };

  const handleRemoveStock = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(symbol);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, isPercent: boolean = false): string => {
    const formatted = Math.abs(change).toFixed(2);
    const sign = change >= 0 ? '+' : '-';
    return `${sign}${formatted}${isPercent ? '%' : ''}`;
  };

  // Enhanced empty state for unauthenticated users with beautiful login button
  if (!isAuthenticated) {
    return (
      <SectionCard
        title="Watchlist"
        subtitle="Track your favorite stocks"
        icon={<Star className="h-5 w-5" />}
        className="h-96"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="relative mb-6">
            <Star className="h-12 w-12 text-muted-foreground" />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 h-12 w-12 bg-yellow-400/20 blur-xl rounded-full" />
          </div>
          
          <h3 className="font-medium text-foreground mb-2">Build Your Watchlist</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Sign in to track your favorite stocks and get real-time updates with AI-powered insights
          </p>
          
          {/* Beautiful shadowed login button matching your header style */}
          <motion.button
            onClick={handleLoginClick}
            className="relative px-6 py-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-foreground border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group overflow-hidden font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background gradient that appears on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              layoutId="loginGradient"
            />

            {/* Icon and text */}
            <div className="relative z-10 flex items-center gap-2">
              <LogIn className="h-4 w-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                Login to Continue
              </span>
            </div>

            {/* Subtle shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{ width: '100%' }}
            />
          </motion.button>
        </div>
      </SectionCard>
    );
  }

  // Empty state for authenticated users
  if (watchlist.length === 0) {
    return (
      <SectionCard
        title="Watchlist"
        subtitle="Track your favorite stocks"
        icon={<Star className="h-5 w-5" />}
        className="h-96"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground mb-2">Start Building Your Watchlist</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Search for stocks and add them to track price movements and get insights
          </p>
          {userData?.interests && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">
                Based on your interests: {userData.interests.join(", ")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['AAPL', 'MSFT', 'GOOGL'].map((symbol) => (
                  <Button
                    key={symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/stocks/${symbol}`)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Button 
            size="sm"
            onClick={() => router.push('/dashboard/search')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stocks
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={`Watchlist (${watchlist.length})`}
      subtitle="Your tracked stocks"
      icon={<Star className="h-5 w-5" />}
      className="h-96"
      contentClassName="overflow-hidden"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
          <span className="font-medium">Stock</span>
          <div className="flex items-center gap-8">
            <span>Price</span>
            <span>Change</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading watchlist...</span>
          </div>
        )}

        {/* Watchlist Items */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <AnimatePresence>
            {watchlistData.map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => handleStockClick(stock.symbol)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{stock.symbol}</p>
                      {stock.sector && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {stock.sector}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {stock.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Price */}
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatPrice(stock.price)}
                    </p>
                  </div>

                  {/* Change */}
                  <div className="text-right min-w-[60px]">
                    <div className={`flex items-center gap-1 ${
                      stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <div className="text-xs">
                        <div>{formatChange(stock.change)}</div>
                        <div>{formatChange(stock.changePercent, true)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    onClick={(e) => handleRemoveStock(stock.symbol, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Updates every 30 seconds
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/watchlist')}
            >
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
            <Button 
              size="sm"
              onClick={() => router.push('/dashboard/search')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
