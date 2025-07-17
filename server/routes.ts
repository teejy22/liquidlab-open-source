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
import ConfigurationService from "./services/configService";
import DepositService from "./services/depositService";
import { authLimiter } from "./security/customRateLimiter";

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
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@liquidlab.trade";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Required environment variable
  
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, totp } = req.body;
      
      // Check if admin credentials are configured
      if (!ADMIN_PASSWORD) {
        return res.status(500).json({ message: "Admin authentication not configured" });
      }
      
      // Check if it's the admin
      if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password against environment variable
      const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if admin 2FA is enabled
      const admin2FASecret = process.env.ADMIN_2FA_SECRET;
      const admin2FAEnabled = process.env.ADMIN_2FA_ENABLED === 'true';
      
      if (admin2FAEnabled && admin2FASecret) {
        if (!totp) {
          return res.status(200).json({ 
            requiresTwoFactor: true 
          });
        }

        // Import auth utilities dynamically
        const { verify2FAToken } = await import("./security/auth");
        
        if (!verify2FAToken(admin2FASecret, totp)) {
          return res.status(401).json({ message: "Invalid 2FA code" });
        }
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
  
  // Temporary endpoint to generate verification codes for existing platforms
  app.post("/api/admin/generate-verification-codes", requireAdmin, async (req, res) => {
    try {
      const { VerificationService } = await import("./services/verification");
      const platforms = await storage.getTradingPlatforms();
      const results = [];
      
      for (const platform of platforms) {
        const { code } = await VerificationService.generateToken(platform.id);
        results.push({ platformId: platform.id, name: platform.name, code });
      }
      
      res.json({ message: 'Verification codes generated', results });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });
  
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

  // Admin user management endpoints
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Format users for display (exclude password hashes)
      const formattedUsers = allUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        builderCode: user.builderCode,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      
      res.json({ users: formattedUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:userId/reset-password", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the user's password
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
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
      const { email, password, totp } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        if (!totp) {
          return res.status(200).json({ 
            requiresTwoFactor: true,
            userId: user.id 
          });
        }

        // Import auth utilities dynamically
        const { verify2FAToken } = await import("./security/auth");
        const secret = await storage.get2FASecret(user.id);
        
        if (!secret || !verify2FAToken(secret, totp)) {
          // Try backup code
          const isBackupValid = await storage.verify2FABackupCode(user.id, totp);
          if (!isBackupValid) {
            return res.status(401).json({ error: "Invalid 2FA code" });
          }
        }
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

  // 2FA management endpoints
  app.get("/api/auth/2fa/setup", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { generate2FASecret, generateQRCode } = await import("./security/auth");
      const secret = generate2FASecret(user.email);
      
      // Generate backup codes
      const backupCodes: string[] = [];
      for (let i = 0; i < 8; i++) {
        backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
      }

      // Save secret and backup codes temporarily
      await storage.setup2FA(user.id, secret.base32, backupCodes);

      // Generate QR code
      const qrCode = await generateQRCode(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode,
        backupCodes
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/2fa/enable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { totp } = req.body;
      if (!totp) {
        return res.status(400).json({ error: "2FA code required" });
      }

      const secret = await storage.get2FASecret(req.session.userId);
      if (!secret) {
        return res.status(400).json({ error: "2FA not set up" });
      }

      const { verify2FAToken } = await import("./security/auth");
      if (!verify2FAToken(secret, totp)) {
        return res.status(400).json({ error: "Invalid 2FA code" });
      }

      await storage.enable2FA(req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Password required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }

      await storage.disable2FA(req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/auth/2fa/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        enabled: user.twoFactorEnabled || false
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
      
      // Import SecurityService
      const { SecurityService } = await import("./services/security");
      
      // Initialize security monitoring for the platform
      await SecurityService.initializePlatformSecurity(platform.id);
      
      // Import VerificationService and generate verification code
      const { VerificationService } = await import("./services/verification");
      await VerificationService.generateToken(platform.id);
      
      // Scan platform content for suspicious elements
      const isClean = await SecurityService.scanPlatformContent(platform.id, {
        name: platform.name,
        config: platform.config,
        logoUrl: platform.logoUrl
      });
      
      if (!isClean) {
        // Mark platform for review if suspicious content detected
        await SecurityService.updateRiskScore(platform.id, 50);
      }
      
      // Send approval notification to admin
      const user = await storage.getUser(platform.userId);
      if (user) {
        const { sendPlatformApprovalNotification } = await import('./services/notifications');
        await sendPlatformApprovalNotification(platform, user);
      }
      
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
      
      // Check if platform is allowed to be updated
      const { SecurityService } = await import("./services/security");
      const isAllowed = await SecurityService.isPlatformAllowed(id);
      if (!isAllowed) {
        return res.status(403).json({ error: "This platform has been suspended. Please contact support." });
      }
      
      // Scan for suspicious content if platform details are being updated
      if (updates.name || updates.config || updates.logoUrl) {
        const isClean = await SecurityService.scanPlatformContent(id, {
          name: updates.name,
          config: updates.config,
          logoUrl: updates.logoUrl
        });
        
        if (!isClean) {
          await SecurityService.updateRiskScore(id, 30);
        }
      }
      
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
        fundingRate: string;
        openInterest: string;
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
            
            // Funding rate (8-hour rate converted to annual percentage)
            const funding = assetCtx.funding || "0";
            const fundingRate = (parseFloat(funding) * 365 * 3 * 100).toFixed(2); // Convert to annual %
            
            // Open interest in USD
            const openInterest = assetCtx.openInterest || "0";
            
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
              low24h: low24h,
              fundingRate: fundingRate,
              openInterest: openInterest
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
                price: midPrice,
                fundingRate: marketDataMap[symbol]?.fundingRate || "0",
                openInterest: marketDataMap[symbol]?.openInterest || "0"
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

  // Get user balances including withdrawable amount
  app.get("/api/hyperliquid/balances/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const userState = await hyperliquidService.getUserState(address);
      
      // Extract relevant balance information
      const balances = {
        withdrawable: userState?.withdrawable || "0",
        accountValue: userState?.marginSummary?.accountValue || "0",
        totalMarginUsed: userState?.marginSummary?.totalMarginUsed || "0",
        balances: userState?.balances || {},
        marginSummary: userState?.marginSummary || {}
      };
      
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Withdraw from Hyperliquid to Arbitrum
  app.post("/api/hyperliquid/withdraw", async (req, res) => {
    try {
      const { amount, destination } = req.body;
      
      if (!amount || parseFloat(amount) < 2) {
        return res.status(400).json({ error: "Minimum withdrawal is 2 USDC (1 USDC fee)" });
      }
      
      if (!destination) {
        return res.status(400).json({ error: "Destination address required" });
      }
      
      // For now, return a placeholder response since we need the user's private key
      // In production, this would use the agent wallet system or require user signature
      res.json({
        success: true,
        message: "Withdrawal functionality requires wallet signature. Please use Hyperliquid's interface for withdrawals.",
        amount: amount,
        destination: destination
      });
      
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Debug endpoint to find all USDC pairs with proper token mapping
  app.get("/api/hyperliquid/spot-pairs-debug", async (req, res) => {
    try {
      const spotMetaData = await hyperliquidService.getSpotMetaAndAssetCtxs();
      
      if (!spotMetaData || spotMetaData.length < 2) {
        return res.status(500).json({ error: "Failed to fetch spot data" });
      }
      
      const [spotMeta, assetCtxs] = spotMetaData;
      
      // Token name mappings (based on Hyperliquid documentation)
      const tokenMappings: Record<string, string[]> = {
        "BTC": ["BTC", "UBTC", "WBTC"],  // BTC might appear as UBTC on mainnet
        "ETH": ["ETH", "WETH"],
        "SOL": ["SOL", "WSOL"],
        "FARTCOIN": ["FARTCOIN", "FART"],
        "PUMP": ["PUMP"],
        "HYPE": ["HYPE"]
      };
      
      const usdcPairs: any[] = [];
      const foundTokens: Record<string, any> = {};
      
      // Find all USDC pairs and check for our target tokens
      spotMeta.universe.forEach((pair: any, pairIndex: number) => {
        const baseTokenIndex = pair.tokens[0];
        const quoteTokenIndex = pair.tokens[1];
        
        const baseToken = spotMeta.tokens.find((t: any) => t.index === baseTokenIndex);
        const quoteToken = spotMeta.tokens.find((t: any) => t.index === quoteTokenIndex);
        
        if (quoteToken?.name === "USDC" && baseToken) {
          const assetCtx = assetCtxs[pairIndex];
          const pairInfo = {
            pairName: pair.name,
            baseToken: baseToken.name,
            baseIndex: baseTokenIndex,
            pairIndex: pairIndex,
            price: assetCtx?.midPx || assetCtx?.markPx || "0",
            volume: assetCtx?.dayNtlVlm || "0"
          };
          
          usdcPairs.push(pairInfo);
          
          // Check if this matches any of our target tokens
          for (const [targetName, possibleNames] of Object.entries(tokenMappings)) {
            if (possibleNames.includes(baseToken.name)) {
              foundTokens[targetName] = {
                actualName: baseToken.name,
                ...pairInfo
              };
              break;
            }
          }
        }
      });
      
      res.json({
        allUsdcPairs: usdcPairs,
        foundTargetTokens: foundTokens,
        totalUsdcPairs: usdcPairs.length
      });
    } catch (error) {
      console.error("Error in spot pairs debug:", error);
      res.status(500).json({ error: "Failed to debug spot pairs" });
    }
  });

  // Spot trading endpoints
  app.get("/api/hyperliquid/spot-prices", async (req, res) => {
    try {
      // Fetch spot metadata and prices
      const spotMetaData = await hyperliquidService.getSpotMetaAndAssetCtxs();
      
      if (!spotMetaData || spotMetaData.length < 2) {
        return res.status(500).json({ error: "Failed to fetch spot data" });
      }
      
      const [spotMeta, assetCtxs] = spotMetaData;
      const spotPrices: Record<string, any> = {};
      
      // Map token names to their indices
      const tokenIndexMap: Record<string, number> = {};
      spotMeta.tokens.forEach((token: any) => {
        tokenIndexMap[token.name] = token.index;
      });
      
      // Define token mappings - Universal tokens on Hyperliquid spot
      const tokenMappings: Record<string, string> = {
        "UBTC": "BTC",  // Universal BTC shows as BTC in UI
        "UETH": "ETH",  // Universal ETH shows as ETH in UI
        "USOL": "SOL",  // Universal SOL shows as SOL in UI
        "PUMP": "PUMP",
        "HYPE": "HYPE"
      };
      
      // Find spot pairs for our supported tokens
      spotMeta.universe.forEach((pair: any, pairIndex: number) => {
        const baseTokenIndex = pair.tokens[0];
        const quoteTokenIndex = pair.tokens[1];
        
        // Find the base token
        const baseToken = spotMeta.tokens.find((t: any) => t.index === baseTokenIndex);
        const quoteToken = spotMeta.tokens.find((t: any) => t.index === quoteTokenIndex);
        
        // Include tokens that are in our mapping and paired with USDC
        if (baseToken && quoteToken && quoteToken.name === "USDC" && tokenMappings.hasOwnProperty(baseToken.name)) {
          const assetCtx = assetCtxs[pairIndex];
          if (assetCtx) {
            const rawPrice = parseFloat(assetCtx.midPx || assetCtx.markPx || "0");
            const prevPrice = parseFloat(assetCtx.prevDayPx || "0");
            
            // Apply decimal adjustment based on szDecimals
            const decimals = baseToken.szDecimals || 0;
            const price = rawPrice * Math.pow(10, decimals);
            const adjustedPrevPrice = prevPrice * Math.pow(10, decimals);
            
            const change24h = adjustedPrevPrice > 0 ? ((price - adjustedPrevPrice) / adjustedPrevPrice * 100) : 0;
            
            // Use the mapped display name (e.g., UBTC -> BTC)
            const displaySymbol = tokenMappings[baseToken.name];
            
            spotPrices[displaySymbol] = {
              symbol: displaySymbol,
              actualSymbol: baseToken.name,  // Keep the actual symbol for trading
              price: price,
              change24h: change24h,
              volume24h: parseFloat(assetCtx.dayNtlVlm || "0"),
              pairIndex: pairIndex,
              baseTokenIndex: baseTokenIndex,
              quoteTokenIndex: quoteTokenIndex,
              pairName: pair.name  // Include the pair name (e.g., @142)
            };
          }
        }
      });
      

      
      res.json(spotPrices);
    } catch (error) {
      console.error("Error fetching spot prices:", error);
      res.status(500).json({ error: "Failed to fetch spot prices" });
    }
  });

  app.post("/api/hyperliquid/spot-order", async (req, res) => {
    try {
      // Check authentication
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { symbol, side, amount, walletAddress } = req.body;
      
      if (!symbol || !side || !amount || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // For spot trading, we need to:
      // 1. Get the spot pair info
      // 2. Sign the order with the user's wallet (done on frontend)
      // 3. Submit to Hyperliquid
      
      // This is a simplified response for now
      // In production, this would handle the actual spot order placement
      res.json({
        success: true,
        message: `Spot ${side} order for ${amount} ${symbol} requires wallet signature`,
        orderId: `spot_${Date.now()}`,
        note: "Please use the trading interface to sign and submit spot orders"
      });
    } catch (error) {
      console.error("Error placing spot order:", error);
      res.status(500).json({ error: "Failed to place spot order" });
    }
  });

  // Get validated contract addresses for secure deposits
  app.get("/api/deposit/config", async (req, res) => {
    try {
      const config = ConfigurationService.getContractAddresses();
      const rateLimits = ConfigurationService.getDepositRateLimits();
      
      res.json({
        addresses: {
          hyperliquidBridge: config.hyperliquidBridge,
          arbitrumUSDC: config.arbitrumUSDC,
        },
        minimumAmount: config.minimumDepositAmount,
        rateLimits: {
          maxPerHour: rateLimits.maxDepositsPerHour,
          maxPerDay: rateLimits.maxDepositsPerDay,
          maxAmount: rateLimits.maxAmountPerDeposit,
        },
        environment: config.environment,
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Record a new deposit transaction
  app.post("/api/deposit/record", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { amount, walletAddress, bridgeAddress, tokenAddress, txHash } = req.body;
      
      // Validate request body
      if (!amount || !walletAddress || !bridgeAddress || !tokenAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Record deposit with security checks
      const result = await DepositService.recordDeposit({
        userId: req.session.userId,
        walletAddress,
        amount,
        bridgeAddress,
        tokenAddress,
        txHash,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        depositId: result.depositId,
        message: "Deposit recorded successfully",
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Get user's recent deposits
  app.get("/api/deposit/history", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const deposits = await DepositService.getUserDeposits(req.session.userId, limit);
      
      res.json({
        deposits,
        count: deposits.length,
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Get deposit rate limit status
  app.get("/api/deposit/rate-status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rateCheck = await DepositService.checkDepositRateLimits(req.session.userId, "0");
      const limits = ConfigurationService.getDepositRateLimits();
      
      res.json({
        allowed: rateCheck.allowed,
        hourlyCount: rateCheck.hourlyCount,
        dailyCount: rateCheck.dailyCount,
        dailyVolume: rateCheck.dailyVolume,
        limits: {
          maxPerHour: limits.maxDepositsPerHour,
          maxPerDay: limits.maxDepositsPerDay,
          maxDailyVolume: limits.maxDailyVolume,
        },
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/meta", async (req, res) => {
    try {
      console.log("Fetching meta and asset contexts...");
      const data = await hyperliquidService.getMetaAndAssetCtxs();
      console.log("Meta data received, length:", data?.length);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/hyperliquid/meta:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/hyperliquid/candles/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const { startTime, endTime } = req.query;
      
      const data = await hyperliquidService.getCandleData(
        symbol, 
        interval,
        startTime ? parseInt(startTime as string) : undefined,
        endTime ? parseInt(endTime as string) : undefined
      );
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // TradingView UDF endpoints for Hyperliquid data
  // These endpoints allow TradingView Charting Library to use Hyperliquid as a data source
  
  // UDF config endpoint
  app.get("/api/udf/config", (req, res) => {
    res.json({
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
      supports_group_request: false,
      supports_marks: false,
      supports_search: true,
      supports_timescale_marks: false,
      supports_time: true,
      exchanges: [
        {
          value: 'HYPERLIQUID',
          name: 'Hyperliquid',
          desc: 'Hyperliquid DEX'
        }
      ],
      symbols_types: [
        {
          name: 'crypto',
          value: 'crypto'
        }
      ]
    });
  });

  // UDF symbol info endpoint
  app.get("/api/udf/symbols", async (req, res) => {
    try {
      const symbol = req.query.symbol as string;
      
      // Get asset info from Hyperliquid
      const meta = await hyperliquidService.getMeta();
      const assetInfo = meta.universe.find((asset: any) => 
        asset.name === symbol || `${asset.name}-USD` === symbol
      );

      if (!assetInfo) {
        res.status(404).json({ s: 'error', errmsg: 'Symbol not found' });
        return;
      }

      res.json({
        name: symbol,
        'exchange-traded': 'HYPERLIQUID',
        'exchange-listed': 'HYPERLIQUID',
        timezone: 'Etc/UTC',
        minmov: 1,
        minmov2: 0,
        pointvalue: 1,
        session: '24x7',
        has_intraday: true,
        has_no_volume: false,
        description: `${assetInfo.name} Perpetual`,
        type: 'crypto',
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
        pricescale: Math.pow(10, assetInfo.szDecimals),
        ticker: symbol
      });
    } catch (error) {
      console.error('Error fetching symbol info:', error);
      res.status(500).json({ s: 'error', errmsg: 'Failed to fetch symbol info' });
    }
  });

  // UDF history endpoint
  app.get("/api/udf/history", async (req, res) => {
    try {
      const symbol = (req.query.symbol as string).replace('-USD', '');
      const from = parseInt(req.query.from as string) * 1000; // Convert to milliseconds
      const to = parseInt(req.query.to as string) * 1000;
      const resolution = req.query.resolution as string;
      
      // Map TradingView resolutions to Hyperliquid intervals
      const intervalMap: { [key: string]: string } = {
        '1': '1m',
        '5': '5m',
        '15': '15m',
        '30': '30m',
        '60': '1h',
        '240': '4h',
        '1D': '1d',
        '1W': '1w'
      };
      
      const interval = intervalMap[resolution] || '1h';
      
      const candles = await hyperliquidService.getCandleData(
        symbol,
        interval,
        from,
        to
      );

      if (!candles || candles.length === 0) {
        res.json({ s: 'no_data' });
        return;
      }

      // Convert to TradingView format
      const t: number[] = [];
      const o: number[] = [];
      const h: number[] = [];
      const l: number[] = [];
      const c: number[] = [];
      const v: number[] = [];

      candles.forEach((candle: any) => {
        t.push(Math.floor(candle.timestamp / 1000)); // Convert to seconds
        o.push(parseFloat(candle.open));
        h.push(parseFloat(candle.high));
        l.push(parseFloat(candle.low));
        c.push(parseFloat(candle.close));
        v.push(parseFloat(candle.volume || 0));
      });

      res.json({
        s: 'ok',
        t,
        o,
        h,
        l,
        c,
        v
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.json({ s: 'error', errmsg: error instanceof Error ? error.message : 'Failed to fetch history' });
    }
  });

  // UDF search endpoint
  app.get("/api/udf/search", async (req, res) => {
    try {
      const query = (req.query.query as string || '').toUpperCase();
      const type = req.query.type as string;
      const exchange = req.query.exchange as string;
      const limit = parseInt(req.query.limit as string) || 30;

      const meta = await hyperliquidService.getMeta();
      const results = meta.universe
        .filter((asset: any) => {
          const symbol = asset.name;
          return symbol.includes(query);
        })
        .slice(0, limit)
        .map((asset: any) => ({
          symbol: `${asset.name}-USD`,
          full_name: `HYPERLIQUID:${asset.name}USD`,
          description: `${asset.name} Perpetual`,
          exchange: 'HYPERLIQUID',
          ticker: `${asset.name}-USD`,
          type: 'crypto'
        }));

      res.json(results);
    } catch (error) {
      console.error('Error in symbol search:', error);
      res.json([]);
    }
  });

  // UDF time endpoint
  app.get("/api/udf/time", (req, res) => {
    res.json(Math.floor(Date.now() / 1000));
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

  // Import rate limiter for verification endpoint
  const { authLimiter } = await import("./security/customRateLimiter");

  // Verify platform by code (new rotating token system)
  // Apply rate limiting middleware BEFORE any expensive operations
  app.post("/api/platforms/verify", authLimiter, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Verification code required" });
      }

      // Get client IP
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];

      // Import VerificationService
      const { VerificationService } = await import("./services/verification");

      // Check rate limit (secondary check for IP-based limiting)
      const withinLimit = await VerificationService.checkRateLimit(ipAddress);
      if (!withinLimit) {
        return res.status(429).json({ error: "Too many attempts. Please try again later." });
      }

      // Verify the platform
      const result = await VerificationService.verifyPlatform(code, ipAddress, userAgent);
      
      if (result.success) {
        res.json({
          success: true,
          platform: result.platform,
          securityHash: result.securityHash,
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error("Error verifying platform:", error);
      res.status(500).json({ error: "System error during verification" });
    }
  });

  // Get verification code for a platform (public endpoint)
  app.get("/api/platforms/:id/verification-code", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { VerificationService } = await import("./services/verification");
      
      const code = await VerificationService.getActiveCode(platformId);
      
      res.json({ code });
    } catch (error) {
      console.error("Error getting verification code:", error);
      res.json({ code: null });
    }
  });

  // Generate new verification token for a platform
  app.post("/api/admin/platforms/:platformId/generate-token", requireAdmin, async (req, res) => {
    try {
      const { platformId } = req.params;
      const { VerificationService } = await import("./services/verification");
      
      const { code, hash } = await VerificationService.generateToken(parseInt(platformId));
      
      res.json({ 
        success: true, 
        verificationCode: code,
        securityHash: hash,
        expiresIn: "24 hours"
      });
    } catch (error) {
      console.error("Error generating verification token:", error);
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

  // AI Market Chat endpoint
  app.post('/api/ai/market-chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(503).json({ 
          response: "AI assistant is currently unavailable. Please ask the administrator to configure the Perplexity API key." 
        });
      }

      const systemPrompt = `You are a cryptocurrency trading assistant for LiquidLab platform. Provide concise, accurate market analysis and trading insights. Current context: Trading ${context.market} at $${context.currentPrice}. Keep responses brief and focused on actionable information.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ 
        response: "I'm having trouble connecting to the AI service right now. Please try again later." 
      });
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

  // Admin-only: Get wallet balance
  app.get("/api/admin/wallet-balance", requireAdmin, async (req, res) => {
    try {
      if (!process.env.PAYOUT_WALLET_PRIVATE_KEY) {
        return res.json({ 
          balance: '0.00',
          error: 'Payout wallet not configured' 
        });
      }
      
      const { cryptoPayout } = await import('./services/cryptoPayout');
      const balance = await cryptoPayout.getWalletBalance();
      
      res.json({ balance });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      res.json({ 
        balance: '0.00',
        error: 'Failed to fetch balance' 
      });
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

  // Admin-only: Check payout readiness
  app.get("/api/admin/payout-readiness", requireAdmin, async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;
      const { builderFeeManager } = await import('./services/builderFeeManager');
      const readiness = await builderFeeManager.checkPayoutReadiness(period as 'weekly' | 'monthly');
      
      res.json(readiness);
    } catch (error) {
      console.error('Error checking payout readiness:', error);
      res.status(500).json({ error: 'Failed to check payout readiness' });
    }
  });

  // Admin-only: Get unclaimed fees
  app.get("/api/admin/unclaimed-fees", requireAdmin, async (req, res) => {
    try {
      const { builderFeeManager } = await import('./services/builderFeeManager');
      const unclaimed = await builderFeeManager.getUnclaimedFees();
      
      res.json({
        total: unclaimed.total,
        byPlatform: Array.from(unclaimed.byPlatform.entries()).map(([platformId, amount]) => ({
          platformId,
          amount
        }))
      });
    } catch (error) {
      console.error('Error fetching unclaimed fees:', error);
      res.status(500).json({ error: 'Failed to fetch unclaimed fees' });
    }
  });

  // Admin-only: Mark fees as claimed
  app.post("/api/admin/claim-fees", requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate, claimTxHash } = req.body;
      
      if (!startDate || !endDate || !claimTxHash) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const { builderFeeManager } = await import('./services/builderFeeManager');
      const result = await builderFeeManager.markFeesAsClaimed(
        new Date(startDate),
        new Date(endDate),
        claimTxHash
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error marking fees as claimed:', error);
      res.status(500).json({ error: 'Failed to mark fees as claimed' });
    }
  });

  // Admin-only: Transfer USDC to payout wallet
  app.post("/api/admin/transfer-to-payout", requireAdmin, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      const { builderFeeManager } = await import('./services/builderFeeManager');
      const result = await builderFeeManager.transferToPayoutWallet(amount);
      
      res.json(result);
    } catch (error) {
      console.error('Error transferring to payout wallet:', error);
      res.status(500).json({ error: 'Failed to transfer funds' });
    }
  });

  // Admin-only: Get wallet balances
  app.get("/api/admin/wallet-balances", requireAdmin, async (req, res) => {
    try {
      const { builderFeeManager } = await import('./services/builderFeeManager');
      const { cryptoPayout } = await import('./services/cryptoPayout');
      
      const [payoutBalance, hyperliquidBalance] = await Promise.all([
        builderFeeManager.getAvailableUSDC(),
        builderFeeManager.getHyperliquidBalance()
      ]);
      
      res.json({
        payoutWallet: {
          usdc: payoutBalance,
          address: process.env.PAYOUT_WALLET_ADDRESS || 'Not configured'
        },
        builderWallet: {
          hyperliquid: hyperliquidBalance,
          address: process.env.VITE_BUILDER_WALLET_ADDRESS || 'Not configured'
        }
      });
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      res.status(500).json({ error: 'Failed to fetch balances' });
    }
  });

  // Admin-only: Get pending platforms
  app.get("/api/admin/platforms/pending", requireAdmin, async (req, res) => {
    try {
      const pendingPlatforms = await storage.getPendingPlatforms();
      
      // Get user details for each platform
      const platformsWithUsers = await Promise.all(
        pendingPlatforms.map(async (platform) => {
          const user = await storage.getUser(platform.userId);
          return {
            ...platform,
            user: user ? {
              id: user.id,
              username: user.username,
              email: user.email,
            } : null,
          };
        })
      );
      
      res.json(platformsWithUsers);
    } catch (error) {
      console.error('Error fetching pending platforms:', error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Admin-only: Approve platform
  app.post("/api/admin/platforms/:platformId/approve", requireAdmin, async (req, res) => {
    try {
      const { platformId } = req.params;
      const { approvalNotes } = req.body;
      
      const platform = await storage.approvePlatform(parseInt(platformId), approvalNotes);
      const user = await storage.getUser(platform.userId);
      
      // Send approval notification
      if (user) {
        const { sendPlatformApprovedNotification } = await import('./services/notifications');
        await sendPlatformApprovedNotification(platform, user);
      }
      
      res.json({ success: true, platform });
    } catch (error) {
      console.error('Error approving platform:', error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Admin-only: Reject platform
  app.post("/api/admin/platforms/:platformId/reject", requireAdmin, async (req, res) => {
    try {
      const { platformId } = req.params;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }
      
      const platform = await storage.rejectPlatform(parseInt(platformId), rejectionReason);
      const user = await storage.getUser(platform.userId);
      
      // Send rejection notification
      if (user) {
        const { sendPlatformRejectedNotification } = await import('./services/notifications');
        await sendPlatformRejectedNotification(platform, user);
      }
      
      res.json({ success: true, platform });
    } catch (error) {
      console.error('Error rejecting platform:', error);
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

  // Trader analytics endpoints
  app.get("/api/platforms/:platformId/traders", async (req, res) => {
    try {
      const { platformId } = req.params;
      const { minVolume, sortBy } = req.query;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const options: any = {};
      if (minVolume) options.minVolume = parseFloat(minVolume as string);
      if (sortBy) options.sortBy = sortBy as 'volume' | 'fees' | 'trades';
      
      const traders = await storage.getTradersByPlatform(parseInt(platformId), options);
      res.json(traders);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/platforms/:platformId/traders/top", async (req, res) => {
    try {
      const { platformId } = req.params;
      const { limit } = req.query;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const topTraders = await storage.getTopTraders(
        parseInt(platformId),
        limit ? parseInt(limit as string) : 10
      );
      res.json(topTraders);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.get("/api/platforms/:platformId/traders/:walletAddress", async (req, res) => {
    try {
      const { platformId, walletAddress } = req.params;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const trader = await storage.getTraderActivity(parseInt(platformId), walletAddress);
      if (!trader) {
        return res.status(404).json({ error: "Trader not found" });
      }
      
      // Get trader's current tier if incentive tiers are configured
      const tier = await storage.getTraderTier(parseInt(platformId), walletAddress);
      
      res.json({
        ...trader,
        currentTier: tier || null
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Incentive tier management endpoints
  app.get("/api/platforms/:platformId/incentive-tiers", async (req, res) => {
    try {
      const { platformId } = req.params;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const tiers = await storage.getIncentiveTiers(parseInt(platformId));
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/platforms/:platformId/incentive-tiers", async (req, res) => {
    try {
      const { platformId } = req.params;
      const { name, minVolume, rewardType, rewardValue, description } = req.body;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const tier = await storage.createIncentiveTier({
        platformId: parseInt(platformId),
        name,
        minVolume,
        rewardType,
        rewardValue,
        description,
        isActive: true
      });
      
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.put("/api/platforms/:platformId/incentive-tiers/:tierId", async (req, res) => {
    try {
      const { platformId, tierId } = req.params;
      const updates = req.body;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      const tier = await storage.updateIncentiveTier(parseInt(tierId), updates);
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.delete("/api/platforms/:platformId/incentive-tiers/:tierId", async (req, res) => {
    try {
      const { platformId, tierId } = req.params;
      
      // Verify platform ownership
      const platform = await storage.getTradingPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      
      if (!req.session.userId || platform.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized access to platform data" });
      }
      
      await storage.deleteIncentiveTier(parseInt(tierId));
      res.json({ message: "Incentive tier deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Import rate limiter for file upload
  const { createRateLimiter } = await import("./security/customRateLimiter");
  
  // Create specific rate limiter for file uploads (more restrictive)
  const uploadLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 uploads per windowMs
    message: 'Too many file uploads. Please try again later.',
    standardHeaders: true,
  });

  // Logo upload endpoint with enhanced error handling and rate limiting
  app.post("/api/upload-logo", uploadLimiter, (req, res) => {
    upload.single('logo')(req, res, async (err) => {
      try {
        console.log("Upload request received");
        
        // Handle multer errors
        if (err) {
          console.error("Multer error:", err);
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
          } else if (err) {
            return res.status(400).json({ error: err.message || 'File upload failed' });
          }
        }
        
        console.log("File:", req.file);
        
        if (!req.file) {
          console.error("No file in request");
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Return the URL path to the uploaded file
        const logoUrl = `/uploads/${req.file.filename}`;
        console.log("Returning logo URL:", logoUrl);
        res.json({ url: logoUrl });
      } catch (error) {
        console.error("Error uploading logo:", error);
        res.status(500).json({ error: handleError(error) });
      }
    });
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

  // Admin platform security endpoints
  app.get("/api/admin/platforms/suspicious", requireAdmin, async (req, res) => {
    try {
      const { SecurityService } = await import("./services/security");
      const { suspiciousActivity, platformSecurity } = await import("@shared/schema");
      
      // Get all suspicious platforms
      const suspiciousReports = await db
        .select({
          activity: suspiciousActivity,
          security: platformSecurity,
          platform: tradingPlatforms,
        })
        .from(suspiciousActivity)
        .leftJoin(platformSecurity, eq(suspiciousActivity.platformId, platformSecurity.platformId))
        .leftJoin(tradingPlatforms, eq(suspiciousActivity.platformId, tradingPlatforms.id))
        .orderBy(desc(suspiciousActivity.reportedAt))
        .limit(50);
      
      res.json({ reports: suspiciousReports });
    } catch (error) {
      console.error("Error fetching suspicious platforms:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.get("/api/admin/platforms/:id/security", requireAdmin, async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { SecurityService } = await import("./services/security");
      
      const securityStatus = await SecurityService.getPlatformSecurityStatus(platformId);
      res.json(securityStatus);
    } catch (error) {
      console.error("Error fetching platform security:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.post("/api/admin/platforms/:id/review", requireAdmin, async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { reviewNotes, approve } = req.body;
      
      const { SecurityService } = await import("./services/security");
      await SecurityService.reviewPlatform(platformId, reviewNotes, approve);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reviewing platform:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.post("/api/admin/platforms/:id/suspend", requireAdmin, async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const { SecurityService } = await import("./services/security");
      await SecurityService.suspendPlatform(platformId, reason);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error suspending platform:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });
  
  app.post("/api/admin/platforms/:id/ban", requireAdmin, async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const { SecurityService } = await import("./services/security");
      await SecurityService.banPlatform(platformId, reason);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error banning platform:", error);
      res.status(500).json({ error: handleError(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}