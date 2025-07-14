import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertTradingPlatformSchema, insertTemplateSchema, insertRevenueRecordSchema, feeTransactions, users, auditLogs } from "@shared/schema";
import { HyperliquidService } from "./services/hyperliquid";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { desc, sql, eq } from "drizzle-orm";
// Removed webhook imports - using batch processing instead

// Extend Express session types
declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
    adminEmail?: string;
  }
}

const hyperliquidService = new HyperliquidService();

// Configure multer for file uploads
const uploadDir = 'uploads';
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const multerStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function handleError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  const ADMIN_EMAIL = "admin@liquidlab.trade";
  const ADMIN_PASSWORD = "$2a$10$YourHashedAdminPassword"; // In production, use environment variable
  
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if it's the admin
      if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // For demo, accept "admin123" as password
      const validPassword = password === "admin123" || await bcrypt.compare(password, ADMIN_PASSWORD);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set admin session
      req.session.isAdmin = true;
      req.session.adminEmail = email;
      
      res.json({ 
        success: true,
        admin: { email }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.get("/api/admin/check", (req, res) => {
    if (req.session.isAdmin) {
      res.json({ 
        isAdmin: true,
        email: req.session.adminEmail 
      });
    } else {
      res.json({ isAdmin: false });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    req.session.isAdmin = false;
    req.session.adminEmail = undefined;
    res.json({ success: true });
  });
  
  // Admin-only middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };
  
  // Admin dashboard data
  app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    console.log("Admin dashboard request - session:", req.session);
    try {
      // Get all platforms with user info
      const allPlatforms = await storage.getTradingPlatforms();
      
      // Get all fee transactions
      const allTransactions = await db.select().from(feeTransactions).orderBy(desc(feeTransactions.createdAt)).limit(100);
      
      // Get revenue summaries
      const revenueSummaries = await storage.getAllPlatformRevenues();
      
      // Calculate totals
      const totalRevenue = revenueSummaries.reduce((sum, r) => sum + parseFloat(r.totalFees || '0'), 0);
      const liquidlabRevenue = revenueSummaries.reduce((sum, r) => sum + parseFloat(r.liquidlabEarnings || '0'), 0);
      const platformOwnerRevenue = revenueSummaries.reduce((sum, r) => sum + parseFloat(r.platformEarnings || '0'), 0);
      
      // Get user count
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      // Get MoonPay stats
      const moonpayStats = await storage.getMoonpayRevenueSummary();
      
      res.json({
        platforms: allPlatforms,
        recentTransactions: allTransactions,
        revenueSummaries,
        stats: {
          totalRevenue: totalRevenue.toFixed(2),
          liquidlabRevenue: liquidlabRevenue.toFixed(2),
          platformOwnerRevenue: platformOwnerRevenue.toFixed(2),
          platformCount: allPlatforms.length,
          userCount: userCount[0].count,
          transactionCount: allTransactions.length
        },
        moonpayStats
      });
    } catch (error) {
      console.error("Admin dashboard error - detailed:", error);
      res.status(500).json({ message: "Failed to fetch admin data", error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const userData = insertUserSchema.parse({
        username,
        email,
        password: hashedPassword,
      });
      
      const user = await storage.createUser(userData);
      
      // Generate builder and referral codes
      await storage.generateBuilderCode(user.id);
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          builderCode: user.builderCode,
          referralCode: user.referralCode
        }
      });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          builderCode: user.builderCode,
          referralCode: user.referralCode
        }
      });
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json(null);
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        builderCode: user.builderCode,
        referralCode: user.referralCode
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // User management
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Trading platforms
  app.get("/api/platforms", async (req, res) => {
    try {
      const { userId } = req.query;
      const platforms = await storage.getTradingPlatforms(userId as string);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const platformData = insertTradingPlatformSchema.parse(req.body);
      const platform = await storage.createTradingPlatform(platformData);
      res.json(platform);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const platform = await storage.getTradingPlatform(id);
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.put("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const platform = await storage.updateTradingPlatform(id, updates);
      res.json(platform);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTradingPlatform(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Custom domain management
  app.post("/api/platforms/:id/domains", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { domain } = req.body;
      
      // Check authentication
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized - Please login" });
      }
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(platformId);
      if (!platform || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { domainManager } = await import('./services/domainManager');
      const result = await domainManager.addCustomDomain(platformId, domain);
      
      if (result.success) {
        res.json({
          success: true,
          verificationToken: result.verificationToken,
          instructions: {
            recordType: 'TXT',
            recordName: '_liquidlab',
            recordValue: result.verificationToken
          }
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.post("/api/platforms/:id/domains/verify", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { domain } = req.body;
      
      // Check authentication
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized - Please login" });
      }
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(platformId);
      if (!platform || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { domainManager } = await import('./services/domainManager');
      const result = await domainManager.verifyDomain(platformId, domain);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.get("/api/platforms/:id/domains", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      
      // Check authentication
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized - Please login" });
      }
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(platformId);
      if (!platform || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { domainManager } = await import('./services/domainManager');
      const domains = await domainManager.getPlatformDomains(platformId);
      
      // Transform data to match frontend expectations
      const transformedDomains = domains.map(domain => ({
        ...domain,
        status: domain.isVerified ? 'active' : 'pending'
      }));
      
      res.json(transformedDomains);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.delete("/api/platforms/:id/domains/:domain", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { domain } = req.params;
      
      // Check authentication
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized - Please login" });
      }
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(platformId);
      if (!platform || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { domainManager } = await import('./services/domainManager');
      const success = await domainManager.removeDomain(platformId, domain);
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Revenue tracking
  app.get("/api/revenue/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { period = '30d' } = req.query;
      const records = await storage.getRevenueRecords(parseInt(userId), period as string);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/revenue", async (req, res) => {
    try {
      const revenueData = insertRevenueRecordSchema.parse(req.body);
      const record = await storage.createRevenueRecord(revenueData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // Builder codes
  app.post("/api/builder-codes", async (req, res) => {
    try {
      const { userId } = req.body;
      const code = await storage.generateBuilderCode(userId);
      res.json({ code });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/builder-codes/:code/validate", async (req, res) => {
    try {
      const { code } = req.params;
      const isValid = await storage.validateBuilderCode(code);
      res.json({ isValid });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Analytics
  app.get("/api/analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const analytics = await storage.getDashboardAnalytics(parseInt(userId));
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Referrals
  app.post("/api/referrals", async (req, res) => {
    try {
      const { referrerId, referredUserId } = req.body;
      const referral = await storage.createReferral(referrerId, referredUserId);
      res.json(referral);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/referrals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const referrals = await storage.getReferrals(parseInt(userId));
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Hyperliquid API endpoints
  app.get("/api/hyperliquid/market-data", async (req, res) => {
    try {
      const { symbol } = req.query;
      const data = await hyperliquidService.getMarketData(symbol as string);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Get properly mapped market prices with symbol names using orderbook mid prices and volume data
  app.get("/api/hyperliquid/market-prices", async (req, res) => {
    try {
      // Get market metadata with volume data
      const metaData = await hyperliquidService.getMetaAndAssetCtxs();
      
      if (!metaData || !metaData[0] || !metaData[0].universe) {
        return res.json({});
      }

      // Create a map of symbol to market data from asset contexts
      const marketDataMap: { [key: string]: { 
        price: number; 
        volume24h: string; 
        change24h: string;
        high24h: string;
        low24h: string;
      } } = {};
      
      if (metaData[1]) {
        metaData[0].universe.forEach((market: any, index: number) => {
          if (metaData[1][index]) {
            // Asset context contains volume and price data
            const assetCtx = metaData[1][index];
            
            const price = parseFloat(assetCtx.markPx || assetCtx.midPx || "0");
            const prevDayPrice = parseFloat(assetCtx.prevDayPx || "0");
            
            // Calculate 24h change percentage
            let change24h = "0";
            if (prevDayPrice > 0) {
              const changePercent = ((price - prevDayPrice) / prevDayPrice) * 100;
              change24h = changePercent.toFixed(2);
            }
            
            // Volume data is in dayNtlVlm (day notional volume)
            const volume = assetCtx.dayNtlVlm || "0";
            
            // Estimate high/low based on price and volatility (since Hyperliquid doesn't provide these directly)
            // Use a conservative estimate of 2% daily range
            const volatilityFactor = 0.02;
            const high24h = (price * (1 + volatilityFactor)).toFixed(2);
            const low24h = (price * (1 - volatilityFactor)).toFixed(2);
            
            marketDataMap[market.name] = {
              price: price,
              volume24h: volume,
              change24h: change24h,
              high24h: high24h,
              low24h: low24h
            };
          }
        });
      }

      // For main markets, get more accurate prices from orderbooks
      const mainMarkets = ['BTC', 'ETH', 'SOL', 'ARB', 'MATIC', 'AVAX', 'BNB', 'DOGE', 'SUI', 'APT'];
      const orderbookPromises = mainMarkets.map(async (symbol) => {
        try {
          const orderbook = await hyperliquidService.getOrderbook(symbol);
          if (orderbook && orderbook.levels) {
            const bestAsk = parseFloat(orderbook.levels[0][0]?.px || '0');
            const bestBid = parseFloat(orderbook.levels[1][0]?.px || '0');
            const midPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : bestAsk || bestBid;
            if (midPrice > 0) {
              // Update with more accurate orderbook price
              marketDataMap[symbol] = {
                ...marketDataMap[symbol],
                price: midPrice
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching ${symbol} orderbook:`, error);
        }
      });

      await Promise.all(orderbookPromises);

      res.json(marketDataMap);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/orderbook/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await hyperliquidService.getOrderbook(symbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/candles/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = '15m' } = req.query;
      
      // Get current price directly from Hyperliquid
      const orderbookData = await hyperliquidService.getOrderbook(symbol);
      let currentPrice = 100000; // Default for BTC
      
      if (orderbookData && orderbookData.levels) {
        const bestAsk = parseFloat(orderbookData.levels[0]?.[0]?.px || '0');
        const bestBid = parseFloat(orderbookData.levels[1]?.[0]?.px || '0');
        currentPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : bestAsk || bestBid || currentPrice;
      }
      
      // Generate realistic candle data
      const now = Math.floor(Date.now() / 1000);
      const intervalSeconds = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '1h': 3600,
        '4h': 14400,
        '1d': 86400
      }[interval as string] || 900;
      
      const candles = [];
      for (let i = 100; i >= 0; i--) {
        const time = now - (i * intervalSeconds);
        const volatility = 0.0002; // 0.02% volatility per candle
        const trend = Math.sin(i / 20) * 0.001; // Slight trend
        const random = (Math.random() - 0.5) * volatility;
        
        const basePrice = currentPrice * (1 - (i * 0.00001) + trend);
        const open = basePrice * (1 + random);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        
        candles.push({
          time: time * 1000, // Convert to milliseconds
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000000
        });
      }
      
      res.json({ candles });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Hyperliquid spot trading endpoints
  app.get("/api/hyperliquid/spot-markets", async (req, res) => {
    try {
      // Get current market prices for spot tokens
      const marketPrices = await hyperliquidService.getMetaAndAssetCtxs();
      
      // Define the main spot markets available on Hyperliquid
      const spotTokens = [
        'BTC', 'ETH', 'SOL', 'ARB', 'MATIC', 'AVAX', 'BNB', 'DOGE', 
        'SUI', 'APT', 'INJ', 'OP', 'LINK', 'UNI', 'CRV', 'AAVE',
        'MKR', 'SNX', 'LDO', 'RUNE', 'ATOM', 'DOT', 'ADA', 'XRP'
      ];
      
      const spotMarkets = [];
      
      // Get price data from the market prices we already have
      if (marketPrices && marketPrices[0] && marketPrices[0].universe && marketPrices[1]) {
        const universe = marketPrices[0].universe;
        const assetCtxs = marketPrices[1];
        
        universe.forEach((market: any, index: number) => {
          if (spotTokens.includes(market.name) && assetCtxs[index]) {
            const assetCtx = assetCtxs[index];
            const price = parseFloat(assetCtx.markPx || '0');
            const prevDayPrice = parseFloat(assetCtx.prevDayPx || '0');
            
            let change24h = '0.00';
            if (prevDayPrice > 0 && price > 0) {
              const changePercent = ((price - prevDayPrice) / prevDayPrice) * 100;
              change24h = changePercent.toFixed(2);
            }
            
            if (price > 0) {
              spotMarkets.push({
                token: market.name,
                name: market.name,
                index: 10000 + spotMarkets.length, // Spot indices
                markPrice: price.toString(),
                volume24h: assetCtx.dayNtlVlm || '0',
                change24h: change24h,
                baseDecimals: 8,
                quoteDecimals: 6
              });
            }
          }
        });
      }
      
      // Sort by volume
      spotMarkets.sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
      
      // If no markets found, return defaults
      if (spotMarkets.length === 0) {
        const defaultSpotMarkets = [
          { token: 'BTC', name: 'Bitcoin', index: 10000, markPrice: '120000.00', volume24h: '5000000', change24h: '2.5', baseDecimals: 8, quoteDecimals: 6 },
          { token: 'ETH', name: 'Ethereum', index: 10001, markPrice: '3000.00', volume24h: '2500000', change24h: '1.8', baseDecimals: 8, quoteDecimals: 6 },
          { token: 'SOL', name: 'Solana', index: 10002, markPrice: '160.00', volume24h: '1000000', change24h: '-0.5', baseDecimals: 8, quoteDecimals: 6 },
          { token: 'ARB', name: 'Arbitrum', index: 10003, markPrice: '1.25', volume24h: '500000', change24h: '3.2', baseDecimals: 8, quoteDecimals: 6 }
        ];
        return res.json(defaultSpotMarkets);
      }
      
      res.json(spotMarkets);
    } catch (error) {
      console.error('Error fetching spot markets:', error);
      // Return default markets on error
      const defaultSpotMarkets = [
        { token: 'BTC', name: 'Bitcoin', index: 10000, markPrice: '120000.00', volume24h: '5000000', change24h: '2.5', baseDecimals: 8, quoteDecimals: 6 },
        { token: 'ETH', name: 'Ethereum', index: 10001, markPrice: '3000.00', volume24h: '2500000', change24h: '1.8', baseDecimals: 8, quoteDecimals: 6 },
        { token: 'SOL', name: 'Solana', index: 10002, markPrice: '160.00', volume24h: '1000000', change24h: '-0.5', baseDecimals: 8, quoteDecimals: 6 },
        { token: 'ARB', name: 'Arbitrum', index: 10003, markPrice: '1.25', volume24h: '500000', change24h: '3.2', baseDecimals: 8, quoteDecimals: 6 }
      ];
      res.json(defaultSpotMarkets);
    }
  });
  
  app.get("/api/hyperliquid/spot-account/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Get spot balances
      const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'spotClearinghouseState',
          user: address
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const accountState = await response.json();
      res.json(accountState);
    } catch (error) {
      console.error('Error fetching spot account:', error);
      res.status(500).json({ error: 'Failed to fetch spot account state' });
    }
  });
  
  app.post("/api/hyperliquid/spot-transfer", async (req, res) => {
    try {
      const { address, amount, toPerp, nonce, signature } = req.body;
      
      // Construct the transfer action
      const action = {
        type: toPerp ? 'spotSend' : 'withdraw3',
        destination: toPerp ? 'perp' : 'spot',
        amount: amount,
        nonce: nonce
      };
      
      // Submit to Hyperliquid
      const response = await fetch('https://api.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          nonce: nonce,
          signature: signature
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Transfer failed');
      }
      
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Error processing spot transfer:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Transfer failed' });
    }
  });
  
  app.post("/api/hyperliquid/spot-order", async (req, res) => {
    try {
      const { address, token, isBuy, amount, limitPrice, nonce, signature } = req.body;
      
      // Construct the spot order action
      const orderType = limitPrice ? { limit: { tif: 'Gtc' } } : { market: {} };
      
      const action = {
        type: 'spotOrder',
        coin: token,
        isBuy: isBuy,
        sz: amount,
        limitPx: limitPrice,
        orderType: orderType,
        nonce: nonce
      };
      
      // Submit to Hyperliquid
      const response = await fetch('https://api.hyperliquid.xyz/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          nonce: nonce,
          signature: signature
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Order failed');
      }
      
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Error placing spot order:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Order failed' });
    }
  });

  app.get("/api/hyperliquid/user-state/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const data = await hyperliquidService.getUserState(address);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/hyperliquid/place-order", async (req, res) => {
    try {
      // The order request should already be signed on the client side
      const { orderRequest } = req.body;
      const result = await hyperliquidService.placeOrder(orderRequest);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/user-positions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const data = await hyperliquidService.getUserPositions(address);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/open-orders/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const data = await hyperliquidService.getUserOpenOrders(address);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/meta", async (req, res) => {
    try {
      const data = await hyperliquidService.getMetaAndAssetCtxs();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Platform verification endpoints
  app.get("/api/platforms/verify/:platformId", async (req, res) => {
    try {
      const { platformId } = req.params;
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      res.json({
        id: platform.id,
        name: platform.name,
        isVerified: platform.isVerified || false,
        verificationDate: platform.verificationDate,
        customDomain: platform.customDomain,
        builderCode: 'LIQUIDLAB2025'
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/admin/platforms/:platformId/verify", requireAdmin, async (req, res) => {
    try {
      const { platformId } = req.params;
      const { notes } = req.body;
      
      const updatedPlatform = await storage.updateTradingPlatform(parseInt(platformId), {
        isVerified: true,
        verificationDate: new Date(),
        verificationNotes: notes
      });
      
      res.json({ success: true, platform: updatedPlatform });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // MoonPay configuration endpoint
  app.get("/api/moonpay/config", async (req, res) => {
    try {
      // In production, this would come from environment variables
      // For now, return a placeholder that indicates MoonPay integration is ready
      res.json({
        apiKey: process.env.MOONPAY_API_KEY || 'pk_test_liquidlab2025',
        environment: process.env.MOONPAY_ENV || 'test'
      });
    } catch (error) {
      console.error('Error fetching MoonPay config:', error);
      res.status(500).json({ message: 'Failed to fetch MoonPay configuration' });
    }
  });

  // MoonPay revenue endpoints
  app.get("/api/moonpay/revenue/:platformId", async (req, res) => {
    try {
      const platformId = parseInt(req.params.platformId);
      const moonpayStats = await storage.getMoonpayRevenueSummary(platformId);
      res.json(moonpayStats);
    } catch (error) {
      console.error('Error fetching MoonPay revenue:', error);
      res.status(500).json({ message: 'Failed to fetch MoonPay revenue' });
    }
  });

  app.get("/api/moonpay/revenue", async (req, res) => {
    try {
      const moonpayStats = await storage.getMoonpayRevenueSummary();
      res.json(moonpayStats);
    } catch (error) {
      console.error('Error fetching total MoonPay revenue:', error);
      res.status(500).json({ message: 'Failed to fetch MoonPay revenue' });
    }
  });

  app.post("/api/moonpay/record", async (req, res) => {
    try {
      const { platformId, transactionId, purchaseAmount } = req.body;
      
      const affiliateFee = (parseFloat(purchaseAmount) * 0.01).toFixed(4); // 1% affiliate fee
      const platformEarnings = (parseFloat(affiliateFee) * 0.5).toFixed(4); // 50% split
      const liquidlabEarnings = (parseFloat(affiliateFee) * 0.5).toFixed(4); // 50% split
      
      const transaction = await storage.recordMoonpayTransaction({
        platformId,
        transactionId,
        purchaseAmount,
        affiliateFee,
        platformEarnings,
        liquidlabEarnings,
        currency: 'USD',
        status: 'completed',
        completedAt: new Date()
      });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error recording MoonPay transaction:', error);
      res.status(500).json({ message: 'Failed to record MoonPay transaction' });
    }
  });

  // Crypto payout endpoints
  app.get("/api/payouts/platform/:platformId", async (req, res) => {
    try {
      const platformId = parseInt(req.params.platformId);
      const { status, startDate, endDate } = req.query;
      
      // Verify user owns this platform
      if (req.session.userId) {
        const platform = await storage.getTradingPlatform(platformId);
        if (!platform || platform.userId !== req.session.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }
      
      const options: any = {};
      if (status) options.status = status as string;
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      
      const payouts = await storage.getPayouts(platformId, options);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      res.status(500).json({ error: 'Failed to fetch payouts' });
    }
  });

  app.get("/api/payouts/pending/:platformId", async (req, res) => {
    try {
      const platformId = parseInt(req.params.platformId);
      
      // Verify user owns this platform
      if (req.session.userId) {
        const platform = await storage.getTradingPlatform(platformId);
        if (!platform || platform.userId !== req.session.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }
      
      const pendingPayouts = await storage.getPendingPayouts(platformId);
      res.json(pendingPayouts);
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      res.status(500).json({ error: 'Failed to fetch pending payouts' });
    }
  });

  // Admin-only: Process payouts
  app.post("/api/payouts/process", requireAdmin, async (req, res) => {
    try {
      const { period = 'weekly' } = req.body;
      
      if (!process.env.PAYOUT_WALLET_PRIVATE_KEY) {
        return res.status(500).json({ error: 'Payout wallet not configured' });
      }
      
      // Run async without waiting
      const { cryptoPayout } = await import('./services/cryptoPayout');
      cryptoPayout.processPayouts(period as 'weekly' | 'monthly').catch(error => {
        console.error('Payout processing error:', error);
      });
      
      res.json({ 
        success: true, 
        message: 'Payout processing started in background' 
      });
    } catch (error) {
      console.error('Error starting payout processing:', error);
      res.status(500).json({ error: 'Failed to start payout processing' });
    }
  });

  // Fee tracking endpoints
  app.post("/api/fees/record", async (req, res) => {
    try {
      const { platformId, tradeType, tradeVolume, tradeDetails } = req.body;
      
      // Calculate fees based on trade type
      const feePercentage = tradeType === 'spot' ? 0.002 : 0.001; // 0.2% for spot, 0.1% for perp
      const totalFee = parseFloat(tradeVolume) * feePercentage;
      const platformShare = totalFee * 0.7; // 70% to platform owner
      const liquidlabShare = totalFee * 0.3; // 30% to LiquidLab
      
      const feeTransaction = await storage.recordFeeTransaction({
        platformId,
        tradeType,
        tradeVolume: tradeVolume.toString(),
        totalFee: totalFee.toFixed(8),
        platformShare: platformShare.toFixed(8),
        liquidlabShare: liquidlabShare.toFixed(8),
        tradeDetails: tradeDetails || {},
        status: 'pending',
      });
      
      res.json(feeTransaction);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.get("/api/fees/platform/:platformId", async (req, res) => {
    try {
      const { platformId } = req.params;
      const { status, startDate, endDate } = req.query;
      
      const options: any = {};
      if (status) options.status = status as string;
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      
      const transactions = await storage.getFeeTransactions(parseInt(platformId), options);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.get("/api/fees/summary/:platformId/:period", async (req, res) => {
    try {
      const { platformId, period } = req.params;
      const summary = await storage.getRevenueSummary(parseInt(platformId), period);
      res.json(summary || { message: "No summary found for this period" });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.get("/api/fees/all-platforms", async (req, res) => {
    try {
      const { period, minRevenue } = req.query;
      const options: any = {};
      if (period) options.period = period as string;
      if (minRevenue) options.minRevenue = parseFloat(minRevenue as string);
      
      const revenues = await storage.getAllPlatformRevenues(options);
      res.json(revenues);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Logo upload endpoint
  app.post("/api/upload-logo", upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Return the URL path to the uploaded file
      const logoUrl = `/uploads/${req.file.filename}`;
      res.json({ url: logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // CoinGecko price proxy endpoint
  app.get("/api/prices", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== 'string') {
        return res.status(400).json({ error: "Missing 'ids' parameter" });
      }
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching prices from CoinGecko:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Trade batch processing endpoints
  app.post("/api/trades/process-batch", requireAdmin, async (req, res) => {
    try {
      // Manually trigger batch processing
      const { tradeBatchProcessor } = await import('./services/tradeBatchProcessor');
      
      // Run async without waiting
      tradeBatchProcessor.processTradeBatch().catch(error => {
        console.error('Manual batch processing error:', error);
      });
      
      res.json({ 
        success: true, 
        message: 'Batch processing started in background' 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start batch processing' });
    }
  });
  
  app.get("/api/trades/batch-status", requireAdmin, async (req, res) => {
    try {
      // Get recent batch processing logs
      const recentLogs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.resource, 'trade_batch_processor'))
        .orderBy(desc(auditLogs.createdAt))
        .limit(10);
      
      res.json({ 
        success: true,
        logs: recentLogs 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get batch status' });
    }
  });

  // Privy configuration endpoint
  app.get("/api/privy/config", async (req, res) => {
    try {
      const appId = process.env.PRIVY_APP_ID;
      if (!appId) {
        return res.status(500).json({ error: "Privy app ID not configured" });
      }
      res.json({ appId });
    } catch (error) {
      console.error("Error fetching Privy config:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Save wallet address from Privy
  app.post("/api/privy/wallet", async (req, res) => {
    try {
      const { walletAddress, email } = req.body;
      
      if (!walletAddress || !email) {
        return res.status(400).json({ error: "Wallet address and email required" });
      }

      // Check if user exists by email
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update existing user with wallet address
        user = await storage.updateUserWallet(user.id, walletAddress);
      } else {
        // Create new user with wallet address
        user = await storage.createUser({
          email,
          username: email.split('@')[0], // Simple username from email
          password: 'privy-wallet-user', // Placeholder for wallet users
          walletAddress
        });
      }

      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("Error saving wallet address:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}