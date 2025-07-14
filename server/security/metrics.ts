import { platformMetrics, type InsertPlatformMetric, type PlatformMetric } from '@shared/schema';
import { db } from '../db';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

// Metrics collection interface
interface MetricsData {
  platformId: number;
  uniqueVisitors?: number;
  pageViews?: number;
  tradingVolume?: string;
  revenueGenerated?: string;
  apiCalls?: number;
  errorRate?: string;
  avgResponseTime?: number;
}

// Collect and store metrics for a platform
export async function collectPlatformMetrics(data: MetricsData): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Upsert metrics for today
    await db
      .insert(platformMetrics)
      .values({
        platformId: data.platformId,
        date: today,
        uniqueVisitors: data.uniqueVisitors || 0,
        pageViews: data.pageViews || 0,
        tradingVolume: data.tradingVolume || '0',
        revenueGenerated: data.revenueGenerated || '0',
        apiCalls: data.apiCalls || 0,
        errorRate: data.errorRate || '0',
        avgResponseTime: data.avgResponseTime,
      })
      .onConflictDoUpdate({
        target: [platformMetrics.platformId, platformMetrics.date],
        set: {
          uniqueVisitors: sql`${platformMetrics.uniqueVisitors} + ${data.uniqueVisitors || 0}`,
          pageViews: sql`${platformMetrics.pageViews} + ${data.pageViews || 0}`,
          tradingVolume: sql`${platformMetrics.tradingVolume} + ${data.tradingVolume || '0'}`,
          revenueGenerated: sql`${platformMetrics.revenueGenerated} + ${data.revenueGenerated || '0'}`,
          apiCalls: sql`${platformMetrics.apiCalls} + ${data.apiCalls || 1}`,
          // For error rate and response time, we need a more sophisticated calculation
          errorRate: data.errorRate || sql`${platformMetrics.errorRate}`,
          avgResponseTime: data.avgResponseTime || sql`${platformMetrics.avgResponseTime}`,
        },
      });
  } catch (error) {
    console.error('Failed to collect platform metrics:', error);
  }
}

// Get platform metrics for a date range
export async function getPlatformMetrics(
  platformId: number,
  startDate: string,
  endDate: string
): Promise<PlatformMetric[]> {
  return await db
    .select()
    .from(platformMetrics)
    .where(
      and(
        eq(platformMetrics.platformId, platformId),
        gte(platformMetrics.date, startDate),
        lte(platformMetrics.date, endDate)
      )
    )
    .orderBy(platformMetrics.date);
}

// Get aggregated platform metrics
export async function getAggregatedMetrics(
  platformId: number,
  period: '7d' | '30d' | '90d' | 'all'
): Promise<{
  totalUniqueVisitors: number;
  totalPageViews: number;
  totalTradingVolume: string;
  totalRevenue: string;
  totalApiCalls: number;
  avgErrorRate: string;
  avgResponseTime: number;
}> {
  const endDate = new Date().toISOString().split('T')[0];
  let startDate: string;
  
  switch (period) {
    case '7d':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '30d':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90d':
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    default:
      startDate = '2024-01-01'; // Platform launch date
  }
  
  const [result] = await db
    .select({
      totalUniqueVisitors: sql<number>`sum(${platformMetrics.uniqueVisitors})::int`,
      totalPageViews: sql<number>`sum(${platformMetrics.pageViews})::int`,
      totalTradingVolume: sql<string>`sum(${platformMetrics.tradingVolume})::text`,
      totalRevenue: sql<string>`sum(${platformMetrics.revenueGenerated})::text`,
      totalApiCalls: sql<number>`sum(${platformMetrics.apiCalls})::int`,
      avgErrorRate: sql<string>`avg(${platformMetrics.errorRate})::text`,
      avgResponseTime: sql<number>`avg(${platformMetrics.avgResponseTime})::int`,
    })
    .from(platformMetrics)
    .where(
      and(
        eq(platformMetrics.platformId, platformId),
        gte(platformMetrics.date, startDate),
        lte(platformMetrics.date, endDate)
      )
    );
  
  return {
    totalUniqueVisitors: result?.totalUniqueVisitors || 0,
    totalPageViews: result?.totalPageViews || 0,
    totalTradingVolume: result?.totalTradingVolume || '0',
    totalRevenue: result?.totalRevenue || '0',
    totalApiCalls: result?.totalApiCalls || 0,
    avgErrorRate: result?.avgErrorRate || '0',
    avgResponseTime: result?.avgResponseTime || 0,
  };
}

// Middleware to track API metrics
import type { Request, Response, NextFunction } from 'express';

export function trackApiMetrics(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Override res.json to track response
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    
    // Collect metrics if platform ID is available
    if (req.platformId) {
      collectPlatformMetrics({
        platformId: req.platformId,
        apiCalls: 1,
        errorRate: isError ? '1' : '0',
        avgResponseTime: responseTime,
      }).catch(console.error);
    }
    
    return originalJson(data);
  };
  
  next();
}