import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Custom rate limiter that doesn't depend on the vulnerable 'ip' package
export function createRateLimiter(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client identifier (IP address)
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Clean up old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
    
    // Get or create client record
    if (!store[clientIp] || store[clientIp].resetTime < now) {
      store[clientIp] = {
        count: 0,
        resetTime: now + options.windowMs
      };
    }
    
    const clientData = store[clientIp];
    
    // Skip successful requests if configured
    if (options.skipSuccessfulRequests && res.statusCode < 400) {
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          clientData.count++;
        }
      });
    } else {
      clientData.count++;
    }
    
    // Check if limit exceeded
    if (clientData.count > options.max) {
      if (options.standardHeaders) {
        res.setHeader('RateLimit-Limit', options.max.toString());
        res.setHeader('RateLimit-Remaining', '0');
        res.setHeader('RateLimit-Reset', new Date(clientData.resetTime).toISOString());
      }
      
      return res.status(429).json({
        error: options.message || 'Too many requests, please try again later.'
      });
    }
    
    // Add rate limit headers
    if (options.standardHeaders) {
      res.setHeader('RateLimit-Limit', options.max.toString());
      res.setHeader('RateLimit-Remaining', (options.max - clientData.count).toString());
      res.setHeader('RateLimit-Reset', new Date(clientData.resetTime).toISOString());
    }
    
    next();
  };
}

// General API rate limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
});

// Trading endpoint rate limiter
export const tradingLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 trades per minute
  message: 'Trading rate limit exceeded, please slow down.',
  standardHeaders: true,
});

// Hyperliquid API rate limiter
export const hyperliquidLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Hyperliquid allows ~60 requests per minute
  message: 'Hyperliquid API rate limit exceeded.',
  standardHeaders: true,
});