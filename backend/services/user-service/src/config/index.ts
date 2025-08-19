// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

// Helper function to get required env variable
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  server: {
    port: parseInt(process.env.PORT || '5002'),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aistock-users'
  },
  
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'), 
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'), 
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  google: {
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5002/auth/google/callback'
  },
  
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:8080'
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    cookieSecret: process.env.COOKIE_SECRET || 'default-cookie-secret'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  }
} as const; // Make config readonly for better type safety
