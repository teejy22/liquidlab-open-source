import { ethers } from 'ethers';
import { db } from '../db';
import { tradingPlatforms, platformRevenueSummary, payoutRecords } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// Payout configuration
const PAYOUT_CONFIG = {
  // Use USDC on Arbitrum for low fees
  chainId: 42161, // Arbitrum One
  rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
  minPayoutAmount: '10', // $10 minimum payout
  gasLimit: 100000,
};

export class CryptoPayoutService {
  private provider: ethers.Provider;
  private payoutWallet?: ethers.Wallet;
  private usdcContract?: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(PAYOUT_CONFIG.rpcUrl);
    
    // Initialize payout wallet if private key is provided
    if (process.env.PAYOUT_WALLET_PRIVATE_KEY) {
      this.payoutWallet = new ethers.Wallet(process.env.PAYOUT_WALLET_PRIVATE_KEY, this.provider);
      
      // Initialize USDC contract
      const usdcAbi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      this.usdcContract = new ethers.Contract(PAYOUT_CONFIG.usdcAddress, usdcAbi, this.payoutWallet);
    }
  }

  /**
   * Process payouts for all eligible platforms
   */
  async processPayouts(period: 'weekly' | 'monthly' = 'weekly'): Promise<void> {
    if (!this.payoutWallet || !this.usdcContract) {
      console.error('Payout wallet not configured');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get all platforms with revenue in the period
    const platformsWithRevenue = await db
      .select({
        summary: platformRevenueSummary,
        platform: tradingPlatforms,
      })
      .from(platformRevenueSummary)
      .innerJoin(tradingPlatforms, eq(platformRevenueSummary.platformId, tradingPlatforms.id))
      .where(
        and(
          gte(platformRevenueSummary.periodEnd, startDate),
          sql`${platformRevenueSummary.totalRevenue} > 0`
        )
      );

    console.log(`Processing payouts for ${platformsWithRevenue.length} platforms`);

    for (const { summary, platform } of platformsWithRevenue) {
      if (!platform.payoutWallet) {
        console.log(`Platform ${platform.id} has no payout wallet configured`);
        continue;
      }

      await this.processPlatformPayout(
        platform.id,
        platform.userId,
        platform.payoutWallet,
        summary.totalRevenue,
        startDate,
        endDate
      );
    }
  }

  /**
   * Process payout for a single platform
   */
  async processPlatformPayout(
    platformId: number,
    userId: number,
    payoutAddress: string,
    totalRevenue: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    try {
      // Validate address
      if (!ethers.isAddress(payoutAddress)) {
        console.error(`Invalid payout address for platform ${platformId}: ${payoutAddress}`);
        return;
      }

      // Calculate platform owner's share (70%)
      const revenueAmount = parseFloat(totalRevenue);
      const platformOwnerShare = revenueAmount * 0.7;

      // Check minimum payout
      if (platformOwnerShare < parseFloat(PAYOUT_CONFIG.minPayoutAmount)) {
        console.log(`Platform ${platformId} revenue below minimum: $${platformOwnerShare.toFixed(2)}`);
        return;
      }

      // Convert to USDC amount (6 decimals)
      const usdcAmount = ethers.parseUnits(platformOwnerShare.toFixed(2), 6);

      // Check USDC balance
      const balance = await this.usdcContract!.balanceOf(this.payoutWallet!.address);
      if (balance < usdcAmount) {
        console.error('Insufficient USDC balance for payouts');
        return;
      }

      // Send USDC
      console.log(`Sending $${platformOwnerShare.toFixed(2)} USDC to ${payoutAddress}`);
      const tx = await this.usdcContract!.transfer(payoutAddress, usdcAmount, {
        gasLimit: PAYOUT_CONFIG.gasLimit,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Record successful payout
      await db.insert(payoutRecords).values({
        platformId,
        userId,
        amount: platformOwnerShare.toFixed(2),
        currency: 'USDC',
        status: 'completed',
        txHash: receipt.hash,
        chainId: PAYOUT_CONFIG.chainId,
        recipientAddress: payoutAddress,
        periodStart: startDate,
        periodEnd: endDate,
        processedAt: new Date(),
      });

      console.log(`Payout completed for platform ${platformId}: ${receipt.hash}`);
    } catch (error) {
      console.error(`Error processing payout for platform ${platformId}:`, error);
      
      // Record failed payout
      await db.insert(payoutRecords).values({
        platformId,
        userId,
        amount: platformOwnerShare.toFixed(2),
        currency: 'USDC',
        status: 'failed',
        error: error.message,
        recipientAddress: payoutAddress,
        periodStart: startDate,
        periodEnd: endDate,
        processedAt: new Date(),
      });
    }
  }

  /**
   * Check pending payouts for a platform
   */
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

  /**
   * Get payout history for a platform
   */
  async getPayoutHistory(platformId: number): Promise<any[]> {
    return await db
      .select()
      .from(payoutRecords)
      .where(eq(payoutRecords.platformId, platformId))
      .orderBy(sql`${payoutRecords.processedAt} DESC`);
  }

  /**
   * Verify a payout transaction on-chain
   */
  async verifyPayout(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      console.error('Error verifying payout:', error);
      return false;
    }
  }
}

export const cryptoPayout = new CryptoPayoutService();