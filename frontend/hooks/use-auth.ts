// hooks/use-auth.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  apiCallsUsed: number;
  apiCallsLimit: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginModalOpen: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginModalOpen: false,
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // Call your API Gateway auth endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false,
          loginModalOpen: false 
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },
  
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}));
