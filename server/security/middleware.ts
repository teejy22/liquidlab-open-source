import type { Request, Response, NextFunction } from 'express';
import { validateApiKey } from './apiKeys';
import { createAuditLog } from './audit';
import { rateLimiters } from './rateLimiter';
import { ApiKey } from '@shared/schema';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      platformId?: number;
    }
  }
}

// API Authentication Middleware
export async function authenticateApi(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;
  const apiSecret = req.headers['x-api-secret'] as string;

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: 'Missing API credentials',
      message: 'Please provide X-API-Key and X-API-Secret headers',
    });
  }

  const { valid, apiKey: keyData } = await validateApiKey(apiKey, apiSecret);

  if (!valid || !keyData) {
    await createAuditLog({
      action: 'api_auth_failed',
      resource: 'api',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || null,
      metadata: { apiKey },
    });

    return res.status(401).json({
      error: 'Invalid API credentials',
      message: 'The provided API key or secret is invalid',
    });
  }

  // Check permissions
  const requiredPermission = getRequiredPermission(req.method);
  if (!keyData.permissions.includes(requiredPermission)) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      message: `This API key does not have ${requiredPermission} permission`,
    });
  }

  // Attach API key data to request
  req.apiKey = keyData;
  req.platformId = keyData.platformId;

  // Log successful authentication
  await createAuditLog({
    platformId: keyData.platformId,
    action: 'api_auth_success',
    resource: 'api',
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
    metadata: { apiKeyId: keyData.id },
  });

  next();
}

// CORS middleware for platform domains
export async function platformCors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin;
  
  if (!origin) {
    return next();
  }

  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-API-Secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    
    return next();
  }

  // In production, validate against allowed domains
  // TODO: Check against platformDomains table
  const allowedOrigins = [
    'https://liquidlab.com',
    'https://app.liquidlab.com',
    /^https:\/\/[a-zA-Z0-9-]+\.liquidlab\.com$/,
  ];

  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-API-Secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(isAllowed ? 204 : 403);
  }

  next();
}

// Security headers middleware
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tradingview.com https://s3.tradingview.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.hyperliquid.xyz https://api.coingecko.com wss:",
    "frame-src 'self' https://tradingview.com https://www.tradingview.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
}

// Error handling middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('API Error:', err);
  
  // Create audit log for errors
  createAuditLog({
    platformId: req.platformId,
    action: 'api_error',
    resource: req.path,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
    metadata: {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  }).catch(console.error);
  
  // Send error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// Helper functions
function getRequiredPermission(method: string): string {
  switch (method) {
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
      return 'read';
    default:
      return 'write';
  }
}

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Compose middleware for API routes
export const apiMiddleware = [
  securityHeaders,
  platformCors,
  rateLimiters.api,
  authenticateApi,
];