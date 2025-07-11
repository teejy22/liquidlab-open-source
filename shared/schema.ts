import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username"),
  email: text("email"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradingPlatformSchema = createInsertSchema(tradingPlatforms).omit({
  id: true,
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
