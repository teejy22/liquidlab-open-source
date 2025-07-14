import { rateLimits, type InsertRateLimit } from '@shared/schema';
import { db } from '../db';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  identifier?: (req: Request) => string; // Custom identifier function
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

// Default rate limit configurations
export const rateLimitConfigs = {
  api: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: 'Too many API requests, please try again later.',
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
  },
  trading: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many trading requests, please slow down.',
  },
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: 'Too many requests, please try again later.',
  },
};

// Get the identifier for rate limiting
function getIdentifier(req: Request, customIdentifier?: (req: Request) => string): string {
  if (customIdentifier) {
    return customIdentifier(req);
  }
  
  // Use API key if present
  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) {
    return `api:${apiKey}`;
  }
  
  // Use user ID if authenticated
  if (req.user && (req.user as any).id) {
    return `user:${(req.user as any).id}`;
  }
  
  // Fall back to IP address
  const ip = req.headers['x-forwarded-for'] as string || 
             req.headers['x-real-ip'] as string || 
             req.socket.remoteAddress || 
             'unknown';
  
  return `ip:${ip}`;
}

// Check if request should be rate limited
async function checkRateLimit(
  identifier: string,
  endpoint: string,
  windowMs: number,
  max: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  
  // Clean up old entries
  await db
    .delete(rateLimits)
    .where(lt(rateLimits.windowStart, windowStart));
  
  // Get current request count
  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.endpoint, endpoint),
        gte(rateLimits.windowStart, windowStart)
      )
    );
  
  const count = result?.count || 0;
  const allowed = count < max;
  const remaining = Math.max(0, max - count - 1);
  const resetAt = new Date(windowStart.getTime() + windowMs);
  
  return { allowed, remaining, resetAt };
}

// Record a rate limit hit
async function recordRateLimitHit(
  identifier: string,
  endpoint: string
): Promise<void> {
  const rateLimitData: InsertRateLimit = {
    identifier,
    endpoint,
    windowStart: new Date(),
  };
  
  await db.insert(rateLimits).values(rateLimitData);
}

// Rate limiting middleware factory
export function createRateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getIdentifier(req, options.identifier);
      const endpoint = req.path;
      
      const { allowed, remaining, resetAt } = await checkRateLimit(
        identifier,
        endpoint,
        options.windowMs,
        options.max
      );
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetAt.toISOString());
      
      if (!allowed) {
        res.setHeader('Retry-After', Math.ceil((resetAt.getTime() - Date.now()) / 1000));
        return res.status(429).json({
          error: options.message || 'Too many requests',
          retryAfter: resetAt,
        });
      }
      
      // Record the hit if we should
      const isSuccess = res.statusCode < 400;
      const shouldRecord = 
        (!options.skipSuccessfulRequests || !isSuccess) &&
        (!options.skipFailedRequests || isSuccess);
      
      if (shouldRecord) {
        await recordRateLimitHit(identifier, endpoint);
      }
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Don't block requests on rate limiter errors
      next();
    }
  };
}

// Preset rate limiters
export const rateLimiters = {
  api: createRateLimiter(rateLimitConfigs.api),
  auth: createRateLimiter(rateLimitConfigs.auth),
  trading: createRateLimiter(rateLimitConfigs.trading),
  public: createRateLimiter(rateLimitConfigs.public),
};

// Custom rate limiter for specific platforms
export function createPlatformRateLimiter(platformId: number, config?: Partial<RateLimitOptions>) {
  return createRateLimiter({
    ...rateLimitConfigs.api,
    ...config,
    identifier: (req) => `platform:${platformId}:${getIdentifier(req)}`,
  });
}