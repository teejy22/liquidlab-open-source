import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// Configure CSRF protection
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to add CSRF token to response locals
export const addCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  res.locals.csrfToken = req.csrfToken?.();
  next();
};

// Exempt certain routes from CSRF protection (e.g., webhooks)
export const csrfExemptRoutes = [
  '/api/webhooks/hyperliquid',
  '/api/webhooks/moonpay',
  '/api/moonpay/webhook',
  '/api/platforms/verify',  // Public verification endpoint
  '/api/auth/signin',       // Authentication endpoints
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/admin/login',
  '/api/admin/logout',
  '/api/upload-logo',       // File upload endpoint (multipart/form-data)
  '/api/csrf-token'         // CSRF token generation endpoint
];