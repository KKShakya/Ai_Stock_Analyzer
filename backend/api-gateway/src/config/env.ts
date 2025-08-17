import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  sentimentUrl: process.env.SVC_SENTIMENT_URL ?? 'http://localhost:5001',
  dataUrl: process.env.SVC_DATA_URL ?? 'http://localhost:5002',
  strategyUrl: process.env.SVC_STRATEGY_URL ?? 'http://localhost:5003'
};
