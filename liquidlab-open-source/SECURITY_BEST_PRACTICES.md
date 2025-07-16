# Security Best Practices for LiquidLab Development

## Rate Limiting

### 1. Apply Rate Limiting at Middleware Level
```javascript
// GOOD: Rate limiting applied BEFORE expensive operations
app.post("/api/platform/verify", rateLimiter, async (req, res) => {
  // Expensive database operations here
});

// BAD: Rate limiting checked after expensive operations
app.post("/api/platform/verify", async (req, res) => {
  const data = await expensiveDatabaseQuery();
  if (!checkRateLimit()) return res.status(429).send("Too many requests");
});
```

### 2. Use Different Rate Limits for Different Operations
- Authentication endpoints: 5-20 attempts per 15 minutes
- File uploads: 10 uploads per 15 minutes  
- General API: 100-500 requests per 15 minutes
- Trading endpoints: 30 requests per minute

## Regular Expression Safety

### 1. Avoid Complex Patterns That Can Cause ReDoS
```javascript
// BAD: Nested quantifiers can cause exponential backtracking
const pattern = /(\w+\s*)+@(\w+\.)+\w+/;

// GOOD: Simple, linear patterns
const emailParts = input.split('@');
const isValidEmail = emailParts.length === 2 && 
                    emailParts[0].match(/^\w+$/) && 
                    emailParts[1].match(/^[\w.]+$/);
```

### 2. Input Size Limits
Always limit input size before regex processing:
```javascript
const MAX_INPUT_SIZE = 10 * 1024; // 10KB
if (input.length > MAX_INPUT_SIZE) {
  throw new Error('Input too large');
}
```

## Database Query Safety

### 1. Use Parameterized Queries
```javascript
// GOOD: Using Drizzle ORM with proper escaping
const user = await db.select().from(users).where(eq(users.id, userId));

// BAD: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

### 2. Validate Input Types
```javascript
// Always validate and parse user input
const platformId = parseInt(req.params.id);
if (isNaN(platformId)) {
  return res.status(400).json({ error: "Invalid platform ID" });
}
```

## File Upload Security

### 1. Validate File Types
```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
```

### 2. Limit File Sizes
```javascript
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### 3. Sanitize Filenames
```javascript
const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
```

## Authentication & Authorization

### 1. Hash Passwords Properly
```javascript
// Use bcrypt with cost factor 12+
const hashedPassword = await bcrypt.hash(password, 12);
```

### 2. Validate Session State
```javascript
// Always check session validity before processing requests
if (!req.session?.userId || !req.session?.isActive) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

## External API Security

### 1. Validate Webhook Signatures
```javascript
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

if (!crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(receivedSignature)
)) {
  throw new Error('Invalid webhook signature');
}
```

### 2. Set Timeouts for External Requests
```javascript
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000) // 5 second timeout
});
```

## General Security Principles

1. **Fail Securely**: Always fail to a secure state
2. **Defense in Depth**: Multiple security layers
3. **Least Privilege**: Grant minimum required permissions
4. **Input Validation**: Never trust user input
5. **Output Encoding**: Sanitize all output
6. **Error Handling**: Don't leak sensitive information in errors

## Security Headers

Always use security headers:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
      // ... other directives
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Secure Logging Practices

### 1. Never Log Sensitive Data
```javascript
// BAD: Logging passwords or tokens
console.log(`User password: ${password}`);
console.log(`API Key: ${apiKey}`);
console.log(`Environment: ${JSON.stringify(process.env)}`);

// GOOD: Log only necessary information
console.log('User authentication successful');
console.log(`API Key used: ${apiKey.substring(0, 8)}...`);
console.log('Environment variables loaded');
```

### 2. Redact Sensitive Information
```javascript
// Create sanitized objects for logging
const sanitizedEvent = {
  type: event.type,
  userId: event.userId,
  timestamp: new Date().toISOString(),
  detailsRedacted: true  // Don't log sensitive details
};
console.log('[AUDIT]', sanitizedEvent);
```

### 3. What NOT to Log
- Passwords or password hashes
- API keys, tokens, or secrets
- Full credit card numbers
- Personal identification numbers
- Database connection strings
- Session tokens
- Private keys

## Monitoring & Logging

1. Log security events (login attempts, failed auth, etc.)
2. Monitor for anomalies
3. Set up alerts for suspicious patterns
4. Regularly review security logs
5. Use structured logging for easier analysis
6. Store logs securely with proper access controls

Remember: Security is not a feature, it's a requirement. Always think about security implications when writing code.