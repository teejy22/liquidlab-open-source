import { Express } from 'express';
import { configureSecurityHeaders } from './headers';
import { sanitizeMiddleware } from './validation';
import { apiLimiter, authLimiter, tradingLimiter } from './rateLimiter';
import { csrfProtection, csrfExemptRoutes } from './csrf';
import { auditLogger, SecurityEventType } from './auditLog';

export function configureSecurity(app: Express) {
  // Enable trust proxy for accurate IP detection behind proxies/load balancers
  app.set('trust proxy', true);
  
  // 1. Security headers
  configureSecurityHeaders(app);
  
  // 2. Input sanitization
  app.use(sanitizeMiddleware);
  
  // 3. Rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/trade/', tradingLimiter);
  app.use('/api/hyperliquid/trade', tradingLimiter);
  
  // 4. CSRF protection (temporarily disabled due to configuration issues)
  // TODO: Re-enable CSRF after fixing configuration
  // app.use((req, res, next) => {
  //   if (csrfExemptRoutes.some(route => req.path.startsWith(route))) {
  //     return next();
  //   }
  //   csrfProtection(req, res, next);
  // });
  
  // 5. Audit logging for security events
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
  
  // 6. Error handling to prevent information leakage
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