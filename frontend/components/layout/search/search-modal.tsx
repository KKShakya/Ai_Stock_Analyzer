"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Clock, X } from "lucide-react";
import { useSearchStore } from "@/hooks/use-search";

export default function SearchModal() {
  const { isOpen, query, setQuery, closeSearch, performSearch, results, isLoading } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches] = useState([
    'NIFTY 50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY'
  ]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      performSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      performSearch();
    }
  };

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
              
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search stocks, indices, or companies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={handleSearchSubmit}
                  disabled={!query.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={closeSearch}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Results or Suggestions */}
              <div className="max-h-96 overflow-y-auto">
                {query.length === 0 ? (
                  /* Recent Searches */
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent searches
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search);
                            performSearch();
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isLoading ? (
                  /* Loading State */
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                  </div>
                ) : results.length > 0 ? (
                  /* Search Results */
                  <div className="p-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => {
                          // Handle result click
                          closeSearch();
                        }}
                      >
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.symbol}</p>
                          <p className="text-xs text-muted-foreground">{result.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{result.price}</p>
                          <p className={`text-xs ${result.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.change >= 0 ? '+' : ''}{result.change}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No Results */
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to search</span>
                  <div className="flex items-center gap-4">
                    <span>Alt+S to focus</span>
                    <span>Esc to close</span>
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
