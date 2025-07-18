import { Express } from 'express';
import { configureSecurityHeaders } from './headers';
import { sanitizeMiddleware } from './validation';
import { apiLimiter, authLimiter, tradingLimiter } from './customRateLimiter';
import { csrfProtection, csrfExemptRoutes } from './csrf';
import { auditLogger, SecurityEventType } from './auditLog';
import { platformCors } from './middleware';

export function configureSecurity(app: Express) {
  // Enable trust proxy with specific configuration for Replit environment
  app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
  
  // 1. CORS configuration - Apply only to non-admin routes
  // Admin routes don't need CORS since they're accessed directly
  // TODO: Fix platformCors middleware async issues
  
  // 2. Security headers
  configureSecurityHeaders(app);
  
  // 3. Input sanitization - Temporarily disabled due to issues
  // TODO: Fix sanitization middleware
  // app.use(sanitizeMiddleware);
  
  // 4. Rate limiting - Apply only to base paths to avoid recursion
  // Don't apply rate limiters to specific routes here - they should be applied in routes.ts
  // This prevents double application of middleware
  
  // 5. CSRF protection - TEMPORARILY DISABLED due to misconfiguration issues
  // TODO: Fix CSRF implementation
  /*
  app.use((req, res, next) => {
    // Skip CSRF for exempt routes (webhooks and admin routes)
    if (csrfExemptRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }
    // Also skip CSRF for admin routes as they use session authentication
    if (req.path.startsWith('/api/admin/')) {
      return next();
    }
    // Skip CSRF for GET requests (they should be safe/idempotent)
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }
    // Ensure session exists before applying CSRF
    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' });
    }
    csrfProtection(req, res, next);
  });
  */
  
  // 6. Audit logging for security events
  app.use('/api/auth/login', async (req, res, next) => {
    res.on('finish', async () => {
      const success = res.statusCode === 200;
      await auditLogger.logRequest(
        req,
        success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
        { email: req.body?.email }
      );
    });
    next();
  });
  
  // 7. Error handling to prevent information leakage
  app.use((err: any, req: any, res: any, next: any) => {
    // Log full error internally
    console.error('Security Error:', err);
    
    // Send generic error to client
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({ error: 'Invalid CSRF token' });
    } else if (err.status === 429) {
      res.status(429).json({ error: 'Too many requests' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}