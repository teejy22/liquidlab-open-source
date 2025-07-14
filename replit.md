# LiquidLab - Trading Platform Builder

## Overview

LiquidLab is a full-stack web application that allows users to build custom trading platforms on the Hyperliquid DEX using a drag-and-drop interface. Users can create professional trading interfaces without coding, generate revenue through builder codes, and deploy their platforms with custom domains. The main website domain is liquidlab.trade.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **Drag & Drop**: @dnd-kit for building the visual platform builder

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Style**: RESTful API with Express routes
- **Development**: Hot module replacement via Vite middleware

### Key Components

#### Database Schema
- **Users**: Wallet addresses, usernames, builder codes, referral codes
- **Trading Platforms**: User-created platforms with configs and templates
- **Templates**: Pre-built platform layouts and designs
- **Revenue Records**: Tracking builder fees and referral commissions
- **Referrals**: User referral system for additional revenue

#### Trading Integration
- **Hyperliquid Service**: Direct API integration for market data, orderbooks, and trade execution
- **Real-time Data**: WebSocket connections for live market updates
- **Wallet Integration**: MetaMask/Web3 wallet connection for user authentication

#### Visual Builder
- **Single Template System**: Simplified builder with one professional Hyperliquid-style template
- **Configuration Panel**: Platform name, custom domain, and builder code generation
- **Automatic Features**: All trading features pre-included (no assembly required)
- **Preview Modes**: Desktop and mobile preview capabilities
- **Revenue Tracking**: Built-in builder code system for fee distribution

## Data Flow

1. **User Authentication**: Wallet connection establishes user identity
2. **Platform Creation**: Users select templates or build from scratch
3. **Component Configuration**: Drag-and-drop interface for layout design
4. **Trading Integration**: Real-time data from Hyperliquid API
5. **Revenue Tracking**: Builder codes generate fees, stored in revenue records
6. **Deployment**: Platforms can be published with custom domains

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@dnd-kit/core**: Drag and drop functionality
- **@radix-ui/react-***: Accessible UI components
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Trading & Web3
- **Hyperliquid API**: Direct trading and market data integration
- **MetaMask/Ethereum**: Wallet connection and user authentication

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL with connection pooling
- **API Development**: Express server with TypeScript compilation via tsx

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles server TypeScript to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Static Assets**: Served directly from Express in production

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **NODE_ENV**: Determines development vs production behavior
- **REPL_ID**: Replit-specific environment detection

The application uses a monorepo structure with shared types and schemas, enabling type safety between frontend and backend while maintaining clear separation of concerns.

## Recent Changes (January 14, 2025)

### Admin Dashboard Implementation
- **Admin Authentication**: Created separate admin login system at `/admin/login`
  - Admin email: `admin@liquidlab.trade`
  - Admin password: `admin123` (for demo purposes)
  - Separate session management from regular user authentication
- **Admin Dashboard Features**: Comprehensive admin panel at `/admin/dashboard`
  - Total revenue display showing combined earnings from all platforms
  - Revenue breakdown: 30% LiquidLab / 70% Platform Owners clearly displayed
  - Platform management: View all created platforms with owner details and status
  - Transaction history: Complete fee transaction log with volumes and earnings
  - Key metrics: Total users, active platforms, transaction counts
  - Tabbed interface for easy navigation between data views
- **Security**: Admin routes protected with middleware requiring admin authentication
- **Visual Design**: Red-themed admin interface to distinguish from regular user dashboard

## Recent Changes (January 14, 2025)

### Mobile Experience Optimization
- **Trading Interface**: Implemented mobile-responsive tabs for Chart, Order Book, and Trade sections
  - Touch-friendly tab navigation with clear visual indicators
  - Full-width components on mobile devices
  - Proper spacing and padding adjustments
- **Header Optimization**: Reduced header and logo sizes for mobile devices
  - Header height: 64px mobile / 80px desktop (previously 224px)
  - Logo height: 48px mobile / 64px desktop (previously 208px)
  - Improved mobile menu button with hover states and accessibility labels
- **TrustIndicators Component**: Enhanced mobile layout
  - Stacked layout on small screens
  - Responsive flex wrapping for trust badges
  - Better touch targets for Details button
- **Example Trading Page**: Complete mobile overhaul
  - Tabbed interface for space-efficient navigation
  - Mobile-optimized market selector
  - Responsive position details cards
  - Proper price display spacing
- **Navigation**: Added mobile hamburger menu with improved UX
  - Smooth transitions and hover states
  - Touch-friendly tap targets
  - Auto-close on navigation

### MoonPay Affiliate Revenue Update
- **Additional Revenue Stream**: Added MoonPay affiliate commission information to pricing page
- **Revenue Split**: 1% affiliate commission on fiat purchases split 50/50 between platform owner and LiquidLab
- **Earnings Example**: $100,000 in monthly crypto purchases generates $500 for platform owner
- **FAQ Updates**: Added detailed explanations about dual revenue streams (trading fees + MoonPay commissions)
- **Automatic Integration**: MoonPay already built into every platform, no additional setup required

### MoonPay Revenue Dashboard Implementation
- **Database Schema**: Added moonpayTransactions table to track all MoonPay affiliate transactions
  - Tracks purchase amounts, affiliate fees, and revenue splits
  - Separate earnings fields for platform owners and LiquidLab
  - Status tracking for pending/completed transactions
- **API Endpoints**: Created MoonPay revenue tracking endpoints
  - GET /api/moonpay/revenue/:platformId - Platform-specific MoonPay stats
  - GET /api/moonpay/revenue - Total MoonPay revenue across all platforms
  - POST /api/moonpay/record - Record new MoonPay transactions
- **Regular Dashboard Updates**: Platform owners can now see:
  - Trading Fee Earnings (70% share)
  - MoonPay Earnings (50% share)
  - Total Combined Earnings
  - Revenue split breakdown showing both income streams
- **Admin Dashboard Updates**: Comprehensive MoonPay section showing:
  - Total fiat purchases through MoonPay
  - Total affiliate fees generated (1% of purchases)
  - LiquidLab's 50% share of MoonPay revenue
  - Platform owners' 50% share of MoonPay revenue

### Privy Wallet Authentication Integration (January 15, 2025)
- **Automatic Privy Integration**: All trading platforms now include Privy wallet authentication by default
  - Social logins (email, SMS) alongside wallet connections
  - Dark theme customization matching Hyperliquid style
  - Enterprise-grade wallet infrastructure at no additional cost
- **Component Implementation**:
  - Created PrivyProvider component that wraps trading interface
  - WalletConnect button shows connected wallet address with logout functionality
  - Integrated into example trading page template
  - API endpoint `/api/privy/config` securely passes Privy app ID from backend
- **User Benefits**:
  - Traders can connect with MetaMask, WalletConnect, or social accounts
  - Embedded wallet creation for users without existing wallets
  - Secure authentication without platform owners managing private keys
- **Technical Details**:
  - Uses @privy-io/react-auth for frontend integration
  - Privy app ID fetched from server environment variables (PRIVY_APP_ID)
  - PrivyProvider dynamically loads configuration from backend
  - Production platforms will use unique Privy App IDs per platform

### Logo Upload Feature
- **File Upload Implementation**: Added multer-based logo upload system with 5MB size limit
- **Supported Formats**: PNG, JPG, JPEG, GIF, and WebP images
- **Upload UI**: Drag-and-drop style upload interface in builder configuration panel
- **Real-time Preview**: Uploaded logos display immediately in platform preview header
- **File Storage**: Logos stored in 'uploads' directory and served statically via Express
- **API Endpoint**: POST /api/upload-logo endpoint handles file uploads
- **Visual Integration**: Logo appears alongside platform name in the preview section

### Trading Interface Layout Updates (January 14, 2025)
- **Layout Simplification**: Reverted from dropdown market selector back to markets sidebar
  - Markets sidebar remains on the left side with BTC/ETH/SOL pairs
  - Chart positioned in the center with market stats bar
  - Trading form on the right side (orderbook temporarily removed for repositioning)
  - Fixed height containers (450px) to ensure positions area is visible
- **Compact Trading Form**: Streamlined trading interface
  - Removed tabs for spot/cross/isolated trading
  - Smaller input fields and buttons for space efficiency
  - Buy/sell buttons with clear green/red visual states with dark backgrounds
  - Compact leverage selector and order type controls with dark theme
- **Dynamic Logo Display**: Connected uploaded logos to example trading page
  - Example page now fetches the most recent platform data
  - Displays uploaded logo from builder instead of hardcoded logo
  - Platform name and ID are dynamically displayed in verification badge
  - Fallback to default logo if no platform exists

### CORS Fix and Builder Preview Update (January 15, 2025)
- **Builder Preview Enhancement**: Updated builder page to display uploaded logo in the main preview area
  - Replaced static template preview with uploaded logo when available
  - Logo displays on dark background for better visibility
  - Maintains template preview as fallback when no logo is uploaded
- **Market Data CORS Fix**: Resolved runtime error on example trading page
  - Switched from direct CoinGecko API calls to proxy endpoint `/api/prices`
  - Eliminates CORS errors by routing through backend
  - Existing backend endpoint handles all CoinGecko API requests

### EIP-712 Wallet Signing Infrastructure Implementation (January 16, 2025)
- **Complete Hyperliquid Trading Integration**: Implemented full EIP-712 signing infrastructure for real trading
  - Created `hyperliquid-signing.ts` with complete order signing logic using EIP-712 standard
  - Supports all Hyperliquid asset indices (120+ trading pairs)
  - Proper time-in-force options: ALO (Post Only), IOC, GTC
  - Accurate decimal handling for different assets (BTC: 5 decimals, ETH: 5 decimals, etc.)
- **Privy Wallet Integration**: Connected Privy authentication to trading functionality
  - `useHyperliquidTrading` hook manages wallet connection and order signing
  - Fetches real-time user positions and open orders
  - Handles order submission with proper error handling and user feedback
- **Trading Form Component**: Built new `HyperliquidTradeForm` with professional features
  - Buy/Sell toggle with visual states (green/red)
  - Limit/Market order types with Post Only option
  - Leverage selector (1x to 100x)
  - Real-time order value and margin calculations
  - Reduce Only checkbox for position management
- **Live Positions Display**: Created `HyperliquidPositions` component showing real account data
  - Account summary: Total value, margin used, free collateral, total PnL
  - Positions table: Entry/mark/liquidation prices, unrealized PnL, margin usage
  - Real-time updates every 2 seconds
  - Proper formatting for all numeric values
- **Full Trading Flow**: Complete order placement workflow now functional
  - User connects wallet via Privy → Selects market → Sets order parameters
  - Order signed with wallet (EIP-712) → Submitted to Hyperliquid API
  - Positions and account data update automatically
  - Toast notifications for order success/failure
- **Full Trading Flow**: Complete order placement workflow now functional
  - User connects wallet via Privy → Selects market → Sets order parameters
  - Order signed with wallet (EIP-712) → Submitted to Hyperliquid API
  - Positions and account data update automatically
  - Toast notifications for order success/failure

### Builder Simplification
- **Removed Drag-and-Drop**: Eliminated complex drag-and-drop builder functionality
- **Single Template System**: Now offers one professional Hyperliquid-style template
- **Streamlined Configuration**: Simple form for platform name, custom domain, and builder code
- **Automatic Features**: All trading features are pre-included (TradingView, Order Book, Privy, MoonPay)
- **Preview Modes**: Desktop and mobile preview capabilities retained
- **Revenue Display**: Clear 70/30 revenue share information displayed

### Critical Hyperliquid Integration Fix (January 15, 2025)
- **Price Data Issue Resolved**: Fixed critical issue where Hyperliquid's "allMids" endpoint was returning incorrect price units
  - ETH was showing $26 instead of $3,000+
  - BTC was completely missing from the price response
  - All prices were off by significant factors making the platform unusable
- **Solution Implemented**: Created new `/api/hyperliquid/market-prices` endpoint that fetches real-time orderbook data
  - Uses orderbook mid-prices (average of best bid/ask) for accurate USD pricing
  - Fetches prices for main markets: BTC, ETH, SOL, ARB, MATIC, AVAX, BNB, DOGE, SUI, APT
  - Returns properly formatted USD prices (BTC ~$119k, ETH ~$3k, SOL ~$163)
- **HyperliquidMarkets Component**: Updated to use the new accurate pricing endpoint
- **Full DEX Integration**: All platforms now have access to complete Hyperliquid market data and trading functionality
  - Real-time price updates from actual orderbooks
  - Accurate market selection with correct USD values
  - Ready for production trading with real money

### TradingView Chart Integration (January 16, 2025)
- **Professional Charting Solution**: Replaced all custom chart implementations with real TradingView advanced chart widget
  - Full professional charting tools including drawing tools, indicators, and technical analysis
  - Dark theme matching Hyperliquid style with automatic symbol mapping to Binance format
  - Support for all time intervals from 1 minute to daily charts
  - Removed default RSI and MACD indicators for cleaner initial view
  - Users can still add any indicators they want through TradingView's built-in interface

### Markets Sidebar Improvements (January 16, 2025)
- **Compact Design**: Made perp markets column thinner (w-44) and more compact
  - Reduced text sizes to xs and text-[10px] for maximum space efficiency
  - Tighter padding (p-2 and space-y-0.5) throughout
  - Simplified leverage display showing just "5x" instead of "5x leverage"
- **Search Functionality**: Added real-time market search
  - Search input with icon at top of markets list
  - Filters markets by symbol name as you type
- **Hover Effects**: Fixed hover states to change both background and text colors
  - Group hover classes ensure all text elements change color together
- **Custom Scrollbar**: Added black scrollbar styling
  - Thin 6px width scrollbar
  - Black track with dark gray thumb
  - Hover state for better visibility
- **Volume-Based Sorting**: Successfully implemented sorting by 24h trading volume
  - Markets automatically sorted from highest to lowest volume (BTC ~$5.7B, ETH ~$3B, SOL ~$770M)
  - Volume displayed in millions format (e.g., Vol: $5717.3M)
  - Markets without price data show $0.00 instead of loading indicator
  - Fixed volume data extraction from Hyperliquid API using `dayNtlVlm` field
- **Market Data Integration**: Enhanced price fetching from Hyperliquid
  - Fetches mark prices from asset contexts for all markets
  - Orderbook prices for major markets (BTC, ETH, SOL, etc.) for accuracy
  - Volume data properly extracted from `dayNtlVlm` field in asset contexts
- **Text Color Fixes**: Improved visibility of unselected markets
  - Removed light gray text color from unselected markets for better readability
  - Unselected markets now use default white text with hover effects
  - Selected markets maintain white text with blue background highlight

### Centralized Fee Tracking System
- **Single Builder Code**: All platforms now use unified "LIQUIDLAB2025" builder code
- **Fee Collection**: Centralized revenue collection system tracks all platform trades
- **Database Schema**: Added feeTransactions and platformRevenueSummary tables
- **Storage Implementation**: Added comprehensive fee tracking methods:
  - recordFeeTransaction: Records individual trade fees
  - getFeeTransactions: Retrieves platform-specific transactions
  - updateRevenueSummary: Aggregates revenue data by period
  - getAllPlatformRevenues: Returns platform earnings summaries
- **API Endpoints**: New fee tracking endpoints:
  - POST /api/fees/record: Records new fee transactions
  - GET /api/fees/platform/:platformId: Gets platform transactions
  - GET /api/fees/summary/:platformId/:period: Gets revenue summaries
  - GET /api/fees/all-platforms: Gets all platform revenues
- **Revenue Distribution**: Automatic calculation of 70% platform / 30% LiquidLab split

## Recent Changes (January 2025)

### Platform Trust & Security Implementation (January 14, 2025)
- **Trust Indicators Component**: Created comprehensive trust display showing:
  - SSL security status
  - Privy wallet infrastructure
  - LiquidLab verification badge
  - Platform ID for verification
  - Detailed security features and verification instructions
- **Platform Verification Badge**: Hoverable badge showing platform verification status
  - Displays platform name, ID, and verification status
  - Links to liquidlab.com/verify for independent verification
- **Security Footer**: Comprehensive footer with security information
  - Platform details and verification links
  - Trust & compliance indicators
  - Support and documentation links
- **Security Documentation Page**: Created /security page explaining:
  - How to verify trading platforms before connecting wallets
  - Non-custodial architecture details
  - Infrastructure security measures
  - How to report suspicious platforms
- **Database Schema Update**: Added platform verification fields
  - isVerified: Boolean flag for platform verification status
  - verificationDate: Timestamp of verification
  - verificationNotes: Admin notes about verification
- **API Endpoints**: Added platform verification endpoints
  - GET /api/platforms/verify/:platformId - Public verification check
  - POST /api/admin/platforms/:platformId/verify - Admin verification action
- **Example Trading Page Integration**: Updated example page to demonstrate trust features
  - Trust indicators banner at top of page
  - Verification badge in header
  - Security footer with platform details

### Pricing Model Update (January 13, 2025)
- **Fee Structure Redesign**: Updated pricing page to emphasize zero upfront costs with revenue sharing model
  - Spot Trading: 0.2% builder fee (70% to platform owner, 30% to LiquidLab)
  - Perp Trading: 0.1% builder fee (70% to platform owner, 30% to LiquidLab)
  - No setup fees, monthly charges, or hidden costs
  - Platform owners only pay when they earn from actual trades
- **Enhanced FAQ**: Added detailed explanations about earnings potential and fee structures
- **Privy Wallet Infrastructure**: Added prominent section highlighting enterprise wallet integration at $0 extra cost
- **MoonPay Integration**: Added section showcasing automatic fiat on-ramp integration with every platform
  - Supports credit cards, bank transfers in 170+ countries
  - Built-in KYC/AML compliance
  - Platform owners can earn affiliate revenue from transactions

## Recent Changes (January 2025)

### Example Trading Page Enhancements
- **Position Details Section**: Added comprehensive leverage trading information including:
  - Total collateral and free collateral amounts
  - Unrealized PnL with percentage changes
  - Margin ratio with visual progress bar
  - Individual positions table with entry/mark/liquidation prices
  - Mobile-responsive card layout for positions on smaller screens

- **YouTube Video Integration**: Embedded compact MarketBeat video player in trading sidebar
  - Space-efficient design with one main video and quick list
  - Allows traders to watch market analysis while trading
  - Positioned in right column alongside order placement

- **Navigation Improvements**: Added LiquidLab navigation bar to example page
  - Quick links back to main platform (Home, Builder, Templates, Pricing, Dashboard)
  - "Powered by LiquidLab" branding with back arrow for easy return
  - Mobile-friendly responsive design

- **Price Display Fixes**: Resolved mobile spacing issues
  - Asset selector now full width on mobile devices
  - Chart time intervals wrap properly on small screens
  - Responsive padding adjustments across all breakpoints

- **Live Market Data**: Integrated CoinGecko API for real-time prices
  - 30-second auto-refresh intervals
  - Loading states and visual update indicators
  - Proper error handling for API failures

- **UI Refinements**: 
  - Reduced markets column width from w-64 to w-48 for more trading space
  - Reduced order book/trading panel width from w-[420px] to w-[340px] for better balance
  - Fixed buy/sell button styling with consistent green/red color scheme
  - Updated footer logo to new LiquidLab branding with larger size (h-40)

### Domain Migration (January 16, 2025)
- **Updated All Domain References**: Changed all instances of liquidlab.com to liquidlab.trade
  - Main site: liquidlab.trade  
  - App subdomain: app.liquidlab.trade
  - API endpoints: api.liquidlab.trade
  - Platform subdomains: [platform-name].liquidlab.trade
- **Admin Email Update**: Changed admin login email to admin@liquidlab.trade
- **Webhook URLs**: Updated Hyperliquid webhook endpoints to use .trade domain
- **Verification Links**: All platform verification links now point to liquidlab.trade/verify
- **Production Checklist**: Added domain configuration notes with SSL certificate requirements

### Trade Batch Processing Implementation (January 16, 2025)
- **Replaced Webhooks with Batch Processing**: Due to Hyperliquid only offering WebSocket streaming (not webhooks), implemented cost-effective batch processing
  - Automatic processing every 10 minutes via scheduler
  - Manual trigger endpoint at `/api/trades/process-batch` (admin only)
  - Status monitoring at `/api/trades/batch-status`
  - Avoids expensive 24/7 WebSocket connection costs
- **TradeBatchProcessor Service**: Created comprehensive trade processing system
  - Fetches recent trades from Hyperliquid API using getUserFills endpoint
  - Filters for LIQUIDLAB2025 builder code in cloid field
  - Calculates 70/30 revenue split automatically
  - Prevents duplicate processing with timestamp checks
  - Updates platform revenue summaries for all periods
- **Scheduler Service**: Automated job scheduling system
  - Runs trade batch processing every 10 minutes
  - Handles errors gracefully with audit logging
  - Starts automatically when server launches
  - Initial run 5 seconds after server startup
- **Development Mode**: Generates sample trades for testing
  - Creates demo trades with realistic fee calculations
  - Processes trades from 1 hour ago to ensure sample trades are captured
  - Successfully records fee transactions and updates revenue summaries
- **Production Requirements**:
  - Integrate with Privy to fetch wallet addresses for platform owners
  - Connect actual Hyperliquid user fills to LIQUIDLAB2025 builder code
  - Store wallet addresses when users connect through Privy authentication
- **Admin API Endpoints**: 
  - POST `/api/trades/process-batch` - Manually trigger batch processing
  - GET `/api/trades/batch-status` - View recent processing logs

### Crypto Payout System Implementation (January 16, 2025)
- **Complete Blockchain-Based Revenue Distribution**: Built comprehensive crypto payout system for platform owners
  - CryptoPayoutService using ethers.js for Arbitrum network integration
  - USDC transfers for stable, low-fee payouts to platform owners
  - 70% of trading fees distributed weekly to platform owners
  - Automatic payout processing with minimum threshold of $10
- **Database Schema**: Added payoutRecords table to track all crypto payments
  - Tracks platform ID, amount, currency (USDC), transaction hash
  - Status tracking: pending → processing → completed
  - Audit trail for all payout attempts and completions
- **Dashboard Integration**: Added dedicated Payouts tab showing:
  - Pending payouts with amounts and periods
  - Payout history with Arbiscan transaction links
  - Payout settings showing USDC on Arbitrum configuration
  - Weekly payout schedule information
- **API Endpoints**: Created payout management endpoints
  - GET `/api/payouts/platform/:platformId` - View payout history
  - GET `/api/payouts/pending/:platformId` - Check pending payouts
  - POST `/api/payouts/process` - Admin-only payout processing
- **Production Requirements**:
  - PAYOUT_WALLET_PRIVATE_KEY environment variable for payout wallet
  - ARBITRUM_RPC_URL for network connection
  - USDC funding in payout wallet for distributions

### Trust Indicators Enhancement (January 16, 2025)
- **Added Hyperliquid Connection Status**: Enhanced the security bar (TrustIndicators component) to show "Connected to Hyperliquid"
  - Live connection indicator with green pill background
  - Pulsing animation on the connection status icon
  - Clear visual confirmation that the platform is connected to Hyperliquid DEX
  - Tooltip explains "Live connection to Hyperliquid DEX established"

### Custom Domain Support System (January 16, 2025)
- **Domain Management Service**: Created comprehensive domain management system for platform owners
  - domainManager service handles domain operations (add, verify, remove)
  - Domain ownership verification via DNS TXT records
  - Active/pending status tracking for each domain
  - Platform mapping to allow custom domains instead of liquidlab.trade subdomains
- **API Endpoints**: Added domain management endpoints
  - POST /api/platforms/:id/domains - Add custom domain with verification token
  - POST /api/platforms/:id/domains/verify - Check DNS verification status
  - GET /api/platforms/:id/domains - List all domains for a platform
  - DELETE /api/platforms/:id/domains/:domain - Remove custom domain
- **CORS Middleware Update**: Enhanced platformCors to check custom domains
  - Checks static allowed origins first (liquidlab.trade and subdomains)
  - Falls back to database lookup for custom domains
  - Automatic CORS headers for verified custom domains
- **Builder Interface**: Added dedicated Domain tab in platform builder
  - CustomDomainManager component for managing domains
  - Clear instructions for DNS verification process
  - Shows pending/active status for each domain
  - Copy-to-clipboard functionality for DNS records
  - Requires platform to be saved before domain management
- **User Flow**:
  1. Platform owner adds custom domain in builder Domain tab
  2. System generates unique verification token
  3. Owner adds TXT record "_liquidlab" with token to their DNS
  4. Owner clicks "Verify Domain" after DNS propagation
  5. Once verified, platform accessible at custom domain

### Wallet Address Storage for Real Trade Processing (January 16, 2025)
- **Database Update**: Added walletAddress field to users table for storing Privy-connected wallet addresses
- **API Endpoint**: Created `/api/privy/wallet` endpoint to save wallet addresses when users connect
  - Automatically creates or updates user records with wallet addresses
  - Triggered when users connect through Privy authentication
- **WalletConnect Component**: Enhanced to automatically save wallet addresses on connection
  - Sends wallet address and email to backend when user authenticates
  - Enables real trade tracking for each platform owner
- **Trade Batch Processor**: Updated to use real wallet addresses for production
  - Fetches wallet addresses from database for each platform owner
  - Queries Hyperliquid API using actual wallet addresses
  - Filters trades with LIQUIDLAB2025 builder code
  - Processes real trading fees with 70/30 revenue split
- **Automatic Builder Code Integration**: Fixed critical UX issue where users had to manually enter builder code
  - Updated hyperliquid-signing.ts to automatically include `c: 'LIQUIDLAB2025'` in all orders
  - All trades placed through any LiquidLab platform now automatically include the builder code
  - Trade batch processor detects and processes fees without any user action required
- **Production Ready**: System now ready to process real trades automatically
  - Users simply connect wallets and trade normally
  - Builder code "LIQUIDLAB2025" is automatically included in all orders
  - Trade batch runs every 10 minutes to check for new trades
  - Real-time revenue tracking and distribution enabled

### Leverage UI Improvements (January 16, 2025)
- **Leverage Slider Implementation**: Replaced dropdown selector with visual slider interface
  - Smooth sliding experience for selecting leverage from 1x to token's maximum
  - Current leverage value prominently displayed above slider
  - Visual tick marks showing key leverage points
  - Blue-filled slider bar indicating selected leverage level
- **Dynamic Maximum Leverage**: Implemented token-specific leverage limits from Hyperliquid
  - Each market passes its maxLeverage property (e.g., BTC: 50x, ETH: 25x, smaller tokens: 5x-10x)
  - Slider automatically adjusts maximum value when switching between tokens
  - Visual indicators below slider dynamically update (e.g., for 10x max: shows 1x, 3x, 5x, 8x, 10x)
  - Prevents users from exceeding Hyperliquid's allowed leverage for each token
  - Automatic leverage reduction when switching to tokens with lower maximums
- **User Experience**: Seamless leverage management with real-time updates
  - No manual checking of leverage limits required
  - Clear visual feedback on available leverage range
  - Protects traders from accidentally selecting invalid leverage values