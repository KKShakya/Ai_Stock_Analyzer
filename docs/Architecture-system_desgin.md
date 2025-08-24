 # Production-Ready Architecture Overview


## Complete System Design

Frontend (Next.js)          Backend Services             External APIs
     ↓                           ↓                         ↓
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│ Dashboard       │ ←→   │ API Gateway      │ ←→   │ Upstox API     │
│ Components      │      │ (Port 8080)      │      │ (Primary)      │
└─────────────────┘      └──────────────────┘      └────────────────┘
         ↓                         ↓                         ↓
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│ Zustand Stores  │ ←→   │ Market Service   │ ←→   │ Yahoo Finance  │
│ (Frontend)      │      │ (Port 5003)      │      │ (Secondary)    │
└─────────────────┘      └──────────────────┘      └────────────────┘
         ↓                         ↓
┌─────────────────┐      ┌──────────────────┐
│ Local Cache     │      │ User Service     │
│ (Performance)   │      │ (Port 5002)      │
└─────────────────┘      └──────────────────┘



## Backend Services Architecture

your-project/
├── api-gateway/                    # Port 8080 - Public proxy
│   ├── src/
│   │   ├── routes/
│   │   │   ├── marketProxy.ts      # Routes to Market Service
│   │   │   └── userProxy.ts        # Routes to User Service
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts      # Global rate limiting
│   │   │   ├── cors.ts             # CORS configuration
│   │   │   └── auth.ts             # JWT validation
│   │   └── app.ts                  # Express gateway setup
│   └── Dockerfile
│
├── market-service/                 # Port 5003 - NEW SERVICE
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── marketDataController.ts
│   │   │   ├── watchlistController.ts
│   │   │   ├── priceAlertController.ts
│   │   │   └── chartDataController.ts
│   │   ├── services/
│   │   │   ├── upstoxService.ts    # Primary API integration
│   │   │   ├── yahooFinanceService.ts
│   │   │   ├── cacheService.ts     # Redis caching
│   │   │   ├── rateLimitService.ts # API rate management
│   │   │   └── websocketService.ts # Real-time connections
│   │   ├── models/
│   │   │   ├── StockData.ts        # Market data schemas
│   │   │   ├── Watchlist.ts        # User watchlists
│   │   │   └── PriceAlert.ts       # Price alerts
│   │   ├── routes/
│   │   │   ├── marketRoutes.ts     # REST endpoints
│   │   │   └── websocketRoutes.ts  # WebSocket handlers
│   │   ├── utils/
│   │   │   ├── symbolMapper.ts     # NSE ↔ Yahoo mapping
│   │   │   ├── dataFormatter.ts    # Normalize responses
│   │   │   └── errorHandler.ts     # Error management
│   │   └── app.ts
│   └── Dockerfile
│
├── user-service/                   # Port 5002 - EXISTING
│   ├── src/ (your existing structure)
│   └── Enhanced with market preferences
│
└── frontend/                       # Next.js - ENHANCED
    ├── lib/
    │   ├── api/
    │   │   ├── market-client.ts    # Backend API client
    │   │   ├── user-client.ts      # User API client
    │   │   └── websocket-client.ts # Real-time client
    │   ├── types/
    │   │   ├── market-data.ts      # Unified interfaces
    │   │   ├── api-responses.ts    # Response types
    │   │   └── websocket-events.ts # Event types
    │   └── utils/
    │       ├── cache-manager.ts    # Frontend caching
    │       ├── error-handler.ts    # Error boundaries
    │       └── data-formatter.ts   # UI data formatting
    ├── store/
    │   ├── market-data-store.ts    # Enhanced with backend
    │   ├── websocket-store.ts      # Real-time state
    │   └── cache-store.ts          # Client-side cache
    └── components/ 