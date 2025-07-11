import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { hyperliquidAPI } from "@/lib/hyperliquid";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface MarketDataProps {
  symbols?: string[];
  height?: number;
  showHeader?: boolean;
}

const DEFAULT_SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'ARB/USD'];

export default function MarketData({ 
  symbols = DEFAULT_SYMBOLS, 
  height = 400, 
  showHeader = true 
}: MarketDataProps) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: marketData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/hyperliquid/market-data'],
    queryFn: () => hyperliquidAPI.getMarketData(),
    refetchInterval: 5000 // Update every 5 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  // Mock market data since we don't have real data structure
  const mockMarketData = {
    'BTC/USD': {
      price: 67845.23,
      change24h: 2.45,
      high24h: 68200.00,
      low24h: 66500.00,
      volume24h: 1250000000
    },
    'ETH/USD': {
      price: 3420.50,
      change24h: -1.20,
      high24h: 3480.00,
      low24h: 3380.00,
      volume24h: 850000000
    },
    'SOL/USD': {
      price: 142.80,
      change24h: 5.67,
      high24h: 145.00,
      low24h: 138.50,
      volume24h: 320000000
    },
    'AVAX/USD': {
      price: 35.60,
      change24h: -0.85,
      high24h: 36.20,
      low24h: 35.10,
      volume24h: 180000000
    },
    'ARB/USD': {
      price: 0.85,
      change24h: 3.24,
      high24h: 0.87,
      low24h: 0.82,
      volume24h: 95000000
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Market Data
              </div>
              <Skeleton className="h-6 w-20" />
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Market Data
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Failed to load market data</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" style={{ height }}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Market Data
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: height - 120 }}>
          {symbols.map((symbol) => {
            const data = mockMarketData[symbol as keyof typeof mockMarketData];
            if (!data) return null;

            const isPositive = data.change24h >= 0;

            return (
              <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-semibold text-gray-900">{symbol}</div>
                    <div className="text-sm text-gray-600">
                      Vol: {formatVolume(data.volume24h)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatPrice(data.price)}
                  </div>
                  <div className={`text-sm flex items-center ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(data.change24h)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Market Cap</div>
              <div className="font-semibold">$2.4T</div>
            </div>
            <div>
              <div className="text-gray-600">24h Volume</div>
              <div className="font-semibold">$86.5B</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
