import { db } from '../db';
import { platformSecurity, suspiciousActivity, tradingPlatforms } from '@shared/schema';
import { eq, gt, and, or, ilike } from 'drizzle-orm';
import crypto from 'crypto';

export class SecurityService {
  // Initialize security monitoring for a new platform
  async initializePlatformSecurity(platformId: number) {
    await db.insert(platformSecurity).values({
      platformId,
      status: 'active',
      riskScore: 0,
    });
  }

  // Check platform security status
  async checkPlatformStatus(platformId: number) {
    const [security] = await db
      .select()
      .from(platformSecurity)
      .where(eq(platformSecurity.platformId, platformId));
    
    if (!security) {
      // Initialize if not exists
      await this.initializePlatformSecurity(platformId);
      return { allowed: true, status: 'active' };
    }
    
    const allowed = ['active', 'under-review'].includes(security.status);
    return { allowed, status: security.status, reason: security.suspendedReason || security.bannedReason };
  }

  // Scan platform content for suspicious patterns
  async scanPlatformContent(platformId: number, content: {
    name?: string;
    config?: any;
    logoUrl?: string;
  }) {
    const suspiciousPatterns = [
      // Investment scams
      /guaranteed\s+returns?/i,
      /double\s+your\s+(money|investment)/i,
      /risk[\s-]?free\s+(profit|trading)/i,
      /minimum\s+\d+%\s+daily/i,
      
      // Phishing patterns
      /verify\s+your\s+wallet/i,
      /urgent\s+action\s+required/i,
      /limited\s+time\s+offer/i,
      
      // Crypto scams
      /crypto\s+mining\s+pool/i,
      /bitcoin\s+doubler/i,
      /ponzi/i,
      /pyramid\s+scheme/i,
      
      // Suspicious URLs
      /bit\.ly|tinyurl|short\.link/i,
    ];
    
    const contentString = JSON.stringify(content).toLowerCase();
    const detectedPatterns: string[] = [];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(contentString)) {
        detectedPatterns.push(pattern.source);
      }
    }
    
    if (detectedPatterns.length > 0) {
      // Log suspicious activity
      await this.logSuspiciousActivity({
        platformId,
        activityType: 'content_violation',
        description: `Suspicious patterns detected: ${detectedPatterns.join(', ')}`,
        severity: detectedPatterns.length > 2 ? 'high' : 'medium',
        metadata: { patterns: detectedPatterns, content }
      });
      
      // Increase risk score
      await this.updateRiskScore(platformId, detectedPatterns.length * 20);
    }
    
    return detectedPatterns;
  }

  // Update platform risk score
  async updateRiskScore(platformId: number, scoreChange: number) {
    const [security] = await db
      .select()
      .from(platformSecurity)
      .where(eq(platformSecurity.platformId, platformId));
    
    if (!security) {
      await this.initializePlatformSecurity(platformId);
      return;
    }
    
    const newScore = Math.max(0, Math.min(100, (security.riskScore || 0) + scoreChange));
    
    await db
      .update(platformSecurity)
      .set({ 
        riskScore: newScore,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));
    
    // Auto-suspend if risk score too high
    if (newScore > 80 && security.status === 'active') {
      await this.suspendPlatform(platformId, 'High risk score detected - automatic suspension');
    }
  }

  // Log suspicious activity
  async logSuspiciousActivity(activity: {
    platformId?: number;
    userId?: number;
    activityType: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: string;
    metadata?: any;
  }) {
    await db.insert(suspiciousActivity).values({
      ...activity,
      severity: activity.severity || 'medium',
    });
  }

  // Suspend a platform
  async suspendPlatform(platformId: number, reason: string) {
    await db
      .update(platformSecurity)
      .set({
        status: 'suspended',
        suspendedAt: new Date(),
        suspendedReason: reason,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));
    
    // Log the suspension
    await this.logSuspiciousActivity({
      platformId,
      activityType: 'platform_suspended',
      description: `Platform suspended: ${reason}`,
      severity: 'high'
    });
  }

  // Ban a platform permanently
  async banPlatform(platformId: number, reason: string) {
    await db
      .update(platformSecurity)
      .set({
        status: 'banned',
        bannedAt: new Date(),
        bannedReason: reason,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));
    
    // Also unpublish the platform
    await db
      .update(tradingPlatforms)
      .set({ isPublished: false })
      .where(eq(tradingPlatforms.id, platformId));
    
    // Log the ban
    await this.logSuspiciousActivity({
      platformId,
      activityType: 'platform_banned',
      description: `Platform permanently banned: ${reason}`,
      severity: 'critical'
    });
  }

  // Review a platform for approval/rejection
  async reviewPlatform(platformId: number, approved: boolean, notes: string) {
    const status = approved ? 'active' : 'under-review';
    
    await db
      .update(platformSecurity)
      .set({
        status,
        lastReviewedAt: new Date(),
        reviewNotes: notes,
        riskScore: approved ? 0 : undefined, // Reset risk score if approved
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));
  }

  // Get suspicious platforms for admin review
  async getSuspiciousPlatforms() {
    return await db
      .select({
        platform: tradingPlatforms,
        security: platformSecurity,
        recentActivity: suspiciousActivity
      })
      .from(platformSecurity)
      .innerJoin(tradingPlatforms, eq(tradingPlatforms.id, platformSecurity.platformId))
      .leftJoin(
        suspiciousActivity,
        and(
          eq(suspiciousActivity.platformId, platformSecurity.platformId),
          eq(suspiciousActivity.isResolved, false)
        )
      )
      .where(
        or(
          gt(platformSecurity.riskScore, 50),
          eq(platformSecurity.status, 'under-review'),
          eq(platformSecurity.status, 'suspended')
        )
      );
  }

  // Generate secure API key
  generateApiKey(): string {
    return `llk_${crypto.randomBytes(32).toString('hex')}`;
  }

  // Hash API key for storage
  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  // Verify API key
  verifyApiKey(apiKey: string, hashedKey: string): boolean {
    const hash = this.hashApiKey(apiKey);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedKey));
  }
}

export const securityService = new SecurityService();