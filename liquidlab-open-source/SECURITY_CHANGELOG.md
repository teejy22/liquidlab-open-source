# Security Changelog

## [1.0.2] - 2025-01-17

### Fixed
- **ReDoS (Regular Expression Denial of Service) vulnerability**
  - Fixed polynomial time complexity regex patterns in security scanner
  - Replaced complex regex patterns with simple string matching where possible
  - Added input size limits (10KB max) to prevent DoS attacks
  - Created antiRedos.ts with safe pattern matching implementation
  - Specific fixes:
    - Removed `\s*` repetitions that could cause backtracking
    - Replaced `\w+` with specific event names
    - Replaced `[^>]*` with word boundary checks
    - Split complex patterns into multiple simple checks

- **Missing Rate Limiting on Expensive Operations**
  - Added rate limiting middleware to platform verification endpoint
  - Added specialized upload rate limiter (10 uploads per 15 minutes)
  - Applied rate limiting BEFORE expensive operations like:
    - Database queries
    - File uploads
    - Dynamic imports
    - External API calls
  - Prevents DoS attacks by limiting request frequency at middleware level

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