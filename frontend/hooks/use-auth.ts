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
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Modal states
  loginModalOpen: boolean;
  registerModalOpen: boolean;
  currentView: 'login' | 'register' | 'forgot';
  
  // Auth actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  
  // Modal actions
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  switchToForgot: () => void;
}

// API Base URL - Update this to match your API Gateway
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginModalOpen: false,
  registerModalOpen: false,
  currentView: 'login',
  
  // Login function - connects to your backend
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for httpOnly cookies
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store access token in localStorage
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        
        // Update auth state
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false,
          loginModalOpen: false,
          registerModalOpen: false
        });
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Google OAuth - redirect to your backend
  loginWithGoogle: async () => {
    set({ isLoading: true });
    // Redirect to your Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
  },
  
  // Register function - connects to your backend
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for httpOnly cookies
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store access token
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        
        // Update auth state
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false,
          loginModalOpen: false,
          registerModalOpen: false
        });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Logout function
  logout: async () => {
    try {
      // Call logout API to clear refresh token
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear local storage and state
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },
  
  // Check if user is still authenticated (on app load)
  checkAuthStatus: async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true 
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },
  
  // Modal functions (unchanged)
  openLoginModal: () => set({ 
    loginModalOpen: true, 
    registerModalOpen: false, 
    currentView: 'login' 
  }),
  
  openRegisterModal: () => set({ 
    loginModalOpen: false, 
    registerModalOpen: true, 
    currentView: 'register' 
  }),
  
  closeAuthModal: () => set({ 
    loginModalOpen: false, 
    registerModalOpen: false,
    currentView: 'login'
  }),
  
  switchToLogin: () => set({ 
    currentView: 'login',
    loginModalOpen: true, 
    registerModalOpen: false 
  }),
  
  switchToRegister: () => set({ 
    currentView: 'register',
    loginModalOpen: false, 
    registerModalOpen: true 
  }),
  
  switchToForgot: () => set({ currentView: 'forgot' }),
}));
