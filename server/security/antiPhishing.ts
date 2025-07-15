import crypto from 'crypto';
import { db } from '../db';
import { tradingPlatforms, platformSecurity } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Generate unique anti-phishing code for each user
export function generateAntiPhishingCode(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Check if domain is legitimate
export async function isLegitimateplatformDomain(domain: string): Promise<boolean> {
  // Check if it's an official LiquidLab domain
  if (domain.endsWith('.liquidlab.trade') || domain === 'liquidlab.trade') {
    return true;
  }
  
  // Check if it's a verified custom domain
  const [platform] = await db
    .select()
    .from(tradingPlatforms)
    .where(eq(tradingPlatforms.customDomain, domain));
    
  return !!platform;
}

// Detect suspicious URLs
export function detectSuspiciousUrl(url: string): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  // Check for homograph attacks (lookalike characters)
  const suspiciousPatterns = [
    /[а-яА-Я]/, // Cyrillic characters
    /[\u4e00-\u9fff]/, // Chinese characters
    /[\u0590-\u05ff]/, // Hebrew characters
    /[\u0600-\u06ff]/, // Arabic characters
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      reasons.push('Contains suspicious unicode characters');
    }
  }
  
  // Check for common phishing patterns
  const phishingPatterns = [
    /liquidlab\.tk/i,
    /liquidlab-trade\./i,
    /liquid-lab\./i,
    /liquidlabs\./i,
    /liquidlab\d+\./i,
    /secure-liquidlab/i,
    /liquidlab-verify/i,
  ];
  
  for (const pattern of phishingPatterns) {
    if (pattern.test(url)) {
      reasons.push('URL matches known phishing pattern');
    }
  }
  
  // Check for URL shorteners
  const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link'];
  for (const shortener of shorteners) {
    if (url.includes(shortener)) {
      reasons.push('Uses URL shortener service');
    }
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

// Email header authentication
export function generateEmailSignature(content: string): string {
  const secret = process.env.EMAIL_SIGNING_SECRET || 'default-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(content)
    .digest('hex');
}

// Add security warning banner for suspicious activity
export function generateSecurityWarningHtml(platformId: number): string {
  return `
    <div style="background-color: #ff0000; color: white; padding: 20px; text-align: center; font-size: 18px;">
      <strong>⚠️ SECURITY WARNING ⚠️</strong><br>
      This platform may be compromised. Please verify at:
      <a href="https://liquidlab.trade/verify/${platformId}" style="color: white; text-decoration: underline;">
        liquidlab.trade/verify/${platformId}
      </a>
    </div>
  `;
}