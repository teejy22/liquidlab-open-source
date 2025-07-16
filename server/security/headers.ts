import helmet from 'helmet';
import { Express } from 'express';

export function configureSecurityHeaders(app: Express) {
  // Basic security headers
  app.use(helmet({
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
          "https://api.coingecko.com"
        ],
        frameSrc: [
          "'self'",
          "https://www.tradingview.com",
          "https://widget.moonpay.com"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
        // frameAncestors removed in development to allow iframe embedding
      }
    },
    crossOriginEmbedderPolicy: false, // Required for TradingView
    frameguard: false, // Completely disable frameguard to allow iframe embedding
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Additional security headers (X-Frame-Options handled by Helmet frameguard)
  app.use((req, res, next) => {
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });
}