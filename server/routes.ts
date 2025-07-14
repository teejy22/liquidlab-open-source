import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertTradingPlatformSchema, insertTemplateSchema, insertRevenueRecordSchema, feeTransactions } from "@shared/schema";
import { HyperliquidService } from "./services/hyperliquid";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { desc, sql } from "drizzle-orm";

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
  const ADMIN_EMAIL = "admin@liquidlab.com";
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
        }
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch admin data" });
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
      const { interval = '1m', startTime, endTime } = req.query;
      const data = await hyperliquidService.getCandleData(
        symbol,
        interval as string,
        startTime ? parseInt(startTime as string) : undefined,
        endTime ? parseInt(endTime as string) : undefined
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
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
      const { userAddress, order } = req.body;
      const result = await hyperliquidService.placeOrder(userAddress, order);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
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

  const httpServer = createServer(app);
  return httpServer;
}