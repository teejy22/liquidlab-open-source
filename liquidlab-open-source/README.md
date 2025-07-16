# LiquidLab Open Source Components

This repository contains the open source components of the LiquidLab trading platform, focusing on security implementations and non-custodial trading architecture.

## Overview

LiquidLab is a white-label trading platform builder for Hyperliquid DEX. This open source release allows developers and security researchers to verify our security claims and understand how we protect users' funds and data.

## What's Included

### 1. Trading Integration (`src/trading/`)
- **hyperliquid-signing.ts** - EIP-712 order signing implementation
- **hyperliquid.ts** - Hyperliquid API integration
- Shows how orders are signed client-side without exposing private keys
- Demonstrates non-custodial architecture

### 2. Security Implementations (`src/security/`)
- **securityMiddleware.ts** - Rate limiting, CSRF protection, security headers
- **antiPhishing.ts** - Anti-phishing protection and domain verification
- **inputSanitization.ts** - Input validation and XSS prevention
- **auditLogger.ts** - Security event logging

### 3. Trading Components (`src/components/`)
- **HyperliquidTradingInterface.tsx** - Main trading interface
- **HyperliquidTradeForm.tsx** - Order placement form
- **WalletConnect.tsx** - Wallet connection handling
- Shows platform owners cannot inject malicious code

### 4. Verification System (`src/services/`)
- **verificationService.ts** - Platform verification logic
- **securityService.ts** - Security monitoring and threat detection

## Key Security Features

### Non-Custodial Architecture
- Users maintain full control of their wallets
- Private keys never leave the user's device
- All transactions signed client-side using EIP-712

### Immutable Trading Code
- Platform owners can only configure branding and features
- Cannot modify core trading logic or wallet interactions
- All platforms share the same verified codebase

### Security Measures
- Custom rate limiting implementation (no vulnerable dependencies)
- CSRF protection on all state-changing operations
- Input sanitization to prevent XSS attacks
- Anti-phishing protection with verification codes
- Comprehensive audit logging

## Verification

To verify a LiquidLab platform:
1. Check the platform verification code at `liquidlab.trade/verify`
2. Review the source code to understand security implementations
3. Confirm the platform is using the official LiquidLab infrastructure

## Building Trust

This open source release is part of our commitment to transparency. Users with significant portfolios can:
- Audit the non-custodial architecture
- Verify wallet signing happens client-side
- Confirm platform owners cannot modify core trading logic
- Review all security implementations

## License

MIT License - See LICENSE file for details

## Security Disclosure

If you discover a security vulnerability, please email security@liquidlab.trade

## Contributing

We welcome security reviews and suggestions. Please open an issue or submit a pull request.

## Questions?

For questions about the codebase or security architecture, please open an issue in this repository.