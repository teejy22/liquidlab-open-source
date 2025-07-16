# Security Changelog

## [1.0.1] - 2025-01-17

### Fixed
- **CVE-2023-42282 (ip package SSRF vulnerability)**
  - Replaced `express-rate-limit` dependency with custom rate limiting implementation
  - Custom implementation in `src/security/customRateLimiter.ts` removes dependency on vulnerable `ip` package
  - No functionality changes - same rate limiting behavior without security vulnerabilities
  
### Security Notes
- The `ip` package versions ≤2.0.1 improperly categorize some IP addresses (like 127.1, ::fFFf:127.0.0.1) as globally routable
- This could potentially allow SSRF attacks in certain configurations
- Our custom implementation uses standard Node.js methods for IP detection without the vulnerable dependency

## [1.0.0] - 2025-01-17

### Initial Release
- Open source release of LiquidLab trading platform security components
- Non-custodial wallet architecture
- EIP-712 transaction signing
- Comprehensive security measures