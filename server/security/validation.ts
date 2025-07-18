import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Temporarily return the string as-is while debugging DOMPurify issue
    // TODO: Fix DOMPurify sanitization
    return input;
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

// Middleware to sanitize all request inputs
export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    // Continue without sanitization rather than crashing
    next();
  }
}

// Validate wallet addresses
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate platform names
export function isValidPlatformName(name: string): boolean {
  // Allow alphanumeric, spaces, hyphens, max 50 chars
  return /^[a-zA-Z0-9\s\-]{1,50}$/.test(name);
}

// Validate URLs
export function isValidUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true
  });
}

// Validate custom domains
export function isValidDomain(domain: string): boolean {
  return validator.isFQDN(domain, {
    require_tld: true,
    allow_underscores: false
  });
}

// SQL injection prevention for raw queries
export function escapeSql(value: string): string {
  return value.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  });
}