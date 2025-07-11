import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Plus, 
  ExternalLink,
  Settings,
  Eye
} from "lucide-react";

export default function Dashboard() {
  const { data: platforms, isLoading: platformsLoading } = useQuery({
    queryKey: ['/api/platforms'],
    queryFn: async () => {
      const response = await fetch('/api/platforms');
      if (!response.ok) throw new Error('Failed to fetch platforms');
      return response.json();
    }
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard/1'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/dashboard/1');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  if (platformsLoading || analyticsLoading) {
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
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$2,847</p>
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
                  <p className="text-sm text-gray-600">Your Builder Code</p>
                  <p className="font-mono text-lg font-semibold">LIQUIDLAB2024</p>
                </div>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                  <p className="text-lg font-semibold text-liquid-green">0.5%</p>
                </div>
                <Button variant="outline" size="sm">
                  Adjust
                </Button>
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
    </div>
  );
}
