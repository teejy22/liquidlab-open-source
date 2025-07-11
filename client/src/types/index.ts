export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkId: number | null;
}

export interface TradingPlatformConfig {
  name: string;
  theme: 'light' | 'dark';
  components: ComponentConfig[];
  layout: LayoutConfig;
  settings: PlatformSettings;
}

export interface ComponentConfig {
  id: string;
  type: 'tradingview-chart' | 'orderbook' | 'trade-form' | 'portfolio' | 'market-data';
  position: { x: number; y: number; w: number; h: number };
  settings: Record<string, any>;
}

export interface LayoutConfig {
  type: 'grid' | 'flex';
  columns: number;
  rows: number;
  gap: number;
}

export interface PlatformSettings {
  builderCode: string;
  referralCode: string;
  commissionRate: number;
  customDomain?: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface MarketData {
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  high: string;
  low: string;
  timestamp: number;
}

export interface OrderbookData {
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface RevenueData {
  totalRevenue: string;
  dailyRevenue: string;
  monthlyRevenue: string;
  revenueHistory: {
    date: string;
    amount: string;
  }[];
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  config: TradingPlatformConfig;
  isPublic: boolean;
}

export interface AnalyticsData {
  totalRevenue: string;
  activeUsers: number;
  totalVolume: string;
  platforms: {
    name: string;
    revenue: string;
    change: string;
  }[];
}
