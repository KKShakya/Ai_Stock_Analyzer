// hooks/use-search.ts
import { create } from 'zustand';
import { useHotkeys } from 'react-hotkeys-hook';

interface SearchState {
  query: string;
  isOpen: boolean;
  results: any[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  performSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  isOpen: false,
  results: [],
  isLoading: false,
  
  setQuery: (query) => set({ query }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '' }),
  
  performSearch: async () => {
    const { query } = get();
    if (!query.trim()) return;
    
    set({ isLoading: true });
    try {
      // Search API call - will implement with your market data
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      set({ results, isLoading: false });
    } catch (error) {
      console.error('Search failed:', error);
      set({ isLoading: false });
    }
  },
}));

// Custom hook for keyboard shortcuts
export const useSearchKeyboard = () => {
  const { openSearch } = useSearchStore();
  
  useHotkeys('alt+s', (e) => {
    e.preventDefault();
    openSearch();
  }, { enableOnFormTags: ['input', 'textarea', 'select'] });
};
