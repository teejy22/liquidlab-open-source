import { 
  users, 
  tradingPlatforms, 
  templates, 
  revenueRecords, 
  referrals,
  feeTransactions,
  platformRevenueSummary,
  moonpayTransactions,
  payoutRecords,
  type User, 
  type InsertUser,
  type TradingPlatform,
  type InsertTradingPlatform,
  type Template,
  type InsertTemplate,
  type RevenueRecord,
  type InsertRevenueRecord,
  type Referral,
  type InsertReferral,
  type FeeTransaction,
  type InsertFeeTransaction,
  type PlatformRevenueSummary,
  type MoonpayTransaction,
  type InsertMoonpayTransaction,
  type PayoutRecord,
  type InsertPayoutRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserWallet(userId: number, walletAddress: string): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | undefined>;
  
  // Trading platforms
  getTradingPlatforms(userId?: string): Promise<TradingPlatform[]>;
  getTradingPlatform(id: number): Promise<TradingPlatform | undefined>;
  createTradingPlatform(platform: InsertTradingPlatform): Promise<TradingPlatform>;
  updateTradingPlatform(id: number, updates: Partial<TradingPlatform>): Promise<TradingPlatform>;
  deleteTradingPlatform(id: number): Promise<void>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Revenue tracking
  getRevenueRecords(userId: number, period: string): Promise<RevenueRecord[]>;
  createRevenueRecord(record: InsertRevenueRecord): Promise<RevenueRecord>;
  
  // Builder codes
  generateBuilderCode(userId: number): Promise<string>;
  validateBuilderCode(code: string): Promise<boolean>;
  
  // Analytics
  getDashboardAnalytics(userId: number): Promise<any>;
  
  // Referrals
  createReferral(referrerId: number, referredUserId: number): Promise<Referral>;
  getReferrals(userId: number): Promise<Referral[]>;
  
  // Fee tracking
  recordFeeTransaction(transaction: InsertFeeTransaction): Promise<FeeTransaction>;
  getFeeTransactions(platformId: number, options?: { status?: string; startDate?: Date; endDate?: Date }): Promise<FeeTransaction[]>;
  updateFeeTransactionStatus(transactionId: number, status: string, distributedAt?: Date): Promise<void>;
  
  // Revenue summaries
  updateRevenueSummary(platformId: number, period: string): Promise<void>;
  getRevenueSummary(platformId: number, period: string): Promise<PlatformRevenueSummary | undefined>;
  getAllPlatformRevenues(options?: { period?: string; minRevenue?: number }): Promise<PlatformRevenueSummary[]>;
  
  // MoonPay transactions
  recordMoonpayTransaction(transaction: InsertMoonpayTransaction): Promise<MoonpayTransaction>;
  getMoonpayTransactions(platformId: number, options?: { status?: string; startDate?: Date; endDate?: Date }): Promise<MoonpayTransaction[]>;
  getAllMoonpayTransactions(options?: { status?: string; startDate?: Date; endDate?: Date }): Promise<MoonpayTransaction[]>;
  updateMoonpayTransactionStatus(transactionId: number, status: string, completedAt?: Date): Promise<void>;
  getMoonpayRevenueSummary(platformId?: number): Promise<{ totalPurchases: string; totalAffiliateFees: string; platformEarnings: string; liquidlabEarnings: string }>;
  
  // Crypto payouts
  recordPayout(payout: InsertPayoutRecord): Promise<PayoutRecord>;
  getPayouts(platformId: number, options?: { status?: string; startDate?: Date; endDate?: Date }): Promise<PayoutRecord[]>;
  updatePayoutStatus(payoutId: number, status: string, txHash?: string): Promise<void>;
  getPendingPayouts(platformId: number): Promise<{ amount: string; period: string }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.email, email), eq(users.password, password))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        builderCode: this.generateRandomCode('BLD'),
        referralCode: this.generateRandomCode('REF')
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserWallet(userId: number, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getTradingPlatforms(userId?: string): Promise<TradingPlatform[]> {
    if (userId) {
      return await db.select().from(tradingPlatforms).where(eq(tradingPlatforms.userId, parseInt(userId)));
    }
    return await db.select().from(tradingPlatforms);
  }

  async getTradingPlatform(id: number): Promise<TradingPlatform | undefined> {
    const [platform] = await db.select().from(tradingPlatforms).where(eq(tradingPlatforms.id, id));
    return platform || undefined;
  }

  async createTradingPlatform(platform: InsertTradingPlatform): Promise<TradingPlatform> {
    let baseSlug = this.generateSlug(platform.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug already exists and append number if needed
    while (true) {
      const existing = await db.select().from(tradingPlatforms).where(eq(tradingPlatforms.slug, slug));
      if (existing.length === 0) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const [created] = await db
      .insert(tradingPlatforms)
      .values({
        ...platform,
        slug
      })
      .returning();
    return created;
  }

  async updateTradingPlatform(id: number, updates: Partial<TradingPlatform>): Promise<TradingPlatform> {
    const [platform] = await db
      .update(tradingPlatforms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tradingPlatforms.id, id))
      .returning();
    return platform;
  }

  async deleteTradingPlatform(id: number): Promise<void> {
    await db.delete(tradingPlatforms).where(eq(tradingPlatforms.id, id));
  }

  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isPublic, true));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db
      .insert(templates)
      .values(template)
      .returning();
    return created;
  }

  async getRevenueRecords(userId: number, period: string): Promise<RevenueRecord[]> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return await db
      .select()
      .from(revenueRecords)
      .where(
        and(
          eq(revenueRecords.userId, userId),
          gte(revenueRecords.createdAt, startDate)
        )
      )
      .orderBy(desc(revenueRecords.createdAt));
  }

  async createRevenueRecord(record: InsertRevenueRecord): Promise<RevenueRecord> {
    const [created] = await db
      .insert(revenueRecords)
      .values(record)
      .returning();
    return created;
  }

  async generateBuilderCode(userId: number): Promise<string> {
    const code = this.generateRandomCode('BLD');
    await this.updateUser(userId, { builderCode: code });
    return code;
  }

  async validateBuilderCode(code: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.builderCode, code));
    return !!user;
  }

  async getDashboardAnalytics(userId: number): Promise<any> {
    const revenues = await this.getRevenueRecords(userId, '30d');
    const platforms = await this.getTradingPlatforms(userId.toString());
    
    const totalRevenue = revenues.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const dailyRevenue = revenues
      .filter(r => r.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000))
      .reduce((sum, record) => sum + parseFloat(record.amount), 0);
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      dailyRevenue: dailyRevenue.toFixed(2),
      activeUsers: Math.floor(totalRevenue / 10), // Rough estimate
      totalVolume: (totalRevenue * 100).toFixed(2), // Rough estimate
      platforms: platforms.map(p => ({
        name: p.name,
        revenue: (Math.random() * 1000).toFixed(2),
        change: (Math.random() * 20 - 10).toFixed(1)
      }))
    };
  }

  async createReferral(referrerId: number, referredUserId: number): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId,
        referredUserId
      })
      .returning();
    return referral;
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  // Fee tracking implementation
  async recordFeeTransaction(transaction: InsertFeeTransaction): Promise<FeeTransaction> {
    const [feeTransaction] = await db
      .insert(feeTransactions)
      .values(transaction)
      .returning();
    
    // Update revenue summary after recording transaction
    await this.updateRevenueSummary(transaction.platformId, 'daily');
    await this.updateRevenueSummary(transaction.platformId, 'weekly');
    await this.updateRevenueSummary(transaction.platformId, 'monthly');
    await this.updateRevenueSummary(transaction.platformId, 'all-time');
    
    return feeTransaction;
  }

  async getFeeTransactions(
    platformId: number, 
    options?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<FeeTransaction[]> {
    const conditions = [eq(feeTransactions.platformId, platformId)];
    
    if (options?.status) {
      conditions.push(eq(feeTransactions.status, options.status));
    }
    
    if (options?.startDate) {
      conditions.push(gte(feeTransactions.createdAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(feeTransactions.createdAt, options.endDate));
    }
    
    return await db
      .select()
      .from(feeTransactions)
      .where(and(...conditions))
      .orderBy(desc(feeTransactions.createdAt));
  }

  async updateFeeTransactionStatus(
    transactionId: number, 
    status: string, 
    distributedAt?: Date
  ): Promise<void> {
    await db
      .update(feeTransactions)
      .set({ 
        status, 
        distributedAt: distributedAt || new Date() 
      })
      .where(eq(feeTransactions.id, transactionId));
  }

  async updateRevenueSummary(platformId: number, period: string): Promise<void> {
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all-time':
        startDate = new Date('2024-01-01');
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }
    
    // Get all transactions for the period
    const transactions = await this.getFeeTransactions(platformId, { startDate, endDate });
    
    // Calculate totals
    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.tradeVolume), 0);
    const totalFees = transactions.reduce((sum, tx) => sum + parseFloat(tx.totalFee), 0);
    const platformEarnings = transactions.reduce((sum, tx) => sum + parseFloat(tx.platformShare), 0);
    const liquidlabEarnings = transactions.reduce((sum, tx) => sum + parseFloat(tx.liquidlabShare), 0);
    
    // Upsert the summary
    await db
      .insert(platformRevenueSummary)
      .values({
        platformId,
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalVolume: totalVolume.toFixed(8),
        totalFees: totalFees.toFixed(8),
        platformEarnings: platformEarnings.toFixed(8),
        liquidlabEarnings: liquidlabEarnings.toFixed(8),
        tradeCount: transactions.length,
      })
      .onConflictDoUpdate({
        target: [platformRevenueSummary.platformId, platformRevenueSummary.period, platformRevenueSummary.startDate],
        set: {
          endDate: endDate.toISOString().split('T')[0],
          totalVolume: totalVolume.toFixed(8),
          totalFees: totalFees.toFixed(8),
          platformEarnings: platformEarnings.toFixed(8),
          liquidlabEarnings: liquidlabEarnings.toFixed(8),
          tradeCount: transactions.length,
          lastUpdated: new Date(),
        },
      });
  }

  async getRevenueSummary(
    platformId: number, 
    period: string
  ): Promise<PlatformRevenueSummary | undefined> {
    const [summary] = await db
      .select()
      .from(platformRevenueSummary)
      .where(
        and(
          eq(platformRevenueSummary.platformId, platformId),
          eq(platformRevenueSummary.period, period)
        )
      )
      .orderBy(desc(platformRevenueSummary.startDate))
      .limit(1);
    
    return summary;
  }

  async getAllPlatformRevenues(
    options?: { period?: string; minRevenue?: number }
  ): Promise<PlatformRevenueSummary[]> {
    const query = options?.period
      ? db.select().from(platformRevenueSummary).where(eq(platformRevenueSummary.period, options.period))
      : db.select().from(platformRevenueSummary);
    
    const results = await query.orderBy(desc(platformRevenueSummary.platformEarnings));
    
    if (options?.minRevenue !== undefined) {
      const minRev = options.minRevenue;
      return results.filter(r => parseFloat(r.platformEarnings) >= minRev);
    }
    
    return results;
  }

  // MoonPay transactions
  async recordMoonpayTransaction(transaction: InsertMoonpayTransaction): Promise<MoonpayTransaction> {
    const [result] = await db
      .insert(moonpayTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  async getMoonpayTransactions(
    platformId: number, 
    options?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<MoonpayTransaction[]> {
    const conditions = [eq(moonpayTransactions.platformId, platformId)];
    
    if (options?.status) {
      conditions.push(eq(moonpayTransactions.status, options.status));
    }
    
    if (options?.startDate) {
      conditions.push(gte(moonpayTransactions.createdAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(moonpayTransactions.createdAt, options.endDate));
    }
    
    return await db
      .select()
      .from(moonpayTransactions)
      .where(and(...conditions))
      .orderBy(desc(moonpayTransactions.createdAt));
  }

  async getAllMoonpayTransactions(
    options?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<MoonpayTransaction[]> {
    const conditions = [];
    
    if (options?.status) {
      conditions.push(eq(moonpayTransactions.status, options.status));
    }
    
    if (options?.startDate) {
      conditions.push(gte(moonpayTransactions.createdAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(moonpayTransactions.createdAt, options.endDate));
    }
    
    const query = conditions.length > 0
      ? db.select().from(moonpayTransactions).where(and(...conditions))
      : db.select().from(moonpayTransactions);
    
    return await query.orderBy(desc(moonpayTransactions.createdAt));
  }

  async updateMoonpayTransactionStatus(
    transactionId: number, 
    status: string, 
    completedAt?: Date
  ): Promise<void> {
    await db
      .update(moonpayTransactions)
      .set({ 
        status, 
        completedAt,
      })
      .where(eq(moonpayTransactions.id, transactionId));
  }

  async getMoonpayRevenueSummary(platformId?: number): Promise<{ 
    totalPurchases: string; 
    totalAffiliateFees: string; 
    platformEarnings: string; 
    liquidlabEarnings: string 
  }> {
    const conditions = [eq(moonpayTransactions.status, 'completed')];
    
    if (platformId) {
      conditions.push(eq(moonpayTransactions.platformId, platformId));
    }
    
    const transactions = await db
      .select()
      .from(moonpayTransactions)
      .where(and(...conditions));
    
    const summary = transactions.reduce((acc, tx) => ({
      totalPurchases: (parseFloat(acc.totalPurchases) + parseFloat(tx.purchaseAmount)).toFixed(2),
      totalAffiliateFees: (parseFloat(acc.totalAffiliateFees) + parseFloat(tx.affiliateFee)).toFixed(4),
      platformEarnings: (parseFloat(acc.platformEarnings) + parseFloat(tx.platformEarnings)).toFixed(4),
      liquidlabEarnings: (parseFloat(acc.liquidlabEarnings) + parseFloat(tx.liquidlabEarnings)).toFixed(4),
    }), {
      totalPurchases: '0.00',
      totalAffiliateFees: '0.00',
      platformEarnings: '0.00',
      liquidlabEarnings: '0.00',
    });
    
    return summary;
  }

  async recordPayout(payout: InsertPayoutRecord): Promise<PayoutRecord> {
    const [record] = await db
      .insert(payoutRecords)
      .values(payout)
      .returning();
    return record;
  }

  async getPayouts(
    platformId: number, 
    options?: { status?: string; startDate?: Date; endDate?: Date }
  ): Promise<PayoutRecord[]> {
    let query = db
      .select()
      .from(payoutRecords)
      .where(eq(payoutRecords.platformId, platformId));

    if (options?.status) {
      query = query.where(eq(payoutRecords.status, options.status));
    }

    if (options?.startDate) {
      query = query.where(gte(payoutRecords.periodStart, options.startDate));
    }

    if (options?.endDate) {
      query = query.where(lte(payoutRecords.periodEnd, options.endDate));
    }

    return await query.orderBy(desc(payoutRecords.processedAt));
  }

  async updatePayoutStatus(payoutId: number, status: string, txHash?: string): Promise<void> {
    const updates: any = { status };
    if (txHash) {
      updates.txHash = txHash;
    }
    if (status === 'completed') {
      updates.processedAt = new Date();
    }

    await db
      .update(payoutRecords)
      .set(updates)
      .where(eq(payoutRecords.id, payoutId));
  }

  async getPendingPayouts(platformId: number): Promise<{ amount: string; period: string }[]> {
    const summaries = await db
      .select()
      .from(platformRevenueSummary)
      .where(
        and(
          eq(platformRevenueSummary.platformId, platformId),
          sql`${platformRevenueSummary.totalRevenue} > 0`
        )
      );

    const payouts = await db
      .select()
      .from(payoutRecords)
      .where(eq(payoutRecords.platformId, platformId));

    const paidPeriods = new Set(
      payouts.map(p => `${p.periodStart.toISOString()}-${p.periodEnd.toISOString()}`)
    );

    return summaries
      .filter(s => !paidPeriods.has(`${s.periodStart.toISOString()}-${s.periodEnd.toISOString()}`))
      .map(s => ({
        amount: (parseFloat(s.totalRevenue) * 0.7).toFixed(2),
        period: s.period,
      }));
  }

  private generateRandomCode(prefix: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}

export const storage = new DatabaseStorage();
