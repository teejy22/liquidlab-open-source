import helmet from 'helmet';
import { Express } from 'express';

export function configureSecurityHeaders(app: Express) {
  try {
    // Create helmet middleware
    const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for TradingView
          "'unsafe-eval'", // Required for some libraries
          "https://s3.tradingview.com",
          "https://static.tradingview.com",
          "https://cdn.hyperliquid.xyz",
          "https://sdk.moonpay.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:*", // Development
          "https://*.replit.dev", // Replit development
          "https://api.hyperliquid.xyz",
          "https://api-hl.hyperliquid.xyz", 
          "https://api.moonpay.com",
          "wss://api.hyperliquid.xyz",
          "https://*.tradingview.com",
          "https://api.coingecko.com",
          "https://auth.privy.io",
          "https://*.privy.io"
        ],
        frameSrc: [
          "'self'",
          "https://www.tradingview.com",
          "https://widget.moonpay.com"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        // Allow iframe embedding from any source in development
        frameAncestors: process.env.NODE_ENV === 'development' ? ["*"] : ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        scriptSrcAttr: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false, // Required for TradingView
    frameguard: {
      action: 'deny' // Protect against clickjacking - CSP frameAncestors will handle embedding rules
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xPermittedCrossDomainPolicies: {
      permittedPolicies: "none"
    }
  });
    
    // Apply Helmet conditionally
    app.use((req, res, next) => {
      // Skip Helmet for certain endpoints
      const skipPaths = [
        '/api/platforms/verify',
        '/api/auth/signin',
        '/api/auth/signup',
        '/api/admin/login'
      ];
      
      if (skipPaths.includes(req.path)) {
        // Set minimal security headers manually for these endpoints
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        return next();
      }
      
      // Apply Helmet for all other requests
      helmetMiddleware(req, res, next);
    });
  } catch (error) {
    console.error('Helmet configuration error:', error);
    // Continue without helmet on error
  }
}