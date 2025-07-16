import { db } from '../db';
import { feeTransactions, platformRevenueSummary } from '@shared/schema';
import { eq, and, sql, isNull, gte, lte } from 'drizzle-orm';
import * as ethers from 'ethers';

export interface PayoutReadiness {
  unclaimedFees: string;
  claimedNotConverted: string;
  availableForPayout: string;
  requiredForPayouts: string;
  readyToPayout: boolean;
  details: {
    platformId: number;
    unclaimedAmount: string;
    requiredAmount: string;
  }[];
}

export class BuilderFeeManager {
  private provider: ethers.Provider;
  private builderWallet?: ethers.Wallet;
  private payoutWallet?: ethers.Wallet;
  private usdcContract?: ethers.Contract;
  
  constructor() {
    // Initialize provider for Arbitrum
    this.provider = new ethers.JsonRpcProvider(
      process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc'
    );
    
    // Initialize wallets if private keys are provided
    if (process.env.BUILDER_WALLET_PRIVATE_KEY) {
      this.builderWallet = new ethers.Wallet(
        process.env.BUILDER_WALLET_PRIVATE_KEY, 
        this.provider
      );
    }
    
    if (process.env.PAYOUT_WALLET_PRIVATE_KEY) {
      this.payoutWallet = new ethers.Wallet(
        process.env.PAYOUT_WALLET_PRIVATE_KEY,
        this.provider
      );
      
      // Initialize USDC contract
      const usdcAbi = [
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function transfer(address to, uint256 amount) returns (bool)',
      ];
      const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // USDC on Arbitrum
      this.usdcContract = new ethers.Contract(usdcAddress, usdcAbi, this.provider);
    }
  }

  /**
   * Get unclaimed fees from database
   */
  async getUnclaimedFees(): Promise<{ total: string; byPlatform: Map<number, string> }> {
    const unclaimed = await db
      .select({
        platformId: feeTransactions.platformId,
        totalFees: sql<string>`SUM(${feeTransactions.totalFee})`,
      })
      .from(feeTransactions)
      .where(
        and(
          eq(feeTransactions.status, 'pending'),
          isNull(feeTransactions.claimedAt)
        )
      )
      .groupBy(feeTransactions.platformId);
    
    const byPlatform = new Map<number, string>();
    let total = 0;
    
    for (const fee of unclaimed) {
      byPlatform.set(fee.platformId, fee.totalFees);
      total += parseFloat(fee.totalFees);
    }
    
    return {
      total: total.toFixed(4),
      byPlatform,
    };
  }

  /**
   * Get claimed but not yet distributed fees
   */
  async getClaimedNotDistributed(): Promise<{ total: string; byPlatform: Map<number, string> }> {
    const claimed = await db
      .select({
        platformId: feeTransactions.platformId,
        totalFees: sql<string>`SUM(${feeTransactions.totalFee})`,
      })
      .from(feeTransactions)
      .where(
        and(
          eq(feeTransactions.status, 'claimed'),
          isNull(feeTransactions.distributedAt)
        )
      )
      .groupBy(feeTransactions.platformId);
    
    const byPlatform = new Map<number, string>();
    let total = 0;
    
    for (const fee of claimed) {
      byPlatform.set(fee.platformId, fee.totalFees);
      total += parseFloat(fee.totalFees);
    }
    
    return {
      total: total.toFixed(4),
      byPlatform,
    };
  }

  /**
   * Get available USDC balance in payout wallet
   */
  async getAvailableUSDC(): Promise<string> {
    if (!this.payoutWallet || !this.usdcContract) {
      return '0';
    }
    
    try {
      const balance = await this.usdcContract.balanceOf(this.payoutWallet.address);
      // USDC has 6 decimals
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      return '0';
    }
  }

  /**
   * Calculate required payouts for a given period
   */
  async getRequiredPayouts(period: 'weekly' | 'monthly' = 'weekly'): Promise<string> {
    // Get date range based on period
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get all platform revenue summaries for the period
    const summaries = await db
      .select({
        platformId: platformRevenueSummary.platformId,
        totalRevenue: platformRevenueSummary.totalRevenue,
      })
      .from(platformRevenueSummary)
      .where(
        and(
          eq(platformRevenueSummary.period, period),
          gte(platformRevenueSummary.periodEnd, startDate)
        )
      );
    
    let totalRequired = 0;
    
    for (const summary of summaries) {
      // Platform gets 70% of trading fees
      const tradingShare = parseFloat(summary.totalRevenue) * 0.7;
      
      // Add MoonPay earnings (would need to fetch separately)
      // For now, just using trading fees
      totalRequired += tradingShare;
    }
    
    return totalRequired.toFixed(2);
  }

  /**
   * Check payout readiness and return detailed status
   */
  async checkPayoutReadiness(period: 'weekly' | 'monthly' = 'weekly'): Promise<PayoutReadiness> {
    const [unclaimed, claimed, availableUSDC, requiredPayouts] = await Promise.all([
      this.getUnclaimedFees(),
      this.getClaimedNotDistributed(),
      this.getAvailableUSDC(),
      this.getRequiredPayouts(period),
    ]);
    
    const readyToPayout = parseFloat(availableUSDC) >= parseFloat(requiredPayouts);
    
    // Get platform-specific details
    const details: PayoutReadiness['details'] = [];
    
    for (const [platformId, unclaimedAmount] of unclaimed.byPlatform) {
      const platformRequired = (parseFloat(unclaimedAmount) * 0.7).toFixed(2);
      details.push({
        platformId,
        unclaimedAmount,
        requiredAmount: platformRequired,
      });
    }
    
    return {
      unclaimedFees: unclaimed.total,
      claimedNotConverted: claimed.total,
      availableForPayout: availableUSDC,
      requiredForPayouts: requiredPayouts,
      readyToPayout,
      details,
    };
  }

  /**
   * Mark fees as claimed (manual process completed)
   */
  async markFeesAsClaimed(
    startDate: Date,
    endDate: Date,
    claimTxHash: string
  ): Promise<{ success: boolean; feesUpdated: number }> {
    try {
      const result = await db
        .update(feeTransactions)
        .set({
          status: 'claimed',
          claimedAt: new Date(),
          claimTxHash,
        })
        .where(
          and(
            eq(feeTransactions.status, 'pending'),
            gte(feeTransactions.createdAt, startDate),
            lte(feeTransactions.createdAt, endDate)
          )
        );
      
      return {
        success: true,
        feesUpdated: result.rowCount || 0,
      };
    } catch (error) {
      console.error('Error marking fees as claimed:', error);
      return {
        success: false,
        feesUpdated: 0,
      };
    }
  }

  /**
   * Get Hyperliquid builder wallet balance (for display purposes)
   * Note: This would need Hyperliquid API integration
   */
  async getHyperliquidBalance(): Promise<string> {
    // Placeholder - would need to query Hyperliquid API
    // For now, return a mock value in development
    if (process.env.NODE_ENV === 'development') {
      return '1234.56';
    }
    return '0.00';
  }

  /**
   * Transfer USDC from builder wallet to payout wallet
   * This happens after claiming from Hyperliquid and converting to USDC
   */
  async transferToPayoutWallet(amount: string): Promise<{ 
    success: boolean; 
    txHash?: string; 
    error?: string 
  }> {
    if (!this.builderWallet || !this.payoutWallet || !this.usdcContract) {
      return {
        success: false,
        error: 'Wallets not configured',
      };
    }
    
    try {
      // Convert amount to USDC units (6 decimals)
      const usdcAmount = ethers.parseUnits(amount, 6);
      
      // Check balance
      const balance = await this.usdcContract.balanceOf(this.builderWallet.address);
      if (balance < usdcAmount) {
        return {
          success: false,
          error: 'Insufficient USDC balance in builder wallet',
        };
      }
      
      // Connect contract to builder wallet for sending
      const contractWithSigner = this.usdcContract.connect(this.builderWallet);
      
      // Send USDC to payout wallet
      const tx = await contractWithSigner.transfer(
        this.payoutWallet.address,
        usdcAmount
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error transferring USDC:', error);
      return {
        success: false,
        error: error.message || 'Transfer failed',
      };
    }
  }
}

export const builderFeeManager = new BuilderFeeManager();