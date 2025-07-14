import { randomBytes, createHash } from 'crypto';
import { apiKeys, type InsertApiKey, type ApiKey } from '@shared/schema';
import { db } from '../db';
import { eq, and, gt, or } from 'drizzle-orm';

// Generate a secure API key and secret
export function generateApiKeyPair() {
  const key = `llk_${randomBytes(24).toString('hex')}`; // llk = LiquidLab Key
  const secret = `lls_${randomBytes(32).toString('hex')}`; // lls = LiquidLab Secret
  const secretHash = hashSecret(secret);
  
  return { key, secret, secretHash };
}

// Hash the secret for storage
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

// Validate API key and secret
export async function validateApiKey(
  key: string, 
  secret: string
): Promise<{ valid: boolean; apiKey?: ApiKey }> {
  try {
    // Find the API key
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.key, key),
          eq(apiKeys.revokedAt, null),
          or(
            eq(apiKeys.expiresAt, null),
            gt(apiKeys.expiresAt, new Date())
          )
        )
      );

    if (!apiKey) {
      return { valid: false };
    }

    // Verify the secret
    const secretHash = hashSecret(secret);
    if (apiKey.secretHash !== secretHash) {
      return { valid: false };
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    return { valid: true, apiKey };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false };
  }
}

// Create a new API key for a platform
export async function createApiKey(
  platformId: number,
  name?: string,
  permissions: string[] = ['read', 'write'],
  expiresIn?: number // days
): Promise<{ apiKey: ApiKey; secret: string }> {
  const { key, secret, secretHash } = generateApiKeyPair();
  
  const apiKeyData: InsertApiKey = {
    platformId,
    key,
    secretHash,
    name: name || 'Default API Key',
    permissions,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null,
  };

  const [apiKey] = await db
    .insert(apiKeys)
    .values(apiKeyData)
    .returning();

  return { apiKey, secret };
}

// Revoke an API key
export async function revokeApiKey(keyId: number): Promise<boolean> {
  try {
    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, keyId));
    
    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

// Get all API keys for a platform
export async function getPlatformApiKeys(platformId: number): Promise<ApiKey[]> {
  return await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.platformId, platformId),
        eq(apiKeys.revokedAt, null)
      )
    );
}