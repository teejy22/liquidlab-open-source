import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertTradingPlatformSchema, insertTemplateSchema, insertRevenueRecordSchema } from "@shared/schema";
import { HyperliquidService } from "./services/hyperliquid";

const hyperliquidService = new HyperliquidService();

function handleError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, address } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      
      const existingAddress = await storage.getUserByAddress(address);
      if (existingAddress) {
        return res.status(400).json({ error: "User with this wallet address already exists" });
      }
      
      // Create new user
      const userData = insertUserSchema.parse({
        username,
        email,
        address,
      });
      
      const user = await storage.createUser(userData);
      
      // Generate builder and referral codes
      await storage.generateBuilderCode(user.id);
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          address: user.address,
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
      const { email, address } = req.body;
      
      const user = await storage.authenticateUser(email, address);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          address: user.address,
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
      // This would normally check session/token, but for now we'll return null
      // In a real app, you'd validate the session and return the current user
      res.json(null);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Clear session/token
      res.json({ success: true });
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

  app.get("/api/users/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const user = await storage.getUserByAddress(address);
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

  const httpServer = createServer(app);
  return httpServer;
}