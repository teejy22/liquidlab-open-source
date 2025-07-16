import { db } from "../db";
import { platformVerificationTokens, verificationAttempts, tradingPlatforms } from "@shared/schema";
import { eq, and, lt, gt, count } from "drizzle-orm";
import crypto from "crypto";
import { SecurityService } from "./security";

export class VerificationService {
  private static TOKEN_EXPIRY_HOURS = 24;
  
  /**
   * Generate a new verification token for a platform
   * Automatically expires old tokens
   */
  static async generateToken(platformId: number): Promise<{ code: string; hash: string }> {
    // Expire old tokens for this platform
    await db
      .update(platformVerificationTokens)
      .set({ isActive: false })
      .where(and(
        eq(platformVerificationTokens.platformId, platformId),
        eq(platformVerificationTokens.isActive, true)
      ));
    
    // Generate new verification code (alphanumeric, 8 characters)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Generate security hash (SHA-256)
    const hash = crypto.createHash('sha256')
      .update(`${platformId}-${code}-${Date.now()}`)
      .digest('hex');
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);
    
    // Insert new token
    await db.insert(platformVerificationTokens).values({
      platformId,
      verificationCode: code,
      securityHash: hash,
      isActive: true,
      expiresAt,
    });
    
    return { code, hash };
  }
  
  /**
   * Get the active verification code for a platform
   */
  static async getActiveCode(platformId: number): Promise<string | null> {
    try {
      const [token] = await db
        .select()
        .from(platformVerificationTokens)
        .where(and(
          eq(platformVerificationTokens.platformId, platformId),
          eq(platformVerificationTokens.isActive, true),
          gt(platformVerificationTokens.expiresAt, new Date())
        ));
      
      return token?.verificationCode || null;
    } catch (error) {
      console.error("Error getting active verification code:", error);
      return null;
    }
  }
  
  /**
   * Verify a platform using its verification code
   * Records the attempt for security auditing
   */
  static async verifyPlatform(
    code: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<{ 
    success: boolean; 
    platform?: any; 
    error?: string;
    securityHash?: string;
  }> {
    try {
      // Check for rapid verification attempts from this IP
      const isRapidAttempt = await SecurityService.checkRapidVerificationAttempts(ipAddress);
      if (isRapidAttempt) {
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'rate_limited',
        });
        
        return { success: false, error: 'Too many verification attempts. Please try again later.' };
      }

      // Find active token with this code
      const [token] = await db
        .select()
        .from(platformVerificationTokens)
        .where(and(
          eq(platformVerificationTokens.verificationCode, code.toUpperCase()),
          eq(platformVerificationTokens.isActive, true),
          gt(platformVerificationTokens.expiresAt, new Date())
        ));
      
      if (!token) {
        // Record failed attempt
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'invalid_code',
        });
        
        return { success: false, error: 'Invalid verification code' };
      }
      
      // Get platform details
      const [platform] = await db
        .select()
        .from(tradingPlatforms)
        .where(eq(tradingPlatforms.id, token.platformId));
      
      if (!platform) {
        // Record failed attempt - platform not found
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'platform_not_found',
        });
        
        return { success: false, error: 'Platform not found' };
      }
      
      // Check if platform is allowed to operate (not suspended/banned)
      const isAllowed = await SecurityService.isPlatformAllowed(platform.id);
      if (!isAllowed) {
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'platform_suspended',
          platformId: platform.id,
        });
        
        return { success: false, error: 'This platform has been suspended. Please contact support.' };
      }
      
      // Check if platform is approved
      if (platform.approvalStatus !== 'approved') {
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'platform_not_approved',
          platformId: platform.id,
        });
        
        const errorMessage = platform.approvalStatus === 'rejected' 
          ? 'This platform has been rejected. Please check your email for details.'
          : 'This platform is pending approval. You will receive an email once approved.';
        
        return { success: false, error: errorMessage };
      }
      
      // Update platform as verified
      await db
        .update(tradingPlatforms)
        .set({
          isVerified: true,
          verificationDate: new Date(),
        })
        .where(eq(tradingPlatforms.id, platform.id));
      
      // Record successful attempt
      await db.insert(verificationAttempts).values({
        attemptedCode: code,
        ipAddress,
        userAgent,
        success: true,
        platformId: platform.id,
      });
      
      // Return updated platform info
      const updatedPlatform = {
        ...platform,
        isVerified: true,
        verificationDate: new Date()
      };
      
      return { 
        success: true, 
        platform: updatedPlatform, 
        securityHash: token.securityHash 
      };
      
    } catch (error) {
      console.error("Error in verifyPlatform:", error);
      
      // Try to record error attempt but don't fail if this also errors
      try {
        await db.insert(verificationAttempts).values({
          attemptedCode: code,
          ipAddress,
          userAgent,
          success: false,
          errorReason: 'system_error',
        });
      } catch (attemptError) {
        console.error("Error recording verification attempt:", attemptError);
      }
      
      return { success: false, error: 'System error during verification' };
    }
  }
  
  /**
   * Get verification history for a platform
   */
  static async getVerificationHistory(
    platformId: number,
    limit = 10
  ): Promise<any[]> {
    return await db
      .select()
      .from(verificationAttempts)
      .where(eq(verificationAttempts.platformId, platformId))
      .orderBy(verificationAttempts.createdAt)
      .limit(limit);
  }
  
  /**
   * Check if an IP has too many failed attempts
   */
  static async checkRateLimit(
    ipAddress: string,
    maxAttempts = 5,
    windowMinutes = 15
  ): Promise<boolean> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);
    
    const [result] = await db
      .select({ count: count() })
      .from(verificationAttempts)
      .where(and(
        eq(verificationAttempts.ipAddress, ipAddress),
        eq(verificationAttempts.success, false),
        gt(verificationAttempts.createdAt, windowStart)
      ));
    
    return result.count < maxAttempts;
  }
  
  /**
   * Clean up expired tokens (run periodically)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    await db
      .update(platformVerificationTokens)
      .set({ isActive: false })
      .where(and(
        eq(platformVerificationTokens.isActive, true),
        lt(platformVerificationTokens.expiresAt, new Date())
      ));
  }

  /**
   * Rotate verification codes for all platforms
   * Used by scheduler to automatically refresh codes every 24 hours
   */
  static async rotateAllCodes(): Promise<void> {
    try {
      console.log('Starting verification code rotation for all platforms...');
      
      // Get all approved platforms
      const platforms = await db
        .select()
        .from(tradingPlatforms)
        .where(eq(tradingPlatforms.approvalStatus, 'approved'));
      
      let rotatedCount = 0;
      
      for (const platform of platforms) {
        try {
          await this.generateToken(platform.id);
          rotatedCount++;
          console.log(`Rotated verification code for platform ${platform.id} (${platform.name})`);
        } catch (error) {
          console.error(`Failed to rotate code for platform ${platform.id}:`, error);
        }
      }
      
      console.log(`Verification code rotation complete. Rotated ${rotatedCount} of ${platforms.length} platforms.`);
      
      // Clean up any expired tokens
      await this.cleanupExpiredTokens();
      
    } catch (error) {
      console.error('Error in rotateAllCodes:', error);
      throw error;
    }
  }

  /**
   * Rotate expired verification codes
   * Used on startup to ensure all platforms have valid codes
   */
  static async rotateExpiredCodes(): Promise<void> {
    try {
      console.log('Checking for expired verification codes...');
      
      // Get all platforms
      const platforms = await db.select().from(tradingPlatforms);
      
      let rotatedCount = 0;
      
      for (const platform of platforms) {
        // Check if platform has an active, non-expired code
        const activeCode = await this.getActiveCode(platform.id);
        
        if (!activeCode) {
          // No active code found, generate a new one
          try {
            await this.generateToken(platform.id);
            rotatedCount++;
            console.log(`Generated new verification code for platform ${platform.id} (${platform.name})`);
          } catch (error) {
            console.error(`Failed to generate code for platform ${platform.id}:`, error);
          }
        }
      }
      
      if (rotatedCount > 0) {
        console.log(`Generated ${rotatedCount} new verification codes for platforms with expired codes.`);
      } else {
        console.log('All platforms have valid verification codes.');
      }
      
      // Clean up any expired tokens
      await this.cleanupExpiredTokens();
      
    } catch (error) {
      console.error('Error in rotateExpiredCodes:', error);
    }
  }
}