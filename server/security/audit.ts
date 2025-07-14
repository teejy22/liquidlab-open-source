import { auditLogs, type InsertAuditLog } from '@shared/schema';
import { db } from '../db';
import { and, eq, gte, desc } from 'drizzle-orm';

// Create an audit log entry
export async function createAuditLog(data: InsertAuditLog): Promise<void> {
  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the application
  }
}

// Get audit logs for a platform
export async function getPlatformAuditLogs(
  platformId: number,
  options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    action?: string;
  } = {}
): Promise<any[]> {
  const { limit = 100, offset = 0, startDate, action } = options;

  const conditions = [eq(auditLogs.platformId, platformId)];
  
  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, startDate));
  }
  
  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  return await db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

// Get user audit logs
export async function getUserAuditLogs(
  userId: number,
  options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
  } = {}
): Promise<any[]> {
  const { limit = 100, offset = 0, startDate } = options;

  const conditions = [eq(auditLogs.userId, userId)];
  
  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, startDate));
  }

  return await db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

// Common audit log actions
export const AuditActions = {
  // Authentication
  API_AUTH_SUCCESS: 'api_auth_success',
  API_AUTH_FAILED: 'api_auth_failed',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Platform management
  PLATFORM_CREATED: 'platform_created',
  PLATFORM_UPDATED: 'platform_updated',
  PLATFORM_DELETED: 'platform_deleted',
  
  // API Key management
  API_KEY_CREATED: 'api_key_created',
  API_KEY_REVOKED: 'api_key_revoked',
  
  // Trading
  ORDER_PLACED: 'order_placed',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_FILLED: 'order_filled',
  
  // Errors
  API_ERROR: 'api_error',
  SYSTEM_ERROR: 'system_error',
};