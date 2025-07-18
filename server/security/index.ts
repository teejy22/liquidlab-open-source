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
  
  // 1. CORS configuration
  app.use('/api/', platformCors);
  
  // 2. Security headers
  configureSecurityHeaders(app);
  
  // 3. Input sanitization
  app.use(sanitizeMiddleware);
  
  // 4. Rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/trade/', tradingLimiter);
  app.use('/api/hyperliquid/trade', tradingLimiter);
  
  // 5. CSRF protection
  app.use((req, res, next) => {
    // Skip CSRF for exempt routes (webhooks)
    if (csrfExemptRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }
    // Skip CSRF for GET requests (they should be safe/idempotent)
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }
    csrfProtection(req, res, next);
  });
  
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