import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { walletService } from "@/lib/wallet";
import { hyperliquidAPI } from "@/lib/hyperliquid";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";

interface PortfolioProps {
  height?: number;
  showHeader?: boolean;
}

export default function Portfolio({ height = 400, showHeader = true }: PortfolioProps) {
  const [refreshing, setRefreshing] = useState(false);
  const walletState = walletService.getWalletState();

  const { data: userState, isLoading, refetch } = useQuery({
    queryKey: ['/api/hyperliquid/user-state', walletState.address],
    queryFn: () => hyperliquidAPI.getUserState(walletState.address!),
    enabled: !!walletState.address,
    refetchInterval: 10000 // Update every 10 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatQuantity = (qty: string | number) => {
    return parseFloat(qty.toString()).toFixed(6);
  };

  if (!walletState.isConnected) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Portfolio
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
            <p className="text-gray-600 mb-4">
              Connect your wallet to view your portfolio
            </p>
            <Button 
              onClick={() => walletService.connectWallet()}
              className="bg-liquid-green text-white hover:bg-liquid-accent"
            >
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Portfolio
              </div>
              <Skeleton className="h-6 w-20" />
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-6 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock portfolio data since we don't have real user state
  const mockPortfolio = {
    totalValue: 15420.50,
    totalPnl: 1240.30,
    totalPnlPercent: 8.75,
    availableBalance: 5240.80,
    positions: [
      {
        symbol: 'BTC/USD',
        side: 'long',
        size: 0.5,
        entryPrice: 45000,
        currentPrice: 47500,
        pnl: 1250,
        pnlPercent: 5.56
      },
      {
        symbol: 'ETH/USD',
        side: 'long',
        size: 5.2,
        entryPrice: 2800,
        currentPrice: 2950,
        pnl: 780,
        pnlPercent: 5.36
      },
      {
        symbol: 'SOL/USD',
        side: 'short',
        size: 100,
        entryPrice: 85,
        currentPrice: 82,
        pnl: 300,
        pnlPercent: 3.53
      }
    ]
  };

  return (
    <Card className="w-full" style={{ height }}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Portfolio
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(mockPortfolio.totalValue)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(mockPortfolio.totalPnl)}
                </div>
                <div className="text-sm text-gray-600">Total P&L</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center">
                  {mockPortfolio.totalPnlPercent >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xl font-bold ${
                    mockPortfolio.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(mockPortfolio.totalPnlPercent)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">P&L %</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(mockPortfolio.availableBalance)}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Recent Activity</h4>
              {[
                { type: 'trade', message: 'Bought 0.1 BTC at $47,000', time: '2 hours ago' },
                { type: 'pnl', message: 'Realized P&L: +$250 on ETH/USD', time: '4 hours ago' },
                { type: 'trade', message: 'Sold 50 SOL at $82', time: '6 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'trade' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm">{activity.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-3 mt-4">
            {mockPortfolio.positions.length > 0 ? (
              mockPortfolio.positions.map((position, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                        {position.side.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{position.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(position.pnl)}
                      </div>
                      <div className={`text-sm ${
                        position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(position.pnlPercent)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <div className="text-xs">Size</div>
                      <div className="font-medium">{formatQuantity(position.size)}</div>
                    </div>
                    <div>
                      <div className="text-xs">Entry</div>
                      <div className="font-medium">{formatCurrency(position.entryPrice)}</div>
                    </div>
                    <div>
                      <div className="text-xs">Current</div>
                      <div className="font-medium">{formatCurrency(position.currentPrice)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active positions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
