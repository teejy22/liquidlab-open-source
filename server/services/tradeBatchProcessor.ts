import { storage } from '../storage';
import { createAuditLog } from '../security/audit';
import { HyperliquidService } from './hyperliquid';

interface TradeData {
  platformId: number;
  tradeId: string;
  userId: string;
  market: string;
  side: 'buy' | 'sell';
  size: string;
  price: string;
  fee: string;
  builderCode?: string;
  timestamp: number;
}

export class TradeBatchProcessor {
  private hyperliquidService: HyperliquidService;
  private lastProcessedTimestamp: number;
  private isProcessing: boolean = false;

  constructor() {
    this.hyperliquidService = new HyperliquidService();
    // Start from current time, will be updated from database on first run
    this.lastProcessedTimestamp = Date.now();
  }

  /**
   * Process recent trades in batches
   * Should be called periodically (e.g., every 5-10 minutes)
   */
  async processTradeBatch(): Promise<void> {
    if (this.isProcessing) {
      console.log('Trade batch processor is already running, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log(`Starting trade batch processing from timestamp: ${this.lastProcessedTimestamp}`);

    try {
      // Get the last processed timestamp from database
      const lastProcessed = await this.getLastProcessedTimestamp();
      if (lastProcessed) {
        this.lastProcessedTimestamp = lastProcessed;
      }

      // Fetch recent trades from Hyperliquid
      const trades = await this.fetchRecentTrades();
      
      if (!trades || trades.length === 0) {
        console.log('No new trades to process');
        return;
      }

      console.log(`Found ${trades.length} trades to process`);

      // Process each trade
      let processedCount = 0;
      let errorCount = 0;

      for (const trade of trades) {
        try {
          // Only process trades with our builder code
          if (trade.builderCode === 'LIQUIDLAB2025') {
            await this.processSingleTrade(trade);
            processedCount++;
          }
        } catch (error) {
          console.error(`Error processing trade ${trade.tradeId}:`, error);
          errorCount++;
        }
      }

      // Update last processed timestamp
      if (trades.length > 0) {
        const latestTimestamp = Math.max(...trades.map(t => t.timestamp));
        await this.updateLastProcessedTimestamp(latestTimestamp);
        this.lastProcessedTimestamp = latestTimestamp;
      }

      // Log summary
      await createAuditLog({
        action: 'batch_trades_processed',
        resource: 'trade_batch_processor',
        metadata: {
          totalTrades: trades.length,
          processedCount,
          errorCount,
          lastTimestamp: this.lastProcessedTimestamp
        }
      });

      console.log(`Batch processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in trade batch processing:', error);
      await createAuditLog({
        action: 'batch_processing_error',
        resource: 'trade_batch_processor',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single trade and record fee transaction
   */
  private async processSingleTrade(trade: TradeData): Promise<void> {
    // Calculate revenue split
    const totalFee = parseFloat(trade.fee);
    const platformShare = totalFee * 0.7; // 70% to platform
    const liquidlabShare = totalFee * 0.3; // 30% to LiquidLab

    // Check if this trade has already been processed
    const existingTransaction = await storage.getFeeTransactions(trade.platformId, {
      startDate: new Date(trade.timestamp - 1000),
      endDate: new Date(trade.timestamp + 1000)
    });

    const isDuplicate = existingTransaction.some(tx => 
      tx.transactionId === trade.tradeId || 
      (tx.metadata as any)?.timestamp === trade.timestamp
    );

    if (isDuplicate) {
      console.log(`Trade ${trade.tradeId} already processed, skipping...`);
      return;
    }

    // Record the fee transaction
    await storage.recordFeeTransaction({
      platformId: trade.platformId,
      transactionId: trade.tradeId,
      userId: trade.userId,
      transactionType: 'trade',
      feeAmount: totalFee.toString(),
      platformEarnings: platformShare.toString(),
      liquidlabEarnings: liquidlabShare.toString(),
      metadata: {
        market: trade.market,
        side: trade.side,
        size: trade.size,
        price: trade.price,
        timestamp: trade.timestamp,
        processedAt: Date.now()
      },
      status: 'completed'
    });

    // Update platform revenue summary
    const period = new Date(trade.timestamp).toISOString().slice(0, 7); // YYYY-MM format
    await storage.updateRevenueSummary(trade.platformId, period);

    console.log(`Processed trade ${trade.tradeId} for platform ${trade.platformId}, fee: ${totalFee}`);
  }

  /**
   * Fetch recent trades from Hyperliquid API
   * This is a placeholder - needs to be implemented based on Hyperliquid's API
   */
  private async fetchRecentTrades(): Promise<TradeData[]> {
    // TODO: Implement actual API call to Hyperliquid to fetch trades
    // For now, return empty array
    console.warn('fetchRecentTrades not fully implemented - Hyperliquid API integration needed');
    
    // This would typically call something like:
    // const response = await this.hyperliquidService.getRecentTrades({
    //   since: this.lastProcessedTimestamp,
    //   builderCode: 'LIQUIDLAB2025'
    // });
    
    return [];
  }

  /**
   * Get the last processed timestamp from database
   */
  private async getLastProcessedTimestamp(): Promise<number | null> {
    try {
      // Get the most recent fee transaction
      const recentTransactions = await storage.getFeeTransactions(0, { 
        status: 'completed' 
      });

      if (recentTransactions.length === 0) {
        return null;
      }

      // Find the most recent timestamp from metadata
      let maxTimestamp = 0;
      for (const tx of recentTransactions) {
        const metadata = tx.metadata as any;
        if (metadata?.timestamp && metadata.timestamp > maxTimestamp) {
          maxTimestamp = metadata.timestamp;
        }
      }

      return maxTimestamp || null;
    } catch (error) {
      console.error('Error getting last processed timestamp:', error);
      return null;
    }
  }

  /**
   * Update the last processed timestamp
   */
  private async updateLastProcessedTimestamp(timestamp: number): Promise<void> {
    // Store in audit log for persistence
    await createAuditLog({
      action: 'batch_processor_checkpoint',
      resource: 'trade_batch_processor',
      metadata: {
        lastProcessedTimestamp: timestamp,
        processedAt: Date.now()
      }
    });
  }
}

// Singleton instance
export const tradeBatchProcessor = new TradeBatchProcessor();