import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tradingPlatforms } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request to include platform data
declare global {
  namespace Express {
    interface Request {
      platform?: {
        id: number;
        name: string;
        ownerId: string;
        config: any;
        logoUrl?: string | null;
        isCustomDomain?: boolean;
        domain?: string;
      };
    }
  }
}

/**
 * Middleware to resolve which platform to serve based on the incoming domain
 */
export async function resolvePlatform(req: Request, res: Response, next: NextFunction) {
  try {
    const host = req.hostname.toLowerCase();
    
    // Skip resolution for main domain and API/admin routes
    if (host === 'liquidlab.trade' || 
        host === 'localhost' ||
        req.path.startsWith('/api/') ||
        req.path.startsWith('/admin/')) {
      return next();
    }
    
    let platform = null;
    let isCustomDomain = false;
    
    // Check if it's a subdomain of liquidlab.trade
    if (host.endsWith('.liquidlab.trade') || host.endsWith('.app.liquidlab.trade')) {
      // Extract subdomain (e.g., "platform1" from "platform1.liquidlab.trade")
      const subdomain = host.split('.')[0];
      
      // Find platform by subdomain
      const [foundPlatform] = await db
        .select()
        .from(tradingPlatforms)
        .where(eq(tradingPlatforms.subdomain, subdomain))
        .limit(1);
        
      platform = foundPlatform;
    } else {
      // Check custom domains - custom domains are stored in tradingPlatforms.customDomain
      const [foundPlatform] = await db
        .select()
        .from(tradingPlatforms)
        .where(eq(tradingPlatforms.customDomain, host))
        .limit(1);
        
      if (foundPlatform) {
        platform = foundPlatform;
        isCustomDomain = true;
      }
    }
    
    // If no platform found, continue (will show 404 or main site)
    if (!platform) {
      return next();
    }
    
    // Attach platform data to request
    req.platform = {
      id: platform.id,
      name: platform.name,
      ownerId: platform.userId.toString(), // Convert to string for consistency
      config: platform.config,
      logoUrl: platform.logoUrl,
      isCustomDomain,
      domain: host
    };
    
    next();
  } catch (error) {
    console.error('Platform resolution error:', error);
    next();
  }
}

/**
 * Middleware to ensure a platform is resolved (for platform-specific routes)
 */
export function requirePlatform(req: Request, res: Response, next: NextFunction) {
  if (!req.platform) {
    return res.status(404).json({ message: 'Platform not found' });
  }
  next();
}