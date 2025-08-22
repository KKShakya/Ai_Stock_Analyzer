// components/layout/search/search-modal.tsx - ENHANCED VERSION
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Clock, X, Star, Zap } from "lucide-react";
import { useSearchStore } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";

interface StockResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: string;
  sector?: string;
}

// Enhanced mock data with more realistic stocks
const MOCK_STOCKS: StockResult[] = [
  // Indian Stocks
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2850.50, change: 25.30, changePercent: 0.89, sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3245.75, change: -15.20, changePercent: -0.47, sector: "IT" },
  { symbol: "INFY", name: "Infosys Limited", price: 1456.80, change: 12.50, changePercent: 0.86, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank Limited", price: 1678.90, change: 8.45, changePercent: 0.51, sector: "Banking" },
  { symbol: "ICICIBANK", name: "ICICI Bank Limited", price: 1123.40, change: -5.60, changePercent: -0.50, sector: "Banking" },
  { symbol: "ITC", name: "ITC Limited", price: 456.25, change: 3.75, changePercent: 0.83, sector: "FMCG" },
  
  // Global Stocks
  { symbol: "AAPL", name: "Apple Inc.", price: 175.43, change: 2.15, changePercent: 1.24, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 378.85, change: -1.45, changePercent: -0.38, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 138.21, change: 1.87, changePercent: 1.37, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 248.50, change: 12.30, changePercent: 5.21, sector: "Automotive" },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.30, change: 15.60, changePercent: 1.81, sector: "Semiconductors" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", price: 155.89, change: -2.34, changePercent: -1.48, sector: "E-commerce" },
  
  // Indices
  { symbol: "NIFTY50", name: "NIFTY 50 Index", price: 22150.50, change: 145.30, changePercent: 0.66, sector: "Index" },
  { symbol: "BANKNIFTY", name: "Bank NIFTY Index", price: 48750.25, change: -225.80, changePercent: -0.46, sector: "Index" },
];

export default function SearchModal() {
  const { isOpen, query, setQuery, closeSearch } = useSearchStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [results, setResults] = useState<StockResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchCache, setSearchCache] = useState<Map<string, StockResult[]>>(new Map());
  
  // Debounce query for smooth search experience
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches and cache on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentStockSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const savedCache = localStorage.getItem('stockSearchCache');
    if (savedCache) {
      const cacheData = JSON.parse(savedCache);
      setSearchCache(new Map(cacheData));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Smart search with caching and fuzzy matching
  const performSmartSearch = useMemo(() => {
    return (searchQuery: string): StockResult[] => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      // Check cache first
      if (searchCache.has(normalizedQuery)) {
        return searchCache.get(normalizedQuery)!;
      }

      // Perform search with fuzzy matching
      const filteredResults = MOCK_STOCKS.filter(stock => {
        const symbolMatch = stock.symbol.toLowerCase().includes(normalizedQuery);
        const nameMatch = stock.name.toLowerCase().includes(normalizedQuery);
        const sectorMatch = stock.sector?.toLowerCase().includes(normalizedQuery);
        
        return symbolMatch || nameMatch || sectorMatch;
      });

      // Sort results by relevance (exact symbol matches first)
      const sortedResults = filteredResults.sort((a, b) => {
        const aSymbolExact = a.symbol.toLowerCase() === normalizedQuery;
        const bSymbolExact = b.symbol.toLowerCase() === normalizedQuery;
        const aSymbolStarts = a.symbol.toLowerCase().startsWith(normalizedQuery);
        const bSymbolStarts = b.symbol.toLowerCase().startsWith(normalizedQuery);
        
        if (aSymbolExact && !bSymbolExact) return -1;
        if (!aSymbolExact && bSymbolExact) return 1;
        if (aSymbolStarts && !bSymbolStarts) return -1;
        if (!aSymbolStarts && bSymbolStarts) return 1;
        
        return 0;
      });

      // Cache results for future use
      const newCache = new Map(searchCache);
      newCache.set(normalizedQuery, sortedResults);
      setSearchCache(newCache);
      
      // Save cache to localStorage (keep only last 50 searches)
      if (newCache.size > 50) {
        const cacheArray = Array.from(newCache);
        const trimmedCache = new Map(cacheArray.slice(-50));
        setSearchCache(trimmedCache);
        localStorage.setItem('stockSearchCache', JSON.stringify(Array.from(trimmedCache)));
      } else {
        localStorage.setItem('stockSearchCache', JSON.stringify(Array.from(newCache)));
      }
      
      return sortedResults;
    };
  }, [searchCache]);

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      
      // Simulate network delay for realistic UX
      const timeoutId = setTimeout(() => {
        const searchResults = performSmartSearch(debouncedQuery);
        setResults(searchResults);
        setIsLoading(false);
      }, 150);

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [debouncedQuery, performSmartSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
    // TODO: Add arrow key navigation for results
  };

  // Enhanced stock selection with analytics
  const handleStockSelect = (stock: StockResult | string) => {
    const symbol = typeof stock === 'string' ? stock : stock.symbol;
    
    // Close modal
    closeSearch();
    
    // Navigate to stock page
    router.push(`/dashboard/stocks/${symbol}`);
    
    // Update recent searches
    const updated = [symbol, ...recentSearches.filter((s: string) => s !== symbol)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentStockSearches', JSON.stringify(updated));
    
    // Analytics tracking (for future implementation)
    console.log('Stock selected:', { symbol, timestamp: Date.now() });
  };

  // Popular stocks based on sectors
  const popularStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy" },
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NIFTY50", name: "NIFTY 50" },
    { symbol: "BANKNIFTY", name: "Bank NIFTY" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={closeSearch}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto p-4 z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              
              {/* Search Input with Status */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className={`h-5 w-5 transition-colors ${isLoading ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search stocks, indices, or companies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                
                {/* Smart indicators */}
                <div className="flex items-center gap-2">
                  {searchCache.has(debouncedQuery.toLowerCase()) && debouncedQuery.length >= 2 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Zap className="h-3 w-3" />
                      <span>Cached</span>
                    </div>
                  )}
                  
                  {query.length > 0 && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={closeSearch}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {query.length === 0 ? (
                  /* Recent Searches & Popular Stocks */
                  <div className="p-4 space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Recent searches
                        </h3>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleStockSelect(search)}
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span>{search}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-muted-foreground">→</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Stocks */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Popular stocks
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {popularStocks.map((stock) => (
                          <button
                            key={stock.symbol}
                            onClick={() => handleStockSelect(stock.symbol)}
                            className="p-3 text-left rounded-md hover:bg-muted transition-colors border border-border/50 hover:border-border group"
                          >
                            <div className="font-medium text-sm">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isLoading ? (
                  /* Enhanced Loading State */
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Searching for "{query}"...
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  /* Enhanced Search Results */
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground mb-2 px-2">
                      {results.length} results found {searchCache.has(debouncedQuery.toLowerCase()) && '(cached)'}
                    </div>
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors group"
                        onClick={() => handleStockSelect(result)}
                      >
                        <TrendingUp className={`h-5 w-5 ${result.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{result.symbol}</p>
                            {result.sector && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">{result.sector}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{result.price.toFixed(2)}</p>
                          <p className={`text-xs ${result.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-muted-foreground">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No Results */
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try searching for symbols like "RELIANCE", "AAPL", or "NIFTY"
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Alt+S to focus • Esc to close</span>
                    {results.length > 0 && (
                      <span>• {results.length} results</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>Smart search enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
