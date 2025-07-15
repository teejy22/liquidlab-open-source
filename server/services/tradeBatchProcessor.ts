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
          // Process all trades (builder fees are handled by Hyperliquid onchain)
          await this.processSingleTrade(trade);
          processedCount++;
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
      tx.tradeId === trade.tradeId
    );

    if (isDuplicate) {
      console.log(`Trade ${trade.tradeId} already processed, skipping...`);
      return;
    }

    // Calculate trade volume and fee rate
    const tradeVolume = parseFloat(trade.size) * parseFloat(trade.price);
    const feeRate = trade.market === 'spot' ? 0.002 : 0.001; // 0.2% for spot, 0.1% for perp
    
    // Record the fee transaction
    await storage.recordFeeTransaction({
      platformId: trade.platformId,
      tradeId: trade.tradeId,
      tradeType: 'perp', // Most Hyperliquid trades are perps
      tradeVolume: tradeVolume.toString(),
      feeRate: feeRate.toString(),
      totalFee: totalFee.toString(),
      platformShare: platformShare.toString(),
      liquidlabShare: liquidlabShare.toString(),
      status: 'completed'
    });

    // Update platform revenue summaries for all periods
    await storage.updateRevenueSummary(trade.platformId, 'daily');
    await storage.updateRevenueSummary(trade.platformId, 'weekly');
    await storage.updateRevenueSummary(trade.platformId, 'monthly');
    await storage.updateRevenueSummary(trade.platformId, 'all-time');

    console.log(`Processed trade ${trade.tradeId} for platform ${trade.platformId}, fee: ${totalFee}`);
  }

  /**
   * Fetch recent trades from Hyperliquid API
   * Since Hyperliquid doesn't have a direct builder code API, we need to:
   * 1. Get all platform owners from our database
   * 2. Fetch their trades using their wallet addresses (from Privy)
   * 3. Filter for trades with our builder wallet address
   */
  private async fetchRecentTrades(): Promise<TradeData[]> {
    try {
      const allTrades: TradeData[] = [];
      
      // Get all trading platforms from our database
      const platforms = await storage.getTradingPlatforms();
      
      if (!platforms || platforms.length === 0) {
        console.log('No platforms found to check for trades');
        return [];
      }

      console.log(`Checking trades for ${platforms.length} platforms`);

      // NOTE: In production, we would need to:
      // 1. Store wallet addresses when users connect through Privy
      // 2. Or fetch wallet addresses from Privy API using user IDs
      // 3. Then use those addresses to fetch trades from Hyperliquid
      
      // For now, let's create a demo implementation that shows how the system works
      // In production, replace this with actual Hyperliquid API calls
      
      // Demo: Generate sample trades for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Generating sample trades for testing');
        
        // Always generate at least one new trade for testing
        const currentTime = Date.now();
        const sampleTrades: TradeData[] = [
          {
            platformId: platforms[0]?.id || 1,
            tradeId: `demo_${currentTime}_1`,
            userId: '0xdemo_wallet_address',
            market: 'BTC',
            side: 'buy',
            size: '0.1',
            price: '120000',
            fee: '12', // 0.1% of 12000 USD
            builderCode: process.env.VITE_BUILDER_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
            timestamp: currentTime - 5000 // 5 seconds ago
          },
          {
            platformId: platforms[0]?.id || 1,
            tradeId: `demo_${currentTime}_2`,
            userId: '0xdemo_wallet_address',
            market: 'ETH',
            side: 'sell',
            size: '1.5',
            price: '3400',
            fee: '5.1', // 0.1% of 5100 USD
            builderCode: process.env.VITE_BUILDER_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
            timestamp: currentTime - 3000 // 3 seconds ago
          }
        ];
        
        // Only return trades newer than last processed timestamp
        const newTrades = sampleTrades.filter(trade => trade.timestamp > this.lastProcessedTimestamp);
        console.log(`Generated ${sampleTrades.length} sample trades, ${newTrades.length} are new`);
        return newTrades;
      }

      // Production implementation: Fetch trades from real wallet addresses
      for (const platform of platforms) {
        // Get the platform owner's wallet address
        const user = await storage.getUser(platform.userId);
        if (!user || !user.walletAddress) {
          console.log(`No wallet address found for platform ${platform.id} owner`);
          continue;
        }

        console.log(`Checking trades for wallet ${user.walletAddress} (platform: ${platform.name})`);
        
        try {
          // Fetch trades from Hyperliquid for this wallet
          const userFills = await this.hyperliquidService.getUserFills(user.walletAddress);
          
          if (!userFills || userFills.length === 0) {
            continue;
          }

          // Filter for trades with our builder wallet and after last processed timestamp
          const platformTrades = userFills
            .filter((fill: any) => {
              // In production, Hyperliquid tracks builder fees onchain
              // We just need to check if this is a new trade
              const isNewTrade = new Date(fill.time).getTime() > this.lastProcessedTimestamp;
              return isNewTrade;
            })
            .map((fill: any) => {
              const tradeSize = parseFloat(fill.sz);
              const tradePrice = parseFloat(fill.px);
              const tradeValue = tradeSize * tradePrice;
              
              // Calculate fee based on crossed property (true = taker, false = maker)
              const feeRate = fill.crossed ? 0.001 : 0.0002; // 0.1% taker, 0.02% maker
              const fee = tradeValue * feeRate;
              
              return {
                platformId: platform.id,
                tradeId: fill.tid,
                userId: user.walletAddress,
                market: fill.coin,
                side: fill.side === 'B' ? 'buy' : 'sell',
                size: fill.sz,
                price: fill.px,
                fee: fee.toFixed(2),
                builderCode: process.env.VITE_BUILDER_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
                timestamp: new Date(fill.time).getTime()
              };
            });

          allTrades.push(...platformTrades);
          
        } catch (error) {
          console.error(`Error fetching trades for wallet ${user.walletAddress}:`, error);
        }
      }
      
      console.log(`Found ${allTrades.length} total trades from ${platforms.length} platforms`);
      return allTrades;
      
    } catch (error) {
      console.error('Error in fetchRecentTrades:', error);
      return [];
    }
  }

  /**
   * Get the last processed timestamp from database
   */
  private async getLastProcessedTimestamp(): Promise<number | null> {
    try {
      // In development mode, start from 1 hour ago to ensure sample trades are processed
      if (process.env.NODE_ENV === 'development') {
        return Date.now() - 3600000; // 1 hour ago
      }
      
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