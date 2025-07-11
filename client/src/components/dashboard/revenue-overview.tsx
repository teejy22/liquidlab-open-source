import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueData } from "@/types";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3
} from "lucide-react";

interface RevenueOverviewProps {
  userId: number;
  period?: '7d' | '30d' | '90d';
}

export default function RevenueOverview({ userId, period = '30d' }: RevenueOverviewProps) {
  const { data: revenue, isLoading, error } = useQuery({
    queryKey: ['/api/revenue', userId, period],
    queryFn: async () => {
      const response = await fetch(`/api/revenue/${userId}?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      return response.json();
    }
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/dashboard', userId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-6 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Failed to load revenue data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = revenue?.reduce((sum: number, record: any) => sum + parseFloat(record.amount), 0) || 0;
  const dailyRevenue = revenue?.filter((r: any) => {
    const recordDate = new Date(r.createdAt);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  }).reduce((sum: number, record: any) => sum + parseFloat(record.amount), 0) || 0;

  const weeklyRevenue = revenue?.filter((r: any) => {
    const recordDate = new Date(r.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  }).reduce((sum: number, record: any) => sum + parseFloat(record.amount), 0) || 0;

  // Calculate growth rates (mock data for demonstration)
  const dailyGrowth = Math.random() * 20 - 10; // -10% to +10%
  const weeklyGrowth = Math.random() * 15 - 5; // -5% to +10%
  const totalGrowth = Math.random() * 25; // 0% to +25%

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Revenue Overview
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              {period}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-liquid-green">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="flex items-center justify-center mt-1">
                  {totalGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(totalGrowth)}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(weeklyRevenue)}
                </div>
                <div className="text-sm text-gray-600">Weekly Revenue</div>
                <div className="flex items-center justify-center mt-1">
                  {weeklyGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(weeklyGrowth)}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(dailyRevenue)}
                </div>
                <div className="text-sm text-gray-600">Daily Revenue</div>
                <div className="flex items-center justify-center mt-1">
                  {dailyGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(dailyGrowth)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Revenue Chart Placeholder */}
            <div className="h-48 bg-gradient-to-r from-liquid-green to-blue-500 rounded-lg opacity-20 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-500 text-sm">Revenue Chart</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              {revenue && revenue.length > 0 ? (
                revenue.slice(0, 10).map((record: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        record.type === 'builder_fee' ? 'bg-liquid-green' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{record.type === 'builder_fee' ? 'Builder Fee' : 'Referral Fee'}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(record.amount)}</div>
                      <Badge variant="outline" className="text-xs">
                        {record.currency}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No revenue records found</p>
                  <p className="text-sm">Start building platforms to generate revenue</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
