import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { requestLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import onboardingRoutes from './routes/onboarding';

// Initialize Express app

const app = express();

// Security

app.use(helmet());
app.use(cors({
  origin: [config.urls.frontend, config.urls.apiGateway],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.security.cookieSecret));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests from this IP' }
});
app.use(limiter);

// Request logging
app.use(requestLogger);

// Database connection
mongoose.connect(config.database.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});




// Routes
app.use('/auth', authRoutes);
app.use('/user',onboardingRoutes);


// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
