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
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorBackupCodes: text("two_factor_backup_codes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tradingPlatforms = pgTable("trading_platforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subdomain: text("subdomain").unique(), // For centralized SaaS model: platform1.liquidlab.trade
  templateId: integer("template_id"),
  config: jsonb("config").notNull(),
  isPublished: boolean("is_published").default(false),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  payoutWallet: text("payout_wallet"),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  verificationNotes: text("verification_notes"),
  approvalStatus: text("approval_status").default("pending"), // 'pending', 'approved', 'rejected'
  approvalDate: timestamp("approval_date"),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
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
  status: text("status").notNull().default("pending"), // pending, claimed, distributed, failed
  claimedAt: timestamp("claimed_at"), // When fees were claimed from Hyperliquid
  claimTxHash: varchar("claim_tx_hash", { length: 66 }), // Hyperliquid claim transaction hash
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

// Platform verification tokens that rotate periodically
export const platformVerificationTokens = pgTable("platform_verification_tokens", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  verificationCode: varchar("verification_code", { length: 12 }).notNull().unique(), // Short code for easy typing
  securityHash: varchar("security_hash", { length: 64 }).notNull().unique(), // SHA-256 hash for cryptographic verification
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(), // Token expires after 24 hours
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_verification_code").on(table.verificationCode),
  index("idx_verification_active").on(table.isActive, table.expiresAt),
  index("idx_verification_platform").on(table.platformId),
]);

// Verification attempts for security auditing
export const verificationAttempts = pgTable("verification_attempts", {
  id: serial("id").primaryKey(),
  attemptedCode: varchar("attempted_code", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  platformId: integer("platform_id"), // Null if verification failed
  errorReason: varchar("error_reason", { length: 255 }), // 'invalid_code', 'expired', 'rate_limited'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_attempt_ip").on(table.ipAddress, table.createdAt),
  index("idx_attempt_code").on(table.attemptedCode),
]);

// Trader analytics - tracks individual trader activity per platform
export const traderActivity = pgTable("trader_activity", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(), // Trader's wallet address
  totalVolume: decimal("total_volume", { precision: 20, scale: 8 }).notNull().default('0'),
  totalFees: decimal("total_fees", { precision: 20, scale: 8 }).notNull().default('0'),
  tradeCount: integer("trade_count").notNull().default(0),
  lastTradeAt: timestamp("last_trade_at"),
  firstTradeAt: timestamp("first_trade_at"),
  averageTradeSize: decimal("average_trade_size", { precision: 20, scale: 8 }).notNull().default('0'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_trader_platform_wallet").on(table.platformId, table.walletAddress),
  index("idx_trader_volume").on(table.platformId, table.totalVolume),
  unique("idx_trader_unique").on(table.platformId, table.walletAddress),
]);

// Trader incentive tiers - configurable by platform owners
export const incentiveTiers = pgTable("incentive_tiers", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  tierName: varchar("tier_name", { length: 50 }).notNull(),
  minVolume: decimal("min_volume", { precision: 20, scale: 2 }).notNull(), // Minimum USD volume
  feeDiscount: decimal("fee_discount", { precision: 5, scale: 2 }).notNull().default('0'), // Percentage discount
  rewards: jsonb("rewards"), // Custom rewards like bonuses, badges, etc.
  color: varchar("color", { length: 7 }).default('#1dd1a1'), // Hex color for UI
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tier_platform").on(table.platformId),
  index("idx_tier_volume").on(table.platformId, table.minVolume),
]);

// Platform security monitoring
export const platformSecurity = pgTable("platform_security", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").notNull().references(() => tradingPlatforms.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, banned, under-review
  suspendedAt: timestamp("suspended_at"),
  suspendedReason: text("suspended_reason"),
  bannedAt: timestamp("banned_at"),
  bannedReason: text("banned_reason"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  reviewNotes: text("review_notes"),
  riskScore: integer("risk_score").default(0), // 0-100, higher = more suspicious
  flaggedContent: jsonb("flagged_content"), // Store suspicious URLs, scripts, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("idx_platform_security_unique").on(table.platformId),
  index("idx_platform_security_status").on(table.status),
]);

// Suspicious activity logs
export const suspiciousActivity = pgTable("suspicious_activity", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => tradingPlatforms.id),
  userId: integer("user_id").references(() => users.id),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // rapid_verification_attempts, suspicious_links, content_violation, etc.
  description: text("description").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // low, medium, high, critical
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_suspicious_activity_platform").on(table.platformId),
  index("idx_suspicious_activity_type").on(table.activityType),
  index("idx_suspicious_activity_severity").on(table.severity),
]);

// Deposit transactions tracking
export const depositTransactions = pgTable("deposit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 6 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default('USDC'),
  fromNetwork: varchar("from_network", { length: 50 }).notNull().default('arbitrum'),
  toNetwork: varchar("to_network", { length: 50 }).notNull().default('hyperliquid'),
  txHash: varchar("tx_hash", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default('pending'), // pending, confirmed, failed
  bridgeAddress: varchar("bridge_address", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
}, (table) => [
  index("idx_deposit_user").on(table.userId),
  index("idx_deposit_wallet").on(table.walletAddress),
  index("idx_deposit_status").on(table.status),
  index("idx_deposit_created").on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  platforms: many(tradingPlatforms),
  revenueRecords: many(revenueRecords),
  referrals: many(referrals, { relationName: "referrer" }),
  referredBy: many(referrals, { relationName: "referred" }),
  depositTransactions: many(depositTransactions),
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
  verificationTokens: many(platformVerificationTokens),
  verificationAttempts: many(verificationAttempts),
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

export const platformVerificationTokensRelations = relations(platformVerificationTokens, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [platformVerificationTokens.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const verificationAttemptsRelations = relations(verificationAttempts, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [verificationAttempts.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const depositTransactionsRelations = relations(depositTransactions, ({ one }) => ({
  user: one(users, {
    fields: [depositTransactions.userId],
    references: [users.id],
  }),
}));

export const traderActivityRelations = relations(traderActivity, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [traderActivity.platformId],
    references: [tradingPlatforms.id],
  }),
}));

export const incentiveTiersRelations = relations(incentiveTiers, ({ one }) => ({
  platform: one(tradingPlatforms, {
    fields: [incentiveTiers.platformId],
    references: [tradingPlatforms.id],
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

export const insertPlatformVerificationTokenSchema = createInsertSchema(platformVerificationTokens).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationAttemptSchema = createInsertSchema(verificationAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertDepositTransactionSchema = createInsertSchema(depositTransactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertTraderActivitySchema = createInsertSchema(traderActivity).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncentiveTierSchema = createInsertSchema(incentiveTiers).omit({
  id: true,
  createdAt: true,
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
export type PlatformVerificationToken = typeof platformVerificationTokens.$inferSelect;
export type InsertPlatformVerificationToken = z.infer<typeof insertPlatformVerificationTokenSchema>;
export type VerificationAttempt = typeof verificationAttempts.$inferSelect;
export type InsertVerificationAttempt = z.infer<typeof insertVerificationAttemptSchema>;
export type DepositTransaction = typeof depositTransactions.$inferSelect;
export type InsertDepositTransaction = z.infer<typeof insertDepositTransactionSchema>;
export type TraderActivity = typeof traderActivity.$inferSelect;
export type InsertTraderActivity = z.infer<typeof insertTraderActivitySchema>;
export type IncentiveTier = typeof incentiveTiers.$inferSelect;
export type InsertIncentiveTier = z.infer<typeof insertIncentiveTierSchema>;
