// src/services/rateLimitService.ts
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (userId: string, endpoint: string) => string;
}

export class RateLimitService {
  private requests: Map<string, number[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default configurations for different services
    this.configs.set('upstox', {
      windowMs: 30 * 60 * 1000, // 30 minutes
      maxRequests: 2000
    });

    this.configs.set('yahoo', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    });

    this.configs.set('general', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000
    });

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  canMakeRequest(userId: string, service: string = 'general'): boolean {
    const config = this.configs.get(service) || this.configs.get('general')!;
    const key = `${userId}:${service}`;
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get or create request history for this key
    let requestTimes = this.requests.get(key) || [];
    
    // Filter out requests outside the current window
    requestTimes = requestTimes.filter(time => time > windowStart);
    
    // Update the request history
    this.requests.set(key, requestTimes);
    
    return requestTimes.length < config.maxRequests;
  }

  recordRequest(userId: string, service: string = 'general'): void {
    const key = `${userId}:${service}`;
    const requestTimes = this.requests.get(key) || [];
    
    requestTimes.push(Date.now());
    this.requests.set(key, requestTimes);
  }

  getRemainingRequests(userId: string, service: string = 'general'): number {
    const config = this.configs.get(service) || this.configs.get('general')!;
    const key = `${userId}:${service}`;
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const requestTimes = this.requests.get(key) || [];
    const recentRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  getResetTime(userId: string, service: string = 'general'): number {
    const config = this.configs.get(service) || this.configs.get('general')!;
    const key = `${userId}:${service}`;
    
    const requestTimes = this.requests.get(key) || [];
    if (requestTimes.length === 0) return 0;
    
    const oldestRequest = Math.min(...requestTimes);
    return oldestRequest + config.windowMs;
  }

  // Get rate limit status for a user
  getStatus(userId: string, service: string = 'general'): {
    canMakeRequest: boolean;
    remaining: number;
    resetTime: number;
    windowMs: number;
  } {
    const config = this.configs.get(service) || this.configs.get('general')!;
    
    return {
      canMakeRequest: this.canMakeRequest(userId, service),
      remaining: this.getRemainingRequests(userId, service),
      resetTime: this.getResetTime(userId, service),
      windowMs: config.windowMs
    };
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, requestTimes] of this.requests.entries()) {
      // Determine service from key
      const service = key.split(':')[1] || 'general';
      const config = this.configs.get(service) || this.configs.get('general')!;
      const windowStart = now - config.windowMs;
      
      // Filter out old requests
      const recentRequests = requestTimes.filter(time => time > windowStart);
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
    
    console.log(`Rate limit cleanup completed. Active keys: ${this.requests.size}`);
  }

  // Add custom rate limit configuration
  addConfig(service: string, config: RateLimitConfig): void {
    this.configs.set(service, config);
  }

  // Get statistics
  getStats(): any {
    return {
      totalKeys: this.requests.size,
      configs: Object.fromEntries(this.configs.entries()),
      activeUsers: Array.from(new Set(
        Array.from(this.requests.keys()).map(key => key.split(':')[0])
      )).length
    };
  }
}
