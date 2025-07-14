import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar, date, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  builderCode: text("builder_code").unique(),
  referralCode: text("referral_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tradingPlatforms = pgTable("trading_platforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  templateId: integer("template_id"),
  config: jsonb("config").notNull(),
  isPublished: boolean("is_published").default(false),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  payoutWallet: text("payout_wallet"),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  previewImage: text("preview_image"),
  config: jsonb("config").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const revenueRecords = pgTable("revenue_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platformId: integer("platform_id"),
  type: text("type").notNull(), // 'builder_fee', 'referral_fee'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").default("USDC"),
  txHash: text("tx_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  volume: decimal("volume", { precision: 18, scale: 8 }).default("0"),
  commissionEarned: decimal("commission_earned", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Production infrastructure tables
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 64 }).notNull().unique(),
  secretHash: varchar("secret_hash", { length: 128 }).notNull(),
  name: varchar("name", { length: 100 }),
  permissions: jsonb("permissions").notNull().default('["read", "write"]'),
  rateLimit: integer("rate_limit").notNull().default(1000), // requests per hour
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
}, (table) => [
  index("idx_api_keys_platform").on(table.platformId),
  index("idx_api_keys_key").on(table.key),
]);

export const platformDomains = pgTable("platform_domains", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 64 }),
  sslEnabled: boolean("ssl_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
}, (table) => [
  index("idx_platform_domains_platform").on(table.platformId),
  index("idx_platform_domains_domain").on(table.domain),
]);

export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(), // IP or API key
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requests: integer("requests").notNull().default(1),
  windowStart: timestamp("window_start").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_rate_limits_identifier").on(table.identifier),
  index("idx_rate_limits_window").on(table.windowStart),
]);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => tradingPlatforms.id),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: varchar("resource_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_logs_platform").on(table.platformId),
  index("idx_audit_logs_user").on(table.userId),
  index("idx_audit_logs_created").on(table.createdAt),
]);

export const platformMetrics = pgTable("platform_metrics", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  pageViews: integer("page_views").notNull().default(0),
  tradingVolume: decimal("trading_volume", { precision: 20, scale: 8 }).notNull().default('0'),
  revenueGenerated: decimal("revenue_generated", { precision: 20, scale: 8 }).notNull().default('0'),
  apiCalls: integer("api_calls").notNull().default(0),
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }).notNull().default('0'),
  avgResponseTime: integer("avg_response_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_platform_metrics_platform_date").on(table.platformId, table.date),
]);

// Fee tracking for revenue distribution
export const feeTransactions = pgTable("fee_transactions", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  tradeId: varchar("trade_id", { length: 255 }).notNull(), // External trade ID from Hyperliquid
  tradeType: text("trade_type").notNull(), // 'spot' or 'perp'
  tradeVolume: decimal("trade_volume", { precision: 20, scale: 8 }).notNull(),
  feeRate: decimal("fee_rate", { precision: 10, scale: 6 }).notNull(), // 0.002 for spot, 0.001 for perp
  totalFee: decimal("total_fee", { precision: 20, scale: 8 }).notNull(),
  platformShare: decimal("platform_share", { precision: 20, scale: 8 }).notNull(), // 70% of total fee
  liquidlabShare: decimal("liquidlab_share", { precision: 20, scale: 8 }).notNull(), // 30% of total fee
  status: text("status").notNull().default("pending"), // pending, distributed, failed
  distributedAt: timestamp("distributed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_fee_platform_date").on(table.platformId, table.createdAt),
  index("idx_fee_status").on(table.status),
]);

// Platform revenue summary for easy dashboard display
export const platformRevenueSummary = pgTable("platform_revenue_summary", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'all-time'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalVolume: decimal("total_volume", { precision: 20, scale: 8 }).notNull().default('0'),
  totalFees: decimal("total_fees", { precision: 20, scale: 8 }).notNull().default('0'),
  platformEarnings: decimal("platform_earnings", { precision: 20, scale: 8 }).notNull().default('0'), // 70% share
  liquidlabEarnings: decimal("liquidlab_earnings", { precision: 20, scale: 8 }).notNull().default('0'), // 30% share
  tradeCount: integer("trade_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => [
  unique("idx_platform_period_unique").on(table.platformId, table.period, table.startDate),
]);

// MoonPay affiliate transactions
export const moonpayTransactions = pgTable("moonpay_transactions", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  transactionId: varchar("transaction_id", { length: 255 }).unique().notNull(),
  purchaseAmount: decimal("purchase_amount", { precision: 20, scale: 2 }).notNull(), // USD amount of crypto purchased
  affiliateFee: decimal("affiliate_fee", { precision: 20, scale: 4 }).notNull(), // 1% of purchase amount
  platformEarnings: decimal("platform_earnings", { precision: 20, scale: 4 }).notNull(), // 50% of affiliate fee
  liquidlabEarnings: decimal("liquidlab_earnings", { precision: 20, scale: 4 }).notNull(), // 50% of affiliate fee
  currency: varchar("currency", { length: 10 }).notNull().default('USD'),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_moonpay_platform_date").on(table.platformId, table.createdAt),
  index("idx_moonpay_status").on(table.status),
]);

// Crypto payout records
export const payoutRecords = pgTable("payout_records", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 20, scale: 4 }).notNull(), // Amount in USDC
  currency: varchar("currency", { length: 10 }).notNull().default('USDC'),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  txHash: varchar("tx_hash", { length: 66 }), // Transaction hash
  chainId: integer("chain_id").default(42161), // Arbitrum One
  recipientAddress: varchar("recipient_address", { length: 42 }).notNull(),
  error: text("error"), // Error message if failed
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_payout_platform").on(table.platformId),
  index("idx_payout_status").on(table.status),
  index("idx_payout_processed").on(table.processedAt),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  platforms: many(tradingPlatforms),
  revenueRecords: many(revenueRecords),
  referrals: many(referrals, { relationName: "referrer" }),
  referredBy: many(referrals, { relationName: "referred" }),
}));

export const tradingPlatformsRelations = relations(tradingPlatforms, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingPlatforms.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [tradingPlatforms.templateId],
    references: [templates.id],
  }),
  revenueRecords: many(revenueRecords),
  apiKeys: many(apiKeys),
  domains: many(platformDomains),
  metrics: many(platformMetrics),
  auditLogs: many(auditLogs),
  feeTransactions: many(feeTransactions),
  revenueSummaries: many(platformRevenueSummary),
  moonpayTransactions: many(moonpayTransactions),
  payoutRecords: many(payoutRecords),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  platforms: many(tradingPlatforms),
}));

export const revenueRecordsRelations = relations(revenueRecords, ({ one }) => ({
  user: one(users, {
    fields: [revenueRecords.userId],
    references: [users.id],
  }),
  platform: one(tradingPlatforms, {
    fields: [revenueRecords.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [apiKeys.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const platformDomainsRelations = relations(platformDomains, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [platformDomains.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const platformMetricsRelations = relations(platformMetrics, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [platformMetrics.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [auditLogs.platformId],
    references: [tradingPlatforms.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const feeTransactionsRelations = relations(feeTransactions, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [feeTransactions.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const platformRevenueSummaryRelations = relations(platformRevenueSummary, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [platformRevenueSummary.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const moonpayTransactionsRelations = relations(moonpayTransactions, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [moonpayTransactions.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const payoutRecordsRelations = relations(payoutRecords, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [payoutRecords.platformId],
    references: [tradingPlatforms.id],
  }),
  user: one(users, {
    fields: [payoutRecords.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradingPlatformSchema = createInsertSchema(tradingPlatforms).omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueRecordSchema = createInsertSchema(revenueRecords).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
  revokedAt: true,
});

export const insertPlatformDomainSchema = createInsertSchema(platformDomains).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformMetricSchema = createInsertSchema(platformMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertFeeTransactionSchema = createInsertSchema(feeTransactions).omit({
  id: true,
  createdAt: true,
  distributedAt: true,
});

export const insertPlatformRevenueSummarySchema = createInsertSchema(platformRevenueSummary).omit({
  id: true,
  lastUpdated: true,
});

export const insertMoonpayTransactionSchema = createInsertSchema(moonpayTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPayoutRecordSchema = createInsertSchema(payoutRecords).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TradingPlatform = typeof tradingPlatforms.$inferSelect;
export type InsertTradingPlatform = z.infer<typeof insertTradingPlatformSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type RevenueRecord = typeof revenueRecords.$inferSelect;
export type InsertRevenueRecord = z.infer<typeof insertRevenueRecordSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type PlatformDomain = typeof platformDomains.$inferSelect;
export type InsertPlatformDomain = z.infer<typeof insertPlatformDomainSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type PlatformMetric = typeof platformMetrics.$inferSelect;
export type InsertPlatformMetric = z.infer<typeof insertPlatformMetricSchema>;
export type FeeTransaction = typeof feeTransactions.$inferSelect;
export type InsertFeeTransaction = z.infer<typeof insertFeeTransactionSchema>;
export type PlatformRevenueSummary = typeof platformRevenueSummary.$inferSelect;
export type InsertPlatformRevenueSummary = z.infer<typeof insertPlatformRevenueSummarySchema>;
export type MoonpayTransaction = typeof moonpayTransactions.$inferSelect;
export type InsertMoonpayTransaction = z.infer<typeof insertMoonpayTransactionSchema>;
export type PayoutRecord = typeof payoutRecords.$inferSelect;
export type InsertPayoutRecord = z.infer<typeof insertPayoutRecordSchema>;
