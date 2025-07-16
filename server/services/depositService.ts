import { db } from "../db";
import { depositTransactions, users } from "@shared/schema";
import { eq, and, gte, sum, desc, sql } from "drizzle-orm";
import ConfigurationService from "./configService";
import { createAuditLog } from "../security/audit";
import type { InsertDepositTransaction } from "@shared/schema";

interface DepositRequest {
  userId: number;
  walletAddress: string;
  amount: string;
  bridgeAddress: string;
  tokenAddress: string;
  txHash?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DepositRateCheck {
  allowed: boolean;
  reason?: string;
  dailyCount?: number;
  hourlyCount?: number;
  dailyVolume?: string;
}

class DepositService {
  /**
   * Check rate limits for a user
   */
  static async checkDepositRateLimits(userId: number, amount: string): Promise<DepositRateCheck> {
    const limits = ConfigurationService.getDepositRateLimits();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get recent deposits
    const [hourlyDeposits, dailyDeposits] = await Promise.all([
      db
        .select({ count: count() })
        .from(depositTransactions)
        .where(
          and(
            eq(depositTransactions.userId, userId),
            gte(depositTransactions.createdAt, oneHourAgo)
          )
        ),
      db
        .select({
          count: count(),
          totalAmount: sum(depositTransactions.amount),
        })
        .from(depositTransactions)
        .where(
          and(
            eq(depositTransactions.userId, userId),
            gte(depositTransactions.createdAt, oneDayAgo)
          )
        ),
    ]);

    const hourlyCount = hourlyDeposits[0]?.count || 0;
    const dailyCount = dailyDeposits[0]?.count || 0;
    const dailyVolume = dailyDeposits[0]?.totalAmount || "0";

    // Check hourly limit
    if (hourlyCount >= limits.maxDepositsPerHour) {
      return {
        allowed: false,
        reason: `You've reached the hourly deposit limit (${limits.maxDepositsPerHour} deposits per hour)`,
        hourlyCount,
        dailyCount,
        dailyVolume,
      };
    }

    // Check daily limit
    if (dailyCount >= limits.maxDepositsPerDay) {
      return {
        allowed: false,
        reason: `You've reached the daily deposit limit (${limits.maxDepositsPerDay} deposits per day)`,
        hourlyCount,
        dailyCount,
        dailyVolume,
      };
    }

    // Check daily volume
    const totalWithNewDeposit = parseFloat(dailyVolume) + parseFloat(amount);
    if (totalWithNewDeposit > parseFloat(limits.maxDailyVolume)) {
      return {
        allowed: false,
        reason: `This deposit would exceed your daily volume limit ($${limits.maxDailyVolume} USDC)`,
        hourlyCount,
        dailyCount,
        dailyVolume,
      };
    }

    return {
      allowed: true,
      hourlyCount,
      dailyCount,
      dailyVolume,
    };
  }

  /**
   * Record a new deposit transaction
   */
  static async recordDeposit(request: DepositRequest): Promise<{ success: boolean; error?: string; depositId?: number }> {
    try {
      // Validate contract addresses
      const validation = ConfigurationService.validateDepositParams({
        amount: request.amount,
        bridgeAddress: request.bridgeAddress,
        tokenAddress: request.tokenAddress,
      });

      if (!validation.valid) {
        await createAuditLog({
          platformId: 0, // Deposit not tied to specific platform
          userId: request.userId,
          action: 'deposit_validation_failed',
          details: {
            error: validation.error,
            bridgeAddress: request.bridgeAddress,
            tokenAddress: request.tokenAddress,
          },
          ipAddress: request.ipAddress,
        });
        return { success: false, error: validation.error };
      }

      // Check rate limits
      const rateCheck = await this.checkDepositRateLimits(request.userId, request.amount);
      if (!rateCheck.allowed) {
        await createAuditLog({
          platformId: 0, // Deposit not tied to specific platform
          userId: request.userId,
          action: 'deposit_rate_limited',
          details: {
            reason: rateCheck.reason,
            hourlyCount: rateCheck.hourlyCount,
            dailyCount: rateCheck.dailyCount,
            dailyVolume: rateCheck.dailyVolume,
          },
          ipAddress: request.ipAddress,
        });
        return { success: false, error: rateCheck.reason };
      }

      // Create deposit record
      const deposit: InsertDepositTransaction = {
        userId: request.userId,
        walletAddress: request.walletAddress,
        amount: request.amount,
        currency: 'USDC',
        fromNetwork: 'arbitrum',
        toNetwork: 'hyperliquid',
        txHash: request.txHash,
        status: 'pending',
        bridgeAddress: request.bridgeAddress,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        metadata: {
          tokenAddress: request.tokenAddress,
          timestamp: new Date().toISOString(),
        },
      };

      const [result] = await db.insert(depositTransactions).values(deposit).returning();

      // Log successful deposit
      await createAuditLog({
        platformId: 0, // Deposit not tied to specific platform
        userId: request.userId,
        action: 'deposit_initiated',
        details: {
          depositId: result.id,
          amount: request.amount,
          walletAddress: request.walletAddress,
          txHash: request.txHash,
        },
        ipAddress: request.ipAddress,
      });

      return { success: true, depositId: result.id };
    } catch (error) {
      console.error('Deposit recording error:', error);
      return { success: false, error: 'Failed to record deposit' };
    }
  }

  /**
   * Get recent deposits for a user
   */
  static async getUserDeposits(userId: number, limit: number = 10) {
    return await db
      .select()
      .from(depositTransactions)
      .where(eq(depositTransactions.userId, userId))
      .orderBy(desc(depositTransactions.createdAt))
      .limit(limit);
  }

  /**
   * Update deposit status (for webhook processing)
   */
  static async updateDepositStatus(depositId: number, status: 'confirmed' | 'failed', txHash?: string) {
    const updates: any = { status };
    if (status === 'confirmed') {
      updates.confirmedAt = new Date();
    }
    if (txHash) {
      updates.txHash = txHash;
    }

    await db
      .update(depositTransactions)
      .set(updates)
      .where(eq(depositTransactions.id, depositId));

    // Log status update
    const [deposit] = await db
      .select()
      .from(depositTransactions)
      .where(eq(depositTransactions.id, depositId));

    if (deposit) {
      await createAuditLog({
        platformId: 0, // Deposit not tied to specific platform
        userId: deposit.userId,
        action: `deposit_${status}`,
        details: {
          depositId,
          amount: deposit.amount,
          txHash: deposit.txHash,
        },
      });
    }
  }

  /**
   * Get deposit statistics for monitoring
   */
  static async getDepositStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const now = new Date();
    const startTime = new Date(now);
    
    switch (timeframe) {
      case 'hour':
        startTime.setHours(now.getHours() - 1);
        break;
      case 'day':
        startTime.setDate(now.getDate() - 1);
        break;
      case 'week':
        startTime.setDate(now.getDate() - 7);
        break;
    }

    const stats = await db
      .select({
        totalDeposits: count(),
        totalVolume: sum(depositTransactions.amount),
        uniqueUsers: countDistinct(depositTransactions.userId),
        pendingCount: sql<number>`cast(sum(case when ${depositTransactions.status} = 'pending' then 1 else 0 end) as int)`,
        confirmedCount: sql<number>`cast(sum(case when ${depositTransactions.status} = 'confirmed' then 1 else 0 end) as int)`,
        failedCount: sql<number>`cast(sum(case when ${depositTransactions.status} = 'failed' then 1 else 0 end) as int)`,
      })
      .from(depositTransactions)
      .where(gte(depositTransactions.createdAt, startTime));

    return stats[0];
  }
}

import { sql } from "drizzle-orm";

// Fix for Drizzle count function
function count() {
  return sql<number>`cast(count(*) as int)`;
}

function countDistinct(column: any) {
  return sql<number>`cast(count(distinct ${column}) as int)`;
}

export default DepositService;