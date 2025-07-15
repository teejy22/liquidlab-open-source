import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { Request, Response } from 'express';

// Password strength requirements
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  const commonPasswords = ['password123', 'admin123', 'liquidlab123', 'trading123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate 2FA secret
export function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `LiquidLab (${email})`,
    issuer: 'LiquidLab',
    length: 32
  });
  
  return secret;
}

// Generate QR code for 2FA
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

// Verify 2FA token
export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps for clock drift
  });
}

// Session security
export function configureSecureSession() {
  return {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutes
      sameSite: 'strict' as const
    }
  };
}

// Track failed login attempts
const loginAttempts = new Map<string, {
  count: number;
  lastAttempt: number;
}>();

export function trackLoginAttempt(identifier: string, success: boolean) {
  const key = identifier.toLowerCase();
  const now = Date.now();
  
  if (success) {
    loginAttempts.delete(key);
    return { locked: false };
  }
  
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: now };
  
  // Reset if last attempt was over 15 minutes ago
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  loginAttempts.set(key, attempts);
  
  // Lock after 5 failed attempts
  const locked = attempts.count >= 5;
  
  return {
    locked,
    remainingAttempts: Math.max(0, 5 - attempts.count),
    lockoutTime: locked ? 15 : 0
  };
}

// Secure password hashing with higher cost factor
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Higher cost factor for better security
}

// IP-based security checks
export function checkSuspiciousIP(req: Request): boolean {
  const ip = req.ip;
  
  // Check for VPN/Proxy headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-forwarded',
    'x-remote-ip',
    'x-remote-addr'
  ];
  
  let suspiciousCount = 0;
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      suspiciousCount++;
    }
  }
  
  // Multiple proxy headers might indicate an attempt to hide origin
  return suspiciousCount > 2;
}