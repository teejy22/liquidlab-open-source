import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  DollarSign, 
  Users, 
  BarChart3, 
  TrendingUp,
  Shield,
  LogOut,
  Building,
  Activity,
  PieChart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    retry: false,
    queryFn: async () => {
      console.log("Fetching admin dashboard...");
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Dashboard fetch failed:", response.status, errorData);
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dashboard data received:", data);
      return data;
    },
  });
  
  // Handle authentication and other errors
  useEffect(() => {
    if (error) {
      console.error("Dashboard fetch error:", error);
      const errorMessage = error?.message || "Could not fetch admin data";
      
      // Always redirect to login on any error for admin dashboard
      toast({
        title: "Authentication Required",
        description: "Please log in as admin to access this page",
        variant: "destructive",
      });
      
      setLocation("/admin/login");
    }
  }, [error, setLocation, toast]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      toast({
        title: "Logged Out",
        description: "Admin session ended successfully",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isChecking || isLoading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-bold">LiquidLab Admin Dashboard</h1>
            </div>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-2 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.stats?.totalRevenue || '0.00'}
                  </p>
                  <p className="text-sm text-green-600">All platforms combined</p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">LiquidLab Revenue (30%)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.stats?.liquidlabRevenue || '0.00'}
                  </p>
                  <p className="text-sm text-purple-600">Platform fees</p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-full">
                  <PieChart className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Owners (70%)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.stats?.platformOwnerRevenue || '0.00'}
                  </p>
                  <p className="text-sm text-blue-600">Distributed earnings</p>
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
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.stats?.userCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">Registered accounts</p>
                </div>
                <div className="bg-gray-500/10 p-3 rounded-full">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Platforms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.stats?.platformCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">Created platforms</p>
                </div>
                <div className="bg-gray-500/10 p-3 rounded-full">
                  <Building className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data Tabs */}
        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms">All Platforms</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Trading Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3">Platform Name</th>
                        <th className="text-left p-3">Owner</th>
                        <th className="text-left p-3">Created</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Domain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.platforms?.map((platform: any) => (
                        <tr key={platform.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{platform.name}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">User #{platform.userId}</p>
                              <p className="text-sm text-gray-500">{platform.payoutWallet || 'No wallet'}</p>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(platform.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Badge variant={platform.isPublished ? "default" : "secondary"}>
                              {platform.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {platform.customDomain || 'No custom domain'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!dashboardData?.platforms || dashboardData.platforms.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No platforms created yet
                    </div>
                  )}
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Platform</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Volume</th>
                        <th className="text-left p-3">Total Fee</th>
                        <th className="text-left p-3">LiquidLab (30%)</th>
                        <th className="text-left p-3">Platform (70%)</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.recentTransactions?.map((tx: any) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 text-sm">Platform #{tx.platformId}</td>
                          <td className="p-3">
                            <Badge variant={tx.tradeType === 'spot' ? 'default' : 'secondary'}>
                              {tx.tradeType === 'spot' ? 'Spot' : 'Perp'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">${parseFloat(tx.tradeVolume).toFixed(2)}</td>
                          <td className="p-3 font-medium">${parseFloat(tx.totalFee).toFixed(4)}</td>
                          <td className="p-3 text-purple-600">${parseFloat(tx.liquidlabFee).toFixed(4)}</td>
                          <td className="p-3 text-blue-600">${parseFloat(tx.platformFee).toFixed(4)}</td>
                          <td className="p-3">
                            <Badge variant={tx.status === 'distributed' ? 'default' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No transactions recorded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3">Platform ID</th>
                        <th className="text-left p-3">Period</th>
                        <th className="text-left p-3">Total Fees</th>
                        <th className="text-left p-3">LiquidLab Earnings (30%)</th>
                        <th className="text-left p-3">Platform Earnings (70%)</th>
                        <th className="text-left p-3">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.revenueSummaries?.map((summary: any) => (
                        <tr key={`${summary.platformId}-${summary.period}`} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">Platform #{summary.platformId}</td>
                          <td className="p-3">
                            <Badge>{summary.period}</Badge>
                          </td>
                          <td className="p-3 font-medium">${parseFloat(summary.totalFees).toFixed(2)}</td>
                          <td className="p-3 text-purple-600">${parseFloat(summary.liquidlabEarnings).toFixed(2)}</td>
                          <td className="p-3 text-blue-600">${parseFloat(summary.platformEarnings).toFixed(2)}</td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(summary.updatedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!dashboardData?.revenueSummaries || dashboardData.revenueSummaries.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No revenue data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}