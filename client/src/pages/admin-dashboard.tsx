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
  Wallet
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
        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platforms">All Platforms</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
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