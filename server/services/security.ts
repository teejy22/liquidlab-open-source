import { db } from "../db";
import { 
  platformSecurity, 
  suspiciousActivity, 
  verificationAttempts,
  tradingPlatforms,
  auditLogs 
} from "@shared/schema";
import { eq, and, gt, lt, sql, desc } from "drizzle-orm";
import { createAuditLog, AuditActions } from "../security/audit";

export class SecurityService {
  // Activity type constants
  static readonly ACTIVITY_TYPES = {
    RAPID_VERIFICATION: "rapid_verification_attempts",
    SUSPICIOUS_LINKS: "suspicious_links",
    CONTENT_VIOLATION: "content_violation",
    DOMAIN_MISMATCH: "domain_mismatch",
    FAKE_VERIFICATION: "fake_verification_display",
    SCRIPT_INJECTION: "script_injection",
    PHISHING_ATTEMPT: "phishing_attempt"
  };

  // Check for rapid verification attempts (rate limiting)
  static async checkRapidVerificationAttempts(ipAddress: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationAttempts)
      .where(and(
        eq(verificationAttempts.ipAddress, ipAddress),
        gt(verificationAttempts.createdAt, oneHourAgo)
      ));

    const attemptCount = result?.count || 0;
    
    // Flag if more than 10 attempts in an hour
    if (attemptCount > 10) {
      await this.reportSuspiciousActivity({
        activityType: this.ACTIVITY_TYPES.RAPID_VERIFICATION,
        description: `IP address ${ipAddress} made ${attemptCount} verification attempts in the last hour`,
        ipAddress,
        severity: "high",
        metadata: { attemptCount }
      });
      return true;
    }
    
    return false;
  }

  // Initialize platform security record
  static async initializePlatformSecurity(platformId: number): Promise<void> {
    await db.insert(platformSecurity).values({
      platformId,
      status: "active",
      riskScore: 0
    }).onConflictDoNothing();
  }

  // Report suspicious activity
  static async reportSuspiciousActivity(data: {
    platformId?: number;
    userId?: number;
    activityType: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: string;
    metadata?: any;
  }): Promise<void> {
    await db.insert(suspiciousActivity).values({
      ...data,
      severity: data.severity || "medium"
    });

    // Increase risk score if platform-specific
    if (data.platformId) {
      await this.updateRiskScore(data.platformId, data.severity === "critical" ? 25 : 10);
    }
  }

  // Update platform risk score
  static async updateRiskScore(platformId: number, scoreIncrease: number): Promise<void> {
    await db
      .update(platformSecurity)
      .set({ 
        riskScore: sql`LEAST(${platformSecurity.riskScore} + ${scoreIncrease}, 100)`,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));

    // Auto-suspend if risk score is too high
    const [platform] = await db
      .select()
      .from(platformSecurity)
      .where(eq(platformSecurity.platformId, platformId));

    if (platform && platform.riskScore >= 75 && platform.status === "active") {
      await this.suspendPlatform(
        platformId, 
        "Automatically suspended due to high risk score"
      );
    }
  }

  // Suspend a platform
  static async suspendPlatform(platformId: number, reason: string): Promise<void> {
    await db
      .update(platformSecurity)
      .set({
        status: "suspended",
        suspendedAt: new Date(),
        suspendedReason: reason,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));

    // Also mark the platform as not verified
    await db
      .update(tradingPlatforms)
      .set({
        isVerified: false,
        updatedAt: new Date()
      })
      .where(eq(tradingPlatforms.id, platformId));

    // Log the action
    await createAuditLog({
      platformId,
      action: AuditActions.PLATFORM_SUSPENDED,
      resource: "platform",
      resourceId: platformId.toString(),
      metadata: { reason }
    });
  }

  // Ban a platform permanently
  static async banPlatform(platformId: number, reason: string): Promise<void> {
    await db
      .update(platformSecurity)
      .set({
        status: "banned",
        bannedAt: new Date(),
        bannedReason: reason,
        updatedAt: new Date()
      })
      .where(eq(platformSecurity.platformId, platformId));

    // Mark platform as not verified and not active
    await db
      .update(tradingPlatforms)
      .set({
        isVerified: false,
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(tradingPlatforms.id, platformId));

    // Log the action
    await createAuditLog({
      platformId,
      action: AuditActions.PLATFORM_BANNED,
      resource: "platform",
      resourceId: platformId.toString(),
      metadata: { reason }
    });
  }

  // Check if platform is allowed to operate
  static async isPlatformAllowed(platformId: number): Promise<boolean> {
    const [security] = await db
      .select()
      .from(platformSecurity)
      .where(eq(platformSecurity.platformId, platformId));

    if (!security) return true; // No security record means new platform
    
    return security.status === "active";
  }

  // Scan platform content for suspicious elements
  static async scanPlatformContent(platformId: number, content: {
    name?: string;
    config?: any;
    logoUrl?: string;
  }): Promise<boolean> {
    // Limit input size to prevent ReDoS attacks
    const contentString = JSON.stringify(content);
    if (contentString.length > 10000) {
      await this.reportSuspiciousActivity({
        platformId,
        activityType: this.ACTIVITY_TYPES.CONTENT_VIOLATION,
        description: "Platform content exceeds maximum allowed size",
        severity: "high",
        metadata: { contentLength: contentString.length }
      });
      return false;
    }

    // Use simple string checks instead of complex regex to avoid ReDoS
    const suspiciousKeywords = [
      'liquidlab.com', // Old domain
      'phishing',
      'scam',
      'hack',
      '100% guaranteed',
      'guaranteed returns',
      'investment opportunity',
      'crypto mining'
    ];

    // Safe regex patterns with bounded complexity
    const safePatterns = [
      /javascript:/i, // Simple pattern, no backtracking
      /<script\b/i, // Word boundary instead of [^>]*
      /on(?:click|load|error|mouseover)\s*=/i, // Specific events instead of \w+
    ];

    const flaggedPatterns: string[] = [];
    const lowerContent = contentString.toLowerCase();

    // Check simple keywords
    for (const keyword of suspiciousKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        flaggedPatterns.push(keyword);
      }
    }

    // Check safe regex patterns
    for (const pattern of safePatterns) {
      if (pattern.test(contentString)) {
        flaggedPatterns.push(pattern.source);
      }
    }

    // Check for fake verification codes more safely
    if (lowerContent.includes('verify') && lowerContent.includes('code') && /[A-Z0-9]{8}/.test(contentString)) {
      flaggedPatterns.push('Potential fake verification code');
    }

    // Check for wallet connection urgency
    if (lowerContent.includes('connect') && lowerContent.includes('wallet') && lowerContent.includes('now')) {
      flaggedPatterns.push('Urgent wallet connection request');
    }

    if (flaggedPatterns.length > 0) {
      await this.reportSuspiciousActivity({
        platformId,
        activityType: this.ACTIVITY_TYPES.CONTENT_VIOLATION,
        description: "Platform content contains suspicious patterns",
        severity: "high",
        metadata: { flaggedPatterns, content }
      });

      // Update platform security with flagged content
      await db
        .update(platformSecurity)
        .set({
          flaggedContent: { patterns: flaggedPatterns, timestamp: new Date() },
          updatedAt: new Date()
        })
        .where(eq(platformSecurity.platformId, platformId));

      return false;
    }

    return true;
  }

  // Get platform security status
  static async getPlatformSecurityStatus(platformId: number): Promise<any> {
    const [security] = await db
      .select()
      .from(platformSecurity)
      .where(eq(platformSecurity.platformId, platformId));

    const recentActivity = await db
      .select()
      .from(suspiciousActivity)
      .where(eq(suspiciousActivity.platformId, platformId))
      .orderBy(desc(suspiciousActivity.createdAt))
      .limit(10);

    return {
      security: security || { status: "active", riskScore: 0 },
      recentActivity
    };
  }

  // Review platform for admin
  static async reviewPlatform(platformId: number, reviewNotes: string, approve: boolean): Promise<void> {
    if (approve) {
      await db
        .update(platformSecurity)
        .set({
          status: "active",
          riskScore: 0,
          lastReviewedAt: new Date(),
          reviewNotes,
          updatedAt: new Date()
        })
        .where(eq(platformSecurity.platformId, platformId));
    } else {
      await this.suspendPlatform(platformId, `Admin review: ${reviewNotes}`);
    }
  }
}