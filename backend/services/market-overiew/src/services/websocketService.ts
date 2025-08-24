// market-service/src/services/websocketService.ts
import { Server } from 'socket.io';
import { UpstoxService } from './upstoxServices';

export class WebSocketService {
  private io: Server;
  private upstoxService: UpstoxService;
  private activeConnections: Map<string, Set<string>> = new Map(); // userId -> symbols
  private priceSubscriptions: Map<string, any> = new Map(); // symbol -> subscription

  constructor(io: Server) {
    this.io = io;
    this.upstoxService = new UpstoxService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle stock subscription
      socket.on('subscribe-stock', async (data) => {
        const { symbol, userId } = data;
        
        // Add to user's active connections
        if (!this.activeConnections.has(userId)) {
          this.activeConnections.set(userId, new Set());
        }
        this.activeConnections.get(userId)!.add(symbol);

        // Join socket room for this symbol
        socket.join(`stock:${symbol}`);

        // Start price subscription if not already active
        if (!this.priceSubscriptions.has(symbol)) {
          await this.startPriceSubscription(symbol);
        }

        socket.emit('subscription-confirmed', { symbol, status: 'active' });
      });

      // Handle unsubscribe
      socket.on('unsubscribe-stock', (data) => {
        const { symbol, userId } = data;
        
        const userConnections = this.activeConnections.get(userId);
        if (userConnections) {
          userConnections.delete(symbol);
          socket.leave(`stock:${symbol}`);
        }

        // Stop subscription if no more listeners
        const roomSize = this.io.sockets.adapter.rooms.get(`stock:${symbol}`)?.size || 0;
        if (roomSize === 0) {
          this.stopPriceSubscription(symbol);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up subscriptions for this socket
      });
    });
  }

  private async startPriceSubscription(symbol: string) {
    try {
      // **CORRECT: Use the proper method name**
      await this.upstoxService.subscribeToSymbol(
        symbol,
        (priceData: any) => {
          // Broadcast to all clients subscribed to this symbol
          this.io.to(`stock:${symbol}`).emit('price-update', {
            symbol,
            price: priceData.ltp,
            change: priceData.change,
            changePercent: priceData.changePercent,
            volume: priceData.volume,
            timestamp: priceData.timestamp || Date.now()
          });
        }
      );

      this.priceSubscriptions.set(symbol, { type: 'websocket', symbol });
      console.log(`Started WebSocket price subscription for ${symbol}`);

    } catch (error) {
      console.error(`Failed to start WebSocket subscription for ${symbol}:`, error);
      
      // Fallback to REST API polling
      const interval = setInterval(async () => {
        try {
          const quote = await this.upstoxService.getQuote(symbol);
          this.io.to(`stock:${symbol}`).emit('price-update', {
            symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            timestamp: Date.now()
          });
        } catch (pollError) {
          console.error(`Polling failed for ${symbol}:`, pollError);
        }
      }, 30000); // Poll every 30 seconds

      this.priceSubscriptions.set(symbol, { type: 'polling', interval });
      console.log(`Started polling fallback for ${symbol}`);
    }
  }

  private async stopPriceSubscription(symbol: string) {
    const subscription = this.priceSubscriptions.get(symbol);
    if (subscription) {
      if (subscription.type === 'polling') {
        clearInterval(subscription.interval);
        console.log(`Stopped polling for ${symbol}`);
      } else if (subscription.type === 'websocket') {
        // **CORRECT: Use the proper method name**
        try {
          await this.upstoxService.unsubscribeFromSymbol(symbol, () => {});
          console.log(`Stopped WebSocket subscription for ${symbol}`);
        } catch (error) {
          console.error(`Error unsubscribing from ${symbol}:`, error);
        }
      }
      
      this.priceSubscriptions.delete(symbol);
    }
  }

  // **NEW: Cleanup method**
  async cleanup() {
    try {
      // Stop all subscriptions
      for (const [symbol, subscription] of this.priceSubscriptions.entries()) {
        if (subscription.type === 'polling') {
          clearInterval(subscription.interval);
        }
      }
      
      // Disconnect Upstox WebSocket
      await this.upstoxService.disconnectWebSocket();
      
      this.priceSubscriptions.clear();
      this.activeConnections.clear();
      
      console.log('WebSocket service cleanup completed');
    } catch (error) {
      console.error('Error during WebSocket service cleanup:', error);
    }
  }
}
