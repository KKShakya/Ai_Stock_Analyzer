// api-gateway/src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFound } from './middlewares/errorHandler';
import morgan from 'morgan';


dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('dev'))



// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});


// Global rate limiting with rate-limiter-flexible
app.use('/api/v1', globalRateLimiter);

// API routes (all proxies are mounted here)
app.use('/api/v1', routes);


app.use(notFound);
app.use(errorHandler);




export default app;
