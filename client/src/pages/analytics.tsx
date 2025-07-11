import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Download
} from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard/1'],
    queryFn: async () => {
      // Mock analytics data
      return {
        totalRevenue: "2847.50",
        dailyRevenue: "124.30",
        monthlyRevenue: "1642.80",
        activeUsers: 1234,
        totalVolume: "45200.00",
        platforms: [
          { name: "Pro Trading Platform", revenue: "1234.50", change: "+12.5" },
          { name: "Mobile Trader", revenue: "892.30", change: "+8.3" },
          { name: "DeFi Dashboard", revenue: "721.70", change: "+5.1" }
        ],
        revenueHistory: [
          { date: "2024-01", amount: "890.50" },
          { date: "2024-02", amount: "1240.80" },
          { date: "2024-03", amount: "1680.20" },
          { date: "2024-04", amount: "2100.40" },
          { date: "2024-05", amount: "2350.60" },
          { date: "2024-06", amount: "2847.50" }
        ]
      };
    }
  });

  if (isLoading) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your platform performance and revenue</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics?.totalRevenue}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
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
                <p className="text-sm text-gray-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics?.dailyRevenue}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.activeUsers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.2%</span>
                </div>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">${analytics?.totalVolume}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5.7%</span>
                </div>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-liquid-green">${analytics?.totalRevenue}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics?.activeUsers}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${analytics?.totalVolume}</div>
                    <div className="text-sm text-gray-600">Volume</div>
                  </div>
                </div>
                
                {/* Chart placeholder */}
                <div className="h-48 bg-gradient-to-r from-liquid-green to-blue-500 rounded-lg opacity-20 flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart</p>
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <div className="space-y-3">
                  {analytics?.revenueHistory.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{item.date}</span>
                      <span className="text-sm font-bold">${item.amount}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.platforms.map((platform: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-liquid-green rounded-full mr-3"></div>
                    <span className="text-gray-700">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${platform.revenue}</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      {platform.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Builder Code:</span>
                <Badge variant="outline" className="font-mono">LIQUIDLAB2024</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Commission Rate:</span>
                <span className="font-semibold text-liquid-green">0.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "revenue", message: "Earned $24.50 from Pro Trading Platform", time: "2 hours ago" },
              { type: "user", message: "New user signed up via referral code", time: "4 hours ago" },
              { type: "platform", message: "Mobile Trader platform updated", time: "6 hours ago" },
              { type: "revenue", message: "Earned $12.30 from DeFi Dashboard", time: "8 hours ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'revenue' ? 'bg-green-500' : 
                    activity.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm">{activity.message}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
