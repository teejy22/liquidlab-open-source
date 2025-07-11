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
- **Drag & Drop Interface**: Component-based builder for creating trading platforms
- **Component Library**: Pre-built trading widgets (charts, orderbooks, trade forms)
- **Template System**: Starting templates for different trading styles
- **Preview Modes**: Desktop and mobile preview capabilities

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