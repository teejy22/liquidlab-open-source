import { db } from '../db';
import { platformDomains, tradingPlatforms } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { createAuditLog } from '../security/audit';
import crypto from 'crypto';

export class DomainManager {
  /**
   * Generate a verification token for domain ownership
   */
  generateVerificationToken(): string {
    return `liquidlab-verify-${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Add a custom domain to a platform
   */
  async addCustomDomain(platformId: number, domain: string): Promise<{
    success: boolean;
    verificationToken?: string;
    error?: string;
  }> {
    try {
      // Validate domain format
      if (!this.isValidDomain(domain)) {
        return { success: false, error: 'Invalid domain format' };
      }

      // Check if domain is already in use
      const existingDomain = await db
        .select()
        .from(platformDomains)
        .where(eq(platformDomains.domain, domain))
        .limit(1);

      if (existingDomain.length > 0) {
        return { success: false, error: 'Domain is already in use' };
      }

      // Generate verification token
      const verificationToken = this.generateVerificationToken();

      // Create domain record
      await db.insert(platformDomains).values({
        platformId,
        domain,
        verificationToken,
        verificationMethod: 'dns_txt',
        status: 'pending',
        createdAt: new Date()
      });

      await createAuditLog({
        platformId,
        action: 'custom_domain_added',
        resource: 'platform_domain',
        metadata: { domain }
      });

      return {
        success: true,
        verificationToken
      };
    } catch (error) {
      console.error('Error adding custom domain:', error);
      return { success: false, error: 'Failed to add domain' };
    }
  }

  /**
   * Verify domain ownership via DNS TXT record
   */
  async verifyDomain(platformId: number, domain: string): Promise<{
    verified: boolean;
    error?: string;
  }> {
    try {
      // Get domain record
      const [domainRecord] = await db
        .select()
        .from(platformDomains)
        .where(and(
          eq(platformDomains.platformId, platformId),
          eq(platformDomains.domain, domain)
        ));

      if (!domainRecord) {
        return { verified: false, error: 'Domain not found' };
      }

      // In production, you would check DNS TXT records here
      // For now, we'll simulate verification
      const isVerified = await this.checkDNSVerification(
        domain,
        domainRecord.verificationToken!
      );

      if (isVerified) {
        // Update domain status
        await db
          .update(platformDomains)
          .set({
            status: 'active',
            verifiedAt: new Date()
          })
          .where(eq(platformDomains.id, domainRecord.id));

        await createAuditLog({
          platformId,
          action: 'custom_domain_verified',
          resource: 'platform_domain',
          metadata: { domain }
        });

        return { verified: true };
      }

      return { verified: false, error: 'DNS verification not found' };
    } catch (error) {
      console.error('Error verifying domain:', error);
      return { verified: false, error: 'Verification failed' };
    }
  }

  /**
   * Remove a custom domain
   */
  async removeDomain(platformId: number, domain: string): Promise<boolean> {
    try {
      await db
        .delete(platformDomains)
        .where(and(
          eq(platformDomains.platformId, platformId),
          eq(platformDomains.domain, domain)
        ));

      await createAuditLog({
        platformId,
        action: 'custom_domain_removed',
        resource: 'platform_domain',
        metadata: { domain }
      });

      return true;
    } catch (error) {
      console.error('Error removing domain:', error);
      return false;
    }
  }

  /**
   * Get platform by custom domain
   */
  async getPlatformByDomain(domain: string): Promise<number | null> {
    try {
      const [result] = await db
        .select({ platformId: platformDomains.platformId })
        .from(platformDomains)
        .where(and(
          eq(platformDomains.domain, domain),
          eq(platformDomains.status, 'active')
        ));

      return result?.platformId || null;
    } catch (error) {
      console.error('Error getting platform by domain:', error);
      return null;
    }
  }

  /**
   * Get all domains for a platform
   */
  async getPlatformDomains(platformId: number) {
    return await db
      .select()
      .from(platformDomains)
      .where(eq(platformDomains.platformId, platformId));
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }

  /**
   * Check DNS TXT record for verification
   * In production, this would use a DNS resolver
   */
  private async checkDNSVerification(domain: string, token: string): Promise<boolean> {
    // TODO: Implement actual DNS lookup
    // For now, return false to simulate pending verification
    console.log(`Would check TXT record _liquidlab.${domain} for token: ${token}`);
    return false;
  }
}

export const domainManager = new DomainManager();