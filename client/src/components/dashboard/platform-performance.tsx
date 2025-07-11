import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Settings,
  Eye,
  Copy
} from "lucide-react";

interface PlatformPerformanceProps {
  userId: number;
}

export default function PlatformPerformance({ userId }: PlatformPerformanceProps) {
  const { data: platforms, isLoading: platformsLoading } = useQuery({
    queryKey: ['/api/platforms', userId],
    queryFn: async () => {
      const response = await fetch(`/api/platforms?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch platforms');
      return response.json();
    }
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', userId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  });

  const handleCopyBuilderCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy builder code:', error);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (platformsLoading || analyticsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Platform Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Platform List */}
          <div className="space-y-4">
            {platforms && platforms.length > 0 ? (
              platforms.map((platform: any, index: number) => {
                const mockRevenue = (Math.random() * 2000).toFixed(2);
                const mockChange = (Math.random() * 20 - 10).toFixed(1);
                const mockUsers = Math.floor(Math.random() * 1000) + 50;
                
                return (
                  <div key={platform.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-liquid-green rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900">{platform.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{platform.isPublished ? 'Published' : 'Draft'}</span>
                          <span>•</span>
                          <span>{mockUsers} users</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(mockRevenue)}</div>
                        <div className="text-sm flex items-center">
                          {parseFloat(mockChange) >= 0 ? (
                            <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          <span className={`${parseFloat(mockChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(parseFloat(mockChange))}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant={platform.isPublished ? 'default' : 'secondary'}>
                          {platform.isPublished ? 'Live' : 'Draft'}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/builder/${platform.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No platforms yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first trading platform to start tracking performance
                </p>
                <Link href="/builder">
                  <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
                    Create Your First Platform
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Builder Code Section */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="font-semibold mb-4">Builder Code Configuration</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Builder Code:</span>
                  <div className="font-mono text-sm bg-white px-2 py-1 rounded mt-1">
                    {user?.builderCode || 'LIQUIDLAB2024'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyBuilderCode(user?.builderCode || 'LIQUIDLAB2024')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Commission Rate:</span>
                  <div className="font-semibold text-liquid-green text-lg">0.5%</div>
                </div>
                <Button variant="outline" size="sm">
                  Adjust
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Referral Code:</span>
                  <div className="font-mono text-sm bg-white px-2 py-1 rounded mt-1">
                    {user?.referralCode || 'REF2024'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyBuilderCode(user?.referralCode || 'REF2024')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="font-semibold mb-4">Performance Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-liquid-green">
                  {platforms?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Platforms</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.totalRevenue ? formatCurrency(analytics.totalRevenue) : '$0.00'}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="font-semibold mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/builder">
                <Button variant="outline" className="w-full">
                  Create Platform
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
