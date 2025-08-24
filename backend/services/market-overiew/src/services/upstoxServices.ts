// market-service/src/services/upstoxService.ts
import axios, { AxiosInstance } from "axios";
import { StockQuote, HistoricalData } from "../models/stockData";

const UpstoxClient = require("upstox-js-sdk");

export interface UpstoxConfig {
  baseUrl: string;
  accessToken: string;
  rateLimits: {
    callsPer30Min: number;
    maxWebSocketConnections: number;
    maxSymbolsPerConnection: number;
  };
}

// **NEW: Smart Fallback System**
class TokenExpiredError extends Error {
  constructor(message: string = "Upstox token expired") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export class UpstoxService {
  private client: AxiosInstance;
  private config: UpstoxConfig;
  private instrumentMap: Map<string, string> = new Map();

  // **NEW: Token Management**
  private isTokenValid: boolean = true;
  private lastTokenCheck: number = 0;
  private tokenCheckInterval: number = 30 * 60 * 1000; // 30 minutes

  // **WebSocket Support using Official SDK**
  private streamer: any = null;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private isConnected: boolean = false;

  constructor() {
    this.config = {
      baseUrl: "https://api.upstox.com/v2",
      accessToken: process.env.UPSTOX_ACCESS_TOKEN || "",
      rateLimits: {
        callsPer30Min: 2000,
        maxWebSocketConnections: 2,
        maxSymbolsPerConnection: 100,
      },
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: "application/json",
      },
      timeout: 10000,
    });

    // Initialize instrument mappings for Indian stocks
    this.initializeInstrumentMap();

    // Initialize Upstox SDK
    this.initializeUpstoxSDK();
  }

  private initializeInstrumentMap(): void {
    // NSE Equity mappings
    this.instrumentMap.set("RELIANCE", "NSE_EQ|INE002A01018");
    this.instrumentMap.set("TCS", "NSE_EQ|INE467B01029");
    this.instrumentMap.set("INFY", "NSE_EQ|INE009A01021");
    this.instrumentMap.set("HDFCBANK", "NSE_EQ|INE040A01034");
    this.instrumentMap.set("ICICIBANK", "NSE_EQ|INE090A01013");
    this.instrumentMap.set("HINDUNILVR", "NSE_EQ|INE030A01027");
    this.instrumentMap.set("SBIN", "NSE_EQ|INE062A01020");
    this.instrumentMap.set("BHARTIARTL", "NSE_EQ|INE397D01024");
    this.instrumentMap.set("ITC", "NSE_EQ|INE154A01025");
    this.instrumentMap.set("LT", "NSE_EQ|INE018A01030");

    // **FIXED: Correct Index mappings**
    this.instrumentMap.set("NIFTY", "NSE_INDEX|Nifty 50");
    this.instrumentMap.set("BANKNIFTY", "NSE_INDEX|Nifty Bank");
    this.instrumentMap.set("SENSEX", "BSE_INDEX|SENSEX");
    this.instrumentMap.set("VIX", "NSE_INDEX|VIX");
  }

  // Initialize Upstox SDK for WebSocket
  private initializeUpstoxSDK(): void {
    try {
      const defaultClient = UpstoxClient.ApiClient.instance;
      const OAUTH2 = defaultClient.authentications["OAUTH2"];
      OAUTH2.accessToken = this.config.accessToken;

      console.log(" Upstox SDK initialized successfully");
    } catch (error) {
      console.error(" Failed to initialize Upstox SDK:", error);
    }
  }

  private getInstrumentKey(symbol: string): string {
    const mapped = this.instrumentMap.get(symbol.toUpperCase());
    if (mapped) return mapped;

    // Default fallback for unmapped symbols
    console.warn(
      `⚠️ No mapping found for symbol: ${symbol}. Using default NSE_EQ format.`
    );
    return `NSE_EQ|${symbol}`;
  }

  // **NEW: Smart API Call with Token Validation**
  private async makeApiCall(url: string, options: any = {}): Promise<any> {
    try {
      const response = await this.client.request({ url, ...options });

      // Reset token validity on successful call
      this.isTokenValid = true;
      this.lastTokenCheck = Date.now();

      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("🔴 Upstox token expired or invalid");
        this.isTokenValid = false;
        throw new TokenExpiredError(
          "Upstox authentication failed - token may be expired"
        );
      }
      throw error;
    }
  }

  // **ENHANCED: Production-Ready Methods**
  async getQuote(symbol: string): Promise<StockQuote> {
    if (!this.isTokenValid) {
      throw new TokenExpiredError("Upstox service unavailable - token expired");
    }

    try {
      const instrumentKey = this.getInstrumentKey(symbol);
      const encodedKey = encodeURIComponent(instrumentKey);


      const response = await this.makeApiCall(
        `/market-quote/ltp?instrument_key=${encodedKey}`
      );

      if (response.data && response.data.data) {
        const data = response.data.data[instrumentKey];
        if (!data) {
          console.warn(`⚠️ No data returned for ${symbol} (${instrumentKey})`);
          throw new Error(`No data available for symbol: ${symbol}`);
        }
        return this.formatQuoteData(symbol, data);
      }

      throw new Error(`Invalid response structure for symbol: ${symbol}`);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw error; // Let caller handle token expiry
      }
      console.error(` Upstox getQuote error for ${symbol}:`, error);
      throw error;
    }
  }

  // **ENHANCED: getBatchQuotes with Format Handling and Fallback**
  async getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
    if (!this.isTokenValid) {
      throw new TokenExpiredError("Upstox service unavailable - token expired");
    }

    try {
      const batchSize = 500;
      const batches = this.chunkArray(symbols, batchSize);
      const allQuotes: StockQuote[] = [];

      for (const batch of batches) {

        const instrumentKeys = batch.map((symbol) =>
          this.getInstrumentKey(symbol)
        );
        const encodedKeys = instrumentKeys.map((key) =>
          encodeURIComponent(key)
        );

        const response = await this.makeApiCall(
          `/market-quote/ltp?instrument_key=${encodedKeys.join(",")}`
        );

        console.log(
          "📊 Batch response keys:",
          Object.keys(response.data?.data || {})
        );

        if (response.data && response.data.data) {
          const batchQuotes = batch
            .map((symbol, index) => {
              const instrumentKey = instrumentKeys[index];
              let data = response.data.data[instrumentKey];

              // **FIX: Handle both formats (pipe and colon) - THE KEY FIX YOU NEEDED**
              if (!data) {
                // Try colon format: NSE_INDEX:Nifty 50
                const colonFormat = instrumentKey.replace("|", ":");
                data = response.data.data[colonFormat];
                console.log(`🔄 Trying colon format: ${colonFormat}`);
              }

              if (!data) {
                // Try pipe format: NSE_INDEX|Nifty 50
                const pipeFormat = instrumentKey.replace(":", "|");
                data = response.data.data[pipeFormat];
                console.log(`🔄 Trying pipe format: ${pipeFormat}`);
              }

              // **ADDITIONAL: Try without spaces**
              if (!data) {
                const noSpaceFormat = instrumentKey.replace(/\s/g, "");
                data = response.data.data[noSpaceFormat];
                console.log(`🔄 Trying no-space format: ${noSpaceFormat}`);
              }

              if (!data) {
                console.warn(
                  ` No data found for ${symbol} (tried: ${instrumentKey}, ${instrumentKey.replace(
                    "|",
                    ":"
                  )}, ${instrumentKey.replace(":", "|")})`
                );
                return null;
              }

              return this.formatQuoteData(symbol, data);
            })
            .filter((quote) => quote !== null);

          allQuotes.push(...batchQuotes);
        }
      }

      console.log(
        ` Retrieved ${allQuotes.length} quotes out of ${symbols.length} requested`
      );
      return allQuotes;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw error;
      }
      console.error(" Upstox getBatchQuotes error:", error);
      throw error;
    }
  }

  async getBatchOHLCQuotes(symbols: string[]): Promise<MarketOverviewData[]> {
  try {
    const results = [];
    
    // **BATCH REQUEST** - Get all symbols in one API call (more efficient)
    const instrumentKeys = symbols.map(symbol => this.getInstrumentKey(symbol));
    const encodedKeys = instrumentKeys.map(key => encodeURIComponent(key));
    
    console.log('🔍 Requesting instruments:', instrumentKeys);
    
    const response = await this.makeApiCall(
      `/market-quote/ohlc?instrument_key=${encodedKeys.join('%2C')}&interval=1d`
    );
    
    console.log('📊 Raw Upstox response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      // **KEY FIX**: Handle both colon and pipe formats in response keys
      symbols.forEach((symbol, index) => {
        const instrumentKey = instrumentKeys[index];
        
        // Try different key formats that Upstox might return
        let data = response.data.data[instrumentKey] ||           // NSE_INDEX|Nifty 50
                   response.data.data[instrumentKey.replace('|', ':')] || // NSE_INDEX:Nifty 50  
                   response.data.data[instrumentKey.replace(':', '|')];   // Reverse format
        
        console.log(`📈 Data for ${symbol} (${instrumentKey}):`, data);
        
        if (data && data.ohlc && data.last_price) {
          // **FIXED**: Use actual Upstox response structure
          const currentPrice = data.last_price;
          const previousClose = data.ohlc.close; // This might be previous close, but let's verify
          
          // **CALCULATE CHANGE** - We need to determine what ohlc.close represents
          // For now, let's calculate change from open to current price
          const change = currentPrice - data.ohlc.open; // Day's change from open
          const changePercent = ((change / data.ohlc.open) * 100);
          
          results.push({
            symbol,
            lastPrice: Number(currentPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            // **OHLC Data from actual response**
            open: data.ohlc.open,
            high: data.ohlc.high, 
            low: data.ohlc.low,
            close: data.ohlc.close,
            volume: data.volume || 0, // Volume might not be available for indices
            source: "upstox",
          });
          
          console.log(` Successfully processed ${symbol}:`, {
            price: currentPrice,
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2)
          });
        } else {
          console.warn(`Missing data for ${symbol} - expected ohlc and last_price`);
        }
      });
    }
    
    console.log(`Final results: ${results.length} out of ${symbols.length} symbols processed`);
    return results;
    
  } catch (error) {
    console.error("Batch OHLC quotes failed:", error);
    throw error;
  }
}

  async getHistoricalData(
    symbol: string,
    interval: string = "1day",
    from: string,
    to: string
  ): Promise<HistoricalData> {
    if (!this.isTokenValid) {
      throw new TokenExpiredError("Upstox service unavailable - token expired");
    }

    try {
      const instrumentKey = this.getInstrumentKey(symbol);
      const response = await this.makeApiCall(
        `/historical-candle/${instrumentKey}/${interval}/${to}/${from}`
      );

      if (response.data && response.data.data && response.data.data.candles) {
        return this.formatHistoricalData(symbol, response.data.data.candles);
      }

      throw new Error(`No historical data found for symbol: ${symbol}`);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw error;
      }
      console.error(`Upstox getHistoricalData error for ${symbol}:`, error);
      throw error;
    }
  }

  // **CORRECT WEBSOCKET METHODS USING OFFICIAL SDK**
  async initializeWebSocket(): Promise<void> {
    try {
      if (this.streamer) {
        console.log("WebSocket already initialized");
        return;
      }

      // Create MarketDataStreamerV3 instance using official SDK
      this.streamer = new UpstoxClient.MarketDataStreamerV3();

      // Setup event listeners
      this.streamer.on("open", () => {
        console.log("Upstox WebSocket connected successfully");
        this.isConnected = true;
      });

      this.streamer.on("message", (data: Buffer) => {
        try {
          const feed = data.toString("utf-8");
          const marketUpdate = JSON.parse(feed);
          this.handleMarketUpdate(marketUpdate);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      this.streamer.on("error", (error: any) => {
        console.error("Upstox WebSocket error:", error);
        this.isConnected = false;
      });

      this.streamer.on("close", () => {
        console.log("Upstox WebSocket connection closed");
        this.isConnected = false;
      });

      // Connect to WebSocket
      this.streamer.connect();

      console.log("Upstox WebSocket initialized and connected");
    } catch (error) {
      console.error("Failed to initialize Upstox WebSocket:", error);
      throw error;
    }
  }

  // **CORRECT: Subscribe using official SDK method**
  async subscribeToSymbol(symbol: string, callback: Function): Promise<void> {
    try {
      // Initialize WebSocket if not already done
      if (!this.streamer) {
        await this.initializeWebSocket();
      }

      // Add callback to subscribers
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol)!.add(callback);

      // Convert symbol to instrument key
      const instrumentKey = this.getInstrumentKey(symbol);

      // **CORRECT: Use official SDK subscribe method**
      if (this.isConnected) {
        this.streamer.subscribe([instrumentKey], "ltpc");
        console.log(
          `Subscribed to real-time data for ${symbol} (${instrumentKey})`
        );
      } else {
        console.warn(`WebSocket not connected, cannot subscribe to ${symbol}`);
      }
    } catch (error) {
      console.error(`Failed to subscribe to ${symbol}:`, error);
      throw error;
    }
  }

  // **CORRECT: Unsubscribe using official SDK method**
  async unsubscribeFromSymbol(
    symbol: string,
    callback: Function
  ): Promise<void> {
    try {
      const callbacks = this.subscriptions.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);

        // If no more callbacks, unsubscribe from Upstox
        if (callbacks.size === 0) {
          this.subscriptions.delete(symbol);
          const instrumentKey = this.getInstrumentKey(symbol);

          if (this.streamer && this.isConnected) {
            // **CORRECT: Use official SDK unsubscribe method**
            this.streamer.unsubscribe([instrumentKey]);
            console.log(
              `Unsubscribed from real-time data for ${symbol} (${instrumentKey})`
            );
          }
        }
      }
    } catch (error) {
      console.error(`Failed to unsubscribe from ${symbol}:`, error);
    }
  }

  // Handle incoming market updates
  private handleMarketUpdate(marketUpdate: any): void {
    try {
      // Parse Upstox market feed format
      if (marketUpdate.feeds) {
        Object.keys(marketUpdate.feeds).forEach((instrumentKey) => {
          const feedData = marketUpdate.feeds[instrumentKey];
          const symbol = this.getSymbolFromInstrumentKey(instrumentKey);

          if (symbol) {
            const callbacks = this.subscriptions.get(symbol);
            if (callbacks && callbacks.size > 0) {
              const priceData = {
                symbol,
                ltp: feedData?.ff?.marketFF?.ltpc?.ltp || 0,
                volume: feedData?.ff?.marketFF?.ltpc?.vol || 0,
                change: feedData?.ff?.marketFF?.ltpc?.chg || 0,
                changePercent: feedData?.ff?.marketFF?.ltpc?.chp || 0,
                timestamp: Date.now(),
              };

              // Notify all subscribers
              callbacks.forEach((callback) => {
                try {
                  callback(priceData);
                } catch (error) {
                  console.error("Subscriber callback error:", error);
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error handling market update:", error);
    }
  }

  // Convert instrument key back to symbol
  private getSymbolFromInstrumentKey(instrumentKey: string): string | null {
    for (const [symbol, key] of this.instrumentMap.entries()) {
      if (key === instrumentKey) {
        return symbol;
      }
    }
    return null;
  }

  // Disconnect WebSocket
  async disconnectWebSocket(): Promise<void> {
    try {
      if (this.streamer) {
        this.streamer.disconnect();
        this.streamer = null;
        this.isConnected = false;
        this.subscriptions.clear();
        console.log("Upstox WebSocket disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    }
  }

  // **ENHANCED: Format with proper error handling and flexible properties**
  private formatQuoteData(symbol: string, data: any): StockQuote {
    console.log(
      `📋 Formatting data for ${symbol}:`,
      JSON.stringify(data, null, 2)
    );

    if (!data) {
      throw new Error(`No data available for symbol: ${symbol}`);
    }

    return {
      symbol,
      price: data.last_price || data.ltp || 0, // Handle both formats
      change: data.day_change || data.change || 0,
      changePercent: data.day_change_percentage || data.changePercent || 0,
      volume: data.volume || 0,
      high: data.ohlc?.high || 0,
      low: data.ohlc?.low || 0,
      open: data.ohlc?.open || 0,
      close: data.ohlc?.close || 0,
      timestamp: Date.now(),
      source: "upstox",
    };
  }

  private formatHistoricalData(symbol: string, candles: any[]): HistoricalData {
    const data = candles.map((candle) => ({
      timestamp: new Date(candle[0]).getTime(),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));

    return {
      symbol,
      data,
      source: "upstox",
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // **TOKEN STATUS CHECK**
  public getTokenStatus(): {
    isValid: boolean;
    lastCheck: number;
    message: string;
  } {
    const now = Date.now();
    const timeSinceCheck = now - this.lastTokenCheck;

    return {
      isValid: this.isTokenValid,
      lastCheck: this.lastTokenCheck,
      message: this.isTokenValid
        ? `Token valid (checked ${Math.round(timeSinceCheck / 1000)}s ago)`
        : "Token expired - service using fallback",
    };
  }

  // **MANUAL TOKEN REFRESH** (for production)
  public refreshToken(newToken: string): void {
    this.config.accessToken = newToken;
    this.client.defaults.headers["Authorization"] = `Bearer ${newToken}`;
    this.isTokenValid = true;
    this.lastTokenCheck = Date.now();

    console.log(" Upstox token refreshed successfully");
  }

  async getWebSocketAuthUrl(): Promise<string> {
    try {
      const response = await this.makeApiCall(
        "/feed/market-data-feed/authorize"
      );
      return response.data.data.authorizedRedirectUri;
    } catch (error) {
      console.error("Upstox WebSocket auth error:", error);
      throw error;
    }
  }
}
