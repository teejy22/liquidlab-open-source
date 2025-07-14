import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Plus, 
  ExternalLink,
  Settings,
  Eye,
  Receipt,
  PieChart,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: platforms, isLoading: platformsLoading } = useQuery({
    queryKey: ['/api/platforms', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/platforms?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch platforms');
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard/1'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/dashboard/1');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Fee tracking queries
  const { data: platformRevenues } = useQuery({
    queryKey: ['/api/fees/all-platforms'],
    queryFn: async () => {
      const response = await fetch('/api/fees/all-platforms?period=monthly');
      if (!response.ok) throw new Error('Failed to fetch revenues');
      return response.json();
    }
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/fees/platform/1'],
    queryFn: async () => {
      const response = await fetch('/api/fees/platform/1?limit=10');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  // MoonPay revenue query
  const { data: moonpayRevenue } = useQuery({
    queryKey: ['/api/moonpay/revenue/1'],
    queryFn: async () => {
      const response = await fetch('/api/moonpay/revenue/1');
      if (!response.ok) throw new Error('Failed to fetch MoonPay revenue');
      return response.json();
    }
  });

  // Payout queries
  const { data: payoutHistory } = useQuery({
    queryKey: ['/api/payouts/platform/1'],
    queryFn: async () => {
      const response = await fetch('/api/payouts/platform/1');
      if (!response.ok) throw new Error('Failed to fetch payout history');
      return response.json();
    }
  });

  const { data: pendingPayouts } = useQuery({
    queryKey: ['/api/payouts/pending/1'],
    queryFn: async () => {
      const response = await fetch('/api/payouts/pending/1');
      if (!response.ok) throw new Error('Failed to fetch pending payouts');
      return response.json();
    }
  });

  if (authLoading || platformsLoading || analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/builder">
          <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
            <Plus className="w-4 h-4 mr-2" />
            New Platform
          </Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Earnings (70%)</p>
                <p className="text-2xl font-bold text-gray-900">$1,993</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-blue-600">+8.3% from last month</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trading Volume</p>
                <p className="text-2xl font-bold text-gray-900">$45.2K</p>
                <p className="text-sm text-purple-600">+15.2% from last month</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platforms</p>
                <p className="text-2xl font-bold text-gray-900">{platforms?.length || 0}</p>
                <p className="text-sm text-orange-600">+2 this month</p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Platforms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Platforms</span>
              <Link href="/builder">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platforms && platforms.length > 0 ? (
              <div className="space-y-4">
                {platforms.map((platform: any) => (
                  <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-liquid-green/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-liquid-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-600">
                          {platform.isPublished ? 'Published' : 'Draft'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={platform.isPublished ? 'default' : 'secondary'}>
                        {platform.isPublished ? 'Live' : 'Draft'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No platforms yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first trading platform to start earning revenue
                </p>
                <Link href="/builder">
                  <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
                    Create Your First Platform
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Builder Code Info */}
        <Card>
          <CardHeader>
            <CardTitle>Builder Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">LiquidLab Builder Code</p>
                  <p className="font-mono text-lg font-semibold">LIQUIDLAB2025</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("LIQUIDLAB2025");
                  }}
                >
                  Copy
                </Button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Revenue Split</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-lg font-semibold text-liquid-green">70%</p>
                      <p className="text-xs text-gray-600">To Platform Owners</p>
                    </div>
                    <div className="text-gray-400">|</div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">30%</p>
                      <p className="text-xs text-gray-600">To LiquidLab</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">How it works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Users pay your commission rate on top of base trading fees</li>
                  <li>• Revenue is automatically collected and tracked</li>
                  <li>• Withdraw earnings anytime to your connected wallet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Tracking Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fee Tracking & Revenue</h2>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="platforms">Platform Revenues</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Trading Fee Earnings (70%)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(platformRevenues?.reduce((sum: number, r: any) => sum + parseFloat(r.totalFees || 0), 0) * 0.70).toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-green-600">Your share from trades</p>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-full">
                      <Receipt className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">MoonPay Earnings (50%)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${moonpayRevenue?.platformEarnings || '0.00'}
                      </p>
                      <p className="text-sm text-purple-600">From fiat purchases</p>
                    </div>
                    <div className="bg-purple-500/10 p-3 rounded-full">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Combined Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${((platformRevenues?.reduce((sum: number, r: any) => sum + parseFloat(r.totalFees || 0), 0) * 0.70) + parseFloat(moonpayRevenue?.platformEarnings || '0')).toFixed(2)}
                      </p>
                      <p className="text-sm text-blue-600">Trading + MoonPay</p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-full">
                      <PieChart className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Split Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Spot Trading</p>
                      <p className="text-sm text-gray-600">0.2% builder fee on volume</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">70% / 30%</p>
                      <p className="text-sm text-gray-600">Platform / LiquidLab</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Perpetual Trading</p>
                      <p className="text-sm text-gray-600">0.1% builder fee on volume</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">70% / 30%</p>
                      <p className="text-sm text-gray-600">Platform / LiquidLab</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold">MoonPay Fiat Purchases</p>
                      <p className="text-sm text-gray-600">1% affiliate commission</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">50% / 50%</p>
                      <p className="text-sm text-gray-600">Platform / LiquidLab</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">MoonPay Stats</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Total Fiat Purchases: ${moonpayRevenue?.totalPurchases || '0.00'}
                    </p>
                    <p className="text-xs text-blue-700">
                      Your Earnings: ${moonpayRevenue?.platformEarnings || '0.00'} (50% of fees)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Fee Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions && recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{tx.tradeType === 'spot' ? 'Spot' : 'Perp'} Trade</p>
                          <p className="text-sm text-gray-600">Volume: ${parseFloat(tx.tradeVolume).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${parseFloat(tx.totalFee).toFixed(4)}</p>
                          <Badge variant={tx.status === 'distributed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">
                      Fee transactions will appear here once platforms start generating trades
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {platformRevenues && platformRevenues.length > 0 ? (
                  <div className="space-y-2">
                    {platformRevenues.map((revenue: any) => (
                      <div key={revenue.platformId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">Platform #{revenue.platformId}</p>
                          <p className="text-sm text-gray-600">
                            {revenue.tradeCount} trades · ${parseFloat(revenue.totalVolume).toFixed(2)} volume
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${parseFloat(revenue.platformEarnings).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">Platform earnings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No revenue data yet</h3>
                    <p className="text-gray-600">
                      Revenue summaries will appear here as platforms generate trading fees
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Payouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pending Payouts</span>
                    <Badge variant="secondary">Weekly</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingPayouts && pendingPayouts.length > 0 ? (
                    <div className="space-y-3">
                      {pendingPayouts.map((payout: any, index: number) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-green-900">${payout.amount}</p>
                            <Badge className="bg-green-600">{payout.period}</Badge>
                          </div>
                          <p className="text-sm text-green-700">
                            Next payout scheduled for end of period
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <DollarSign className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No pending payouts</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Payouts are processed weekly for amounts over $10
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payout Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Payout Method</p>
                      <p className="font-semibold">USDC on Arbitrum</p>
                      <p className="text-xs text-gray-500 mt-1">Low fees, fast transfers</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Minimum Payout</p>
                      <p className="font-semibold">$10.00</p>
                      <p className="text-xs text-gray-500 mt-1">Reduces transaction costs</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
                      <p className="font-semibold">Weekly</p>
                      <p className="text-xs text-gray-500 mt-1">Every Monday at 00:00 UTC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutHistory && payoutHistory.length > 0 ? (
                  <div className="space-y-2">
                    {payoutHistory.map((payout: any) => (
                      <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">${payout.amount} {payout.currency}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payout.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                            {payout.status}
                          </Badge>
                          {payout.txHash && (
                            <a 
                              href={`https://arbiscan.io/tx/${payout.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline block mt-1"
                            >
                              View on Arbiscan
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payouts yet</h3>
                    <p className="text-gray-600">
                      Your payout history will appear here once you receive your first payment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
