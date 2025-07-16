# Security Architecture

This document explains the security architecture of LiquidLab trading platforms.

## Core Principles

### 1. Non-Custodial Architecture
- Private keys never leave the user's device
- All transactions are signed client-side using EIP-712
- Platform has no access to user funds

### 2. Immutable Trading Code
- Platform owners cannot modify core trading logic
- All platforms share the same verified codebase
- Only configuration (branding, features) can be customized

### 3. Defense in Depth
Multiple layers of security protect users and platforms:

## Security Layers

### Client-Side Security

#### EIP-712 Order Signing
- Orders are signed using the EIP-712 standard
- Signing happens entirely in the browser
- Private keys are managed by wallet providers (MetaMask, etc.)
- See: `src/trading/hyperliquid-signing.ts`

#### Input Validation
- All user inputs sanitized before processing
- XSS prevention using DOMPurify
- SQL injection prevention
- See: `src/security/validation.ts`

### Server-Side Security

#### Rate Limiting
- General API: 500 requests per 15 minutes
- Authentication: 20 attempts per 15 minutes
- Trading endpoints: 30 requests per minute
- See: `src/security/rateLimiter.ts`

#### Security Headers
- Content Security Policy (CSP)
- HSTS with preloading
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- See: `src/security/headers.ts`

#### Audit Logging
- All security events logged
- Login attempts tracked
- Trade execution logged
- Admin actions recorded
- See: `src/security/auditLog.ts`

### Platform Verification

#### Verification Codes
- Each platform gets unique 8-character code
- Codes rotate every 24 hours
- Users can verify at liquidlab.trade/verify
- See: `src/services/verification.ts`

#### Security Monitoring
- Real-time content scanning
- Risk scoring system
- Automatic suspension for high-risk platforms
- See: `src/services/security.ts`

## Attack Prevention

### Phishing Protection
- Domain verification
- Homograph attack detection
- URL shortener blocking
- Security warning banners

### API Security
- CSRF protection on state-changing operations
- Webhook signature verification
- API key authentication with SHA-256 hashing

### Trading Security
- Order validation before execution
- Leverage limits enforced
- Position size checks
- Slippage protection

## Best Practices for Users

1. **Always verify platform codes** before connecting wallet
2. **Use hardware wallets** for large portfolios
3. **Enable 2FA** on platform accounts
4. **Check domain legitimacy** (should be *.liquidlab.trade)
5. **Never share private keys** with anyone

## Security Disclosure

If you discover a vulnerability, please email security@liquidlab.trade with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact information

We take security seriously and will respond within 48 hours.