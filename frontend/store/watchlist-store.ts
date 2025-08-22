import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: number;
}

interface WatchlistState {
  watchlist: string[];
  watchlistData: WatchlistStock[];
  isLoading: boolean;
  
  // Actions
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  updateWatchlistData: (data: WatchlistStock[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      watchlistData: [],
      isLoading: false,
      
      addToWatchlist: (symbol) => {
        const { watchlist } = get();
        if (!watchlist.includes(symbol)) {
          set({ watchlist: [...watchlist, symbol] });
        }
      },
      
      removeFromWatchlist: (symbol) => {
        const { watchlist, watchlistData } = get();
        set({ 
          watchlist: watchlist.filter(s => s !== symbol),
          watchlistData: watchlistData.filter(stock => stock.symbol !== symbol)
        });
      },
      
      isInWatchlist: (symbol) => {
        const { watchlist } = get();
        return watchlist.includes(symbol);
      },
      
      updateWatchlistData: (data) => set({ watchlistData: data }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'watchlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlist: state.watchlist
      }),
    }
  )
);
