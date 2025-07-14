# LiquidLab - Trading Platform Builder

## Overview

LiquidLab is a full-stack web application that allows users to build custom trading platforms on the Hyperliquid DEX using a drag-and-drop interface. Users can create professional trading interfaces without coding, generate revenue through builder codes, and deploy their platforms with custom domains.

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

### Logo Upload Feature
- **File Upload Implementation**: Added multer-based logo upload system with 5MB size limit
- **Supported Formats**: PNG, JPG, JPEG, GIF, and WebP images
- **Upload UI**: Drag-and-drop style upload interface in builder configuration panel
- **Real-time Preview**: Uploaded logos display immediately in platform preview header
- **File Storage**: Logos stored in 'uploads' directory and served statically via Express
- **API Endpoint**: POST /api/upload-logo endpoint handles file uploads
- **Visual Integration**: Logo appears alongside platform name in the preview section

### Builder Simplification
- **Removed Drag-and-Drop**: Eliminated complex drag-and-drop builder functionality
- **Single Template System**: Now offers one professional Hyperliquid-style template
- **Streamlined Configuration**: Simple form for platform name, custom domain, and builder code
- **Automatic Features**: All trading features are pre-included (TradingView, Order Book, Privy, MoonPay)
- **Preview Modes**: Desktop and mobile preview capabilities retained
- **Revenue Display**: Clear 70/30 revenue share information displayed

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