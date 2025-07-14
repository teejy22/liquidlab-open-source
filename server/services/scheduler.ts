import { tradeBatchProcessor } from './tradeBatchProcessor';
import { createAuditLog } from '../security/audit';

export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
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

    // Run immediately on startup
    setTimeout(() => {
      tradeBatchProcessor.processTradeBatch().catch(console.error);
    }, 5000); // Wait 5 seconds for server to fully start

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

  /**
   * Schedule a recurring job
   */
  private scheduleJob(name: string, intervalMs: number, handler: () => Promise<void>) {
    // Clear existing job if it exists
    if (this.intervals.has(name)) {
      clearInterval(this.intervals.get(name)!);
    }

    // Create new interval
    const interval = setInterval(async () => {
      try {
        await handler();
      } catch (error) {
        console.error(`Error in scheduled job ${name}:`, error);
        await createAuditLog({
          action: 'scheduled_job_error',
          resource: 'scheduler',
          metadata: {
            job: name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }, intervalMs);

    this.intervals.set(name, interval);
    console.log(`Scheduled job: ${name} (every ${intervalMs / 1000}s)`);
  }
}

export const scheduler = new Scheduler();