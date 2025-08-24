// src/services/cacheService.ts
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType | null = null;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private useRedis: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.client = createClient({
          url: process.env.REDIS_URL
        });

        await this.client.connect();
        this.useRedis = true;
        console.log('Connected to Redis');
      } else {
        console.log('No Redis URL provided, using memory cache');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Redis connection failed, using memory cache:', errorMessage);
      this.useRedis = false;
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Use memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        if (cached && cached.expiry <= Date.now()) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cache get error:', errorMessage);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Use memory cache
        this.memoryCache.set(key, {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });

        // Clean up expired entries periodically
        this.cleanupMemoryCache();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cache set error:', errorMessage);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cache delete error:', errorMessage);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.client) {
        const exists = await this.client.exists(key);
        return exists === 1;
      } else {
        const cached = this.memoryCache.get(key);
        return cached !== undefined && cached.expiry > Date.now();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cache exists error:', errorMessage);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.flushAll();
      } else {
        this.memoryCache.clear();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cache clear error:', errorMessage);
    }
  }

  async getStats(): Promise<any> {
    if (this.useRedis && this.client) {
      try {
        const info = await this.client.info('memory');
        return { type: 'redis', info };
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { type: 'redis', error: error.message };
        } else {
          return { type: 'redis', error: 'Unknown Redis error' };
        }
      }
    } else {
      return {
        type: 'memory',
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys())
      };
    }
  }

  // Enhanced disconnect method for cleanup
  async disconnect(): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.disconnect();
        this.useRedis = false;
        console.log('Disconnected from Redis');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Redis disconnect error:', errorMessage);
    }
  }

  private cleanupMemoryCache(): void {
    // Clean up expired entries (run occasionally)
    if (Math.random() < 0.1) { // 10% chance
      const now = Date.now();
      for (const [key, value] of this.memoryCache.entries()) {
        if (value.expiry <= now) {
          this.memoryCache.delete(key);
        }
      }
    }
  }
}
