import { tradeBatchProcessor } from './tradeBatchProcessor';
import { createAuditLog } from '../security/audit';
import { VerificationService } from './verification';

export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Schedule a job to run at specified intervals
   */
  private scheduleJob(name: string, intervalMs: number, task: () => Promise<void>) {
    if (this.intervals.has(name)) {
      console.log(`Job ${name} already scheduled, skipping...`);
      return;
    }
    
    const interval = setInterval(async () => {
      try {
        await task();
      } catch (error) {
        console.error(`Error in scheduled job ${name}:`, error);
        await createAuditLog({
          action: 'scheduler_job_error',
          resource: 'scheduler',
          metadata: {
            job: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }, intervalMs);
    
    this.intervals.set(name, interval);
    console.log(`Scheduled job: ${name} (every ${intervalMs}ms)`);
  }
  
  /**
   * Start all scheduled jobs
   */
  async start() {
    console.log('Starting scheduler...');
    
    // Process trades every 10 minutes
    this.scheduleJob('trade-batch-processor', 10 * 60 * 1000, async () => {
      console.log('Running scheduled trade batch processing...');
      await tradeBatchProcessor.processTradeBatch();
    });

    // Rotate verification codes every 24 hours
    this.scheduleJob('verification-code-rotation', 24 * 60 * 60 * 1000, async () => {
      console.log('Running scheduled verification code rotation...');
      await VerificationService.rotateAllCodes();
    });

    // Run immediately on startup
    setTimeout(() => {
      tradeBatchProcessor.processTradeBatch().catch(console.error);
    }, 5000); // Wait 5 seconds for server to fully start

    // Rotate verification codes on startup if any are expired
    setTimeout(async () => {
      console.log('Checking for expired verification codes...');
      await VerificationService.rotateExpiredCodes();
    }, 10000); // Wait 10 seconds for server to fully start

    await createAuditLog({
      action: 'scheduler_started',
      resource: 'scheduler',
      metadata: {
        jobs: Array.from(this.intervals.keys())
      }
    });
  }

  /**
   * Stop all scheduled jobs
   */
  async stop() {
    console.log('Stopping scheduler...');
    
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`Stopped job: ${name}`);
    }
    
    this.intervals.clear();

    await createAuditLog({
      action: 'scheduler_stopped',
      resource: 'scheduler',
      metadata: {}
    });
  }
}

// Singleton instance
export const scheduler = new Scheduler();