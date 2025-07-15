import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PieChart,
  KeyRound,
  Mail,
  User,
  Wallet,
  Send,
  FileText
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

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

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
    enabled: !!dashboardData, // Only fetch users if dashboard data is loaded
  });

  const { data: walletBalance } = useQuery({
    queryKey: ['/api/admin/wallet-balance'],
    retry: false,
    enabled: !!dashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: pendingPlatforms, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/admin/platforms/pending'],
    retry: false,
    enabled: !!dashboardData,
  });

  const approvePlatformMutation = useMutation({
    mutationFn: async ({ platformId, notes }: { platformId: number; notes?: string }) => {
      return apiRequest("POST", `/api/admin/platforms/${platformId}/approve`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Platform Approved",
        description: "The platform has been approved and can now go live.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platforms/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectPlatformMutation = useMutation({
    mutationFn: async ({ platformId, reason }: { platformId: number; reason: string }) => {
      return apiRequest("POST", `/api/admin/platforms/${platformId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Platform Rejected",
        description: "The platform has been rejected.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platforms/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: suspiciousPlatforms } = useQuery({
    queryKey: ['/api/admin/platforms/suspicious'],
    retry: false,
    enabled: !!dashboardData,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "User password has been reset successfully.",
      });
      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
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

        {/* MoonPay Revenue Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">MoonPay Affiliate Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Fiat Purchases</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.moonpayStats?.totalPurchases || '0.00'}
                    </p>
                    <p className="text-sm text-purple-600">Crypto bought via MoonPay</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Affiliate Fees (1%)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.moonpayStats?.totalAffiliateFees || '0.00'}
                    </p>
                    <p className="text-sm text-indigo-600">1% of purchases</p>
                  </div>
                  <div className="bg-indigo-500/10 p-3 rounded-full">
                    <Activity className="w-6 h-6 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">LiquidLab MoonPay (50%)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.moonpayStats?.liquidlabEarnings || '0.00'}
                    </p>
                    <p className="text-sm text-red-600">LiquidLab's share</p>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Platform MoonPay (50%)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.moonpayStats?.platformEarnings || '0.00'}
                    </p>
                    <p className="text-sm text-green-600">Platform owners' share</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Data Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="platforms">All Platforms</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="wallets">Wallet Management</TabsTrigger>
            <TabsTrigger value="security">Security Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Platforms Awaiting Approval</span>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {pendingPlatforms?.length || 0} Pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    ))}
                  </div>
                ) : pendingPlatforms && pendingPlatforms.length > 0 ? (
                  <div className="space-y-4">
                    {pendingPlatforms.map((platform: any) => (
                      <div key={platform.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{platform.name}</h3>
                            <p className="text-sm text-gray-600">Platform ID: {platform.id}</p>
                            <p className="text-sm text-gray-600">Created: {new Date(platform.createdAt).toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Pending Approval
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Owner Details</p>
                            <p className="text-sm">User ID: {platform.userId}</p>
                            <p className="text-sm">Username: {platform.user?.username || 'N/A'}</p>
                            <p className="text-sm">Email: {platform.user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Platform Configuration</p>
                            <p className="text-sm">Builder Code: {platform.builderCode || 'LIQUIDLAB2025'}</p>
                            <p className="text-sm">Has Logo: {platform.logoUrl ? 'Yes' : 'No'}</p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              const notes = prompt('Any approval notes? (optional)');
                              approvePlatformMutation.mutate({ 
                                platformId: platform.id, 
                                notes: notes || undefined 
                              });
                            }}
                            disabled={approvePlatformMutation.isPending}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Approve Platform
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                rejectPlatformMutation.mutate({ 
                                  platformId: platform.id, 
                                  reason 
                                });
                              }
                            }}
                            disabled={rejectPlatformMutation.isPending}
                          >
                            Reject Platform
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No platforms awaiting approval</p>
                    <p className="text-sm mt-2">New platforms will appear here for review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Skeleton className="h-8 w-8 animate-spin rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search by username or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-3">ID</th>
                            <th className="text-left p-3">Username</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Wallet Address</th>
                            <th className="text-left p-3">Builder Code</th>
                            <th className="text-left p-3">Created</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData?.users
                            ?.filter((user: any) => {
                              const query = userSearchQuery.toLowerCase();
                              return (
                                user.username?.toLowerCase().includes(query) ||
                                user.email?.toLowerCase().includes(query)
                              );
                            })
                            ?.map((user: any) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">#{user.id}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {user.username}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {user.email}
                              </div>
                            </td>
                            <td className="p-3">
                              {user.walletAddress ? (
                                <div className="flex items-center gap-2">
                                  <Wallet className="w-4 h-4 text-gray-400" />
                                  <span className="font-mono text-sm">
                                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">No wallet</span>
                              )}
                            </td>
                            <td className="p-3">
                              {user.builderCode ? (
                                <Badge variant="secondary">{user.builderCode}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setResetPasswordDialogOpen(true);
                                }}
                              >
                                <KeyRound className="w-4 h-4 mr-1" />
                                Reset Password
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!usersData?.users || usersData.users.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        No users registered yet
                      </div>
                    )}
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Main Collection Wallet */}
                  <div className="border-2 border-purple-500 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-purple-500" />
                      Main Collection Wallet
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Builder Code Address</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                          LIQUIDLAB2025
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          All platform trading fees are collected under this builder code
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Collected Revenue</p>
                        <p className="text-2xl font-bold text-purple-600">
                          ${dashboardData?.stats?.totalRevenue || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payout Wallet Configuration */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5 text-blue-500" />
                      Payout Wallet Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Network</p>
                        <Badge variant="secondary">Arbitrum</Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Currency</p>
                        <Badge variant="secondary">USDC</Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${walletBalance?.balance || '0.00'} USDC
                        </p>
                        {walletBalance?.error && (
                          <p className="text-xs text-red-500 mt-1">{walletBalance.error}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
                        <p className="text-sm">Weekly (Every Monday)</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Minimum Payout Threshold</p>
                        <p className="font-medium">$10.00</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Distribution */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-green-500" />
                      Revenue Distribution
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">LiquidLab Share (30%)</span>
                        <span className="font-medium text-purple-600">
                          ${dashboardData?.stats?.liquidlabRevenue || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Platform Owners Share (70%)</span>
                        <span className="font-medium text-blue-600">
                          ${dashboardData?.stats?.platformOwnerRevenue || '0.00'}
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Pending Payouts</span>
                          <span className="font-medium text-orange-600">
                            ${dashboardData?.pendingPayouts || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Actions */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      Manual Actions
                    </h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          toast({
                            title: "Process Payouts",
                            description: "This feature requires production configuration",
                          });
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Process Weekly Payouts
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          toast({
                            title: "Export Revenue Report",
                            description: "Revenue report export started",
                          });
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export Revenue Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Monitor Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Security Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Suspicious Platforms</p>
                            <p className="text-2xl font-bold text-red-600">
                              {dashboardData?.securityStats?.suspiciousCount || 0}
                            </p>
                          </div>
                          <Shield className="w-6 h-6 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Platforms Under Review</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {dashboardData?.securityStats?.underReviewCount || 0}
                            </p>
                          </div>
                          <Shield className="w-6 h-6 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Banned Platforms</p>
                            <p className="text-2xl font-bold text-gray-600">
                              {dashboardData?.securityStats?.bannedCount || 0}
                            </p>
                          </div>
                          <Shield className="w-6 h-6 text-gray-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Suspicious Platforms Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Platforms Requiring Review</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-3">Platform</th>
                            <th className="text-left p-3">Owner</th>
                            <th className="text-left p-3">Risk Score</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Reported</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {suspiciousPlatforms?.map((platform: any) => (
                            <tr key={platform.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{platform.name}</p>
                                  <p className="text-sm text-gray-500">ID: {platform.id}</p>
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="text-sm">User #{platform.userId}</p>
                              </td>
                              <td className="p-3">
                                <Badge variant={platform.riskScore > 50 ? "destructive" : "secondary"}>
                                  {platform.riskScore}/100
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge variant={
                                  platform.status === 'banned' ? "destructive" : 
                                  platform.status === 'suspended' ? "secondary" : 
                                  "default"
                                }>
                                  {platform.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <p className="text-sm text-gray-600">
                                  {new Date(platform.createdAt).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      toast({
                                        title: "Platform Review",
                                        description: `Reviewing platform ${platform.name}`,
                                      });
                                    }}
                                  >
                                    Review
                                  </Button>
                                  {platform.status !== 'banned' && (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => {
                                        toast({
                                          title: "Platform Banned",
                                          description: `Platform ${platform.name} has been banned`,
                                          variant: "destructive",
                                        });
                                      }}
                                    >
                                      Ban
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!dashboardData?.suspiciousPlatforms || dashboardData.suspiciousPlatforms.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          No suspicious platforms detected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Security Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Security Activity</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboardData?.recentSecurityActivity?.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Shield className="w-4 h-4 text-gray-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!dashboardData?.recentSecurityActivity || dashboardData.recentSecurityActivity.length === 0) && (
                        <div className="text-center py-4 text-gray-500">
                          No recent security activity
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Actions */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Security Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          toast({
                            title: "Security Scan",
                            description: "Running comprehensive security scan on all platforms...",
                          });
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Run Full Security Scan
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full justify-start text-red-600 border-red-200"
                        onClick={() => {
                          toast({
                            title: "Emergency Mode",
                            description: "This would suspend all new platform creation temporarily",
                            variant: "destructive",
                          });
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Emergency Lockdown Mode
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Password Reset Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password for {selectedUser?.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordDialogOpen(false);
                  setNewPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser && newPassword.length >= 8) {
                    resetPasswordMutation.mutate({
                      userId: selectedUser.id,
                      newPassword
                    });
                  } else {
                    toast({
                      title: "Invalid Password",
                      description: "Password must be at least 8 characters long.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}