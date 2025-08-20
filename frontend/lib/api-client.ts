// lib/api-client.ts (Enhanced with resilience)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  retries?: number;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async makeRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { 
      requiresAuth = true, 
      retries = 3, 
      timeout = 10000,
      ...fetchOptions 
    } = options;
    
    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
    };

    // Add auth token if required
    if (requiresAuth) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${accessToken}`,
        };
      }
    }

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseURL}${endpoint}`, 
          config, 
          timeout
        );

        // Handle token refresh on 401
        if (response.status === 401 && requiresAuth && attempt === 0) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            const newToken = localStorage.getItem('accessToken');
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${newToken}`,
            };
            continue; // Retry with new token
          }
        }

        // Return response if successful or client error (4xx)
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response.json();
        }

        // Server errors (5xx) - retry
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response.json();
        
      } catch (error: any) {
        const isLastAttempt = attempt === retries - 1;
        
        if (isLastAttempt) {
          // Create user-friendly error
          const apiError: ApiError = new Error(
            this.getUserFriendlyMessage(error)
          );
          apiError.status = error.status;
          apiError.code = error.code;
          throw apiError;
        }

        // Wait before retry with exponential backoff
        await this.delay(Math.min(1000 * Math.pow(2, attempt), 5000));
      }
    }
  }

  private getUserFriendlyMessage(error: any): string {
    if (error.name === 'AbortError') {
      return 'Request timed out. Please check your connection and try again.';
    }
    
    if (error.message?.includes('fetch')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    if (error.status >= 500) {
      return 'Server is temporarily unavailable. Please try again in a moment.';
    }
    
    return error.message || 'Something went wrong. Please try again.';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}/api/v1/auth/refresh`,
        { method: 'POST', credentials: 'include' },
        5000
      );
      
      const data = await response.json();
      
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  // Public methods with error handling
  async get(endpoint: string, options?: RequestOptions) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body?: any, options?: RequestOptions) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
