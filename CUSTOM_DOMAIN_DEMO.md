# Custom Domain Feature Demo

## How to Test the Custom Domain Feature

### 1. Access the Builder
- Navigate to http://localhost:5000/builder
- Log in if you haven't already

### 2. Create/Save a Platform
- Enter a platform name (e.g., "My Trading Platform")
- Enter your wallet address for payouts
- Click "Save Platform"

### 3. Access the Domain Tab
- After saving, you'll see three tabs: Basic, Revenue, and Domain
- Click on the "Domain" tab

### 4. Add a Custom Domain
- Enter your domain (e.g., "trading.mycompany.com")
- Click "Add Domain"
- The system will generate a verification token

### 5. Domain Verification Process
You'll see instructions like:
```
Type: TXT
Name: _liquidlab
Value: liquidlab-verify-[unique-token]
```

To verify ownership:
1. Add this TXT record to your domain's DNS settings
2. Wait for DNS propagation (usually 5-10 minutes)
3. Click "Verify Domain"

### 6. Active Domain
Once verified:
- The domain status changes from "pending" to "active"
- Your platform will be accessible at your custom domain
- CORS headers are automatically configured

## Features Included:

✓ **Domain Management UI**: Clean interface in the builder
✓ **DNS Verification**: Secure ownership verification via TXT records
✓ **Multiple Domains**: Support for multiple custom domains per platform
✓ **CORS Support**: Automatic CORS configuration for verified domains
✓ **Status Tracking**: Clear pending/active status indicators
✓ **Easy Removal**: Remove domains with one click

## API Endpoints for Testing:

### Add Domain
```bash
POST /api/platforms/{platformId}/domains
{
  "domain": "yourdomain.com"
}
```

### Verify Domain
```bash
POST /api/platforms/{platformId}/domains/verify
{
  "domain": "yourdomain.com"
}
```

### List Domains
```bash
GET /api/platforms/{platformId}/domains
```

### Remove Domain
```bash
DELETE /api/platforms/{platformId}/domains/{domain}
```

## Current Implementation Status:
- ✅ Domain management service
- ✅ API endpoints with authentication
- ✅ CORS middleware integration
- ✅ Builder UI with Domain tab
- ✅ DNS verification system
- ⏳ Actual DNS lookup (currently returns false for testing)
- ⏳ SSL certificate provisioning (needs production setup)
- ⏳ Domain routing configuration (needs DNS/proxy setup)

The core functionality is ready. In production, you would need to:
1. Implement actual DNS record checking
2. Set up wildcard SSL certificates
3. Configure your DNS/proxy to route custom domains to your platform