import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, Filter, BarChart3, Smartphone, Minimize2, TrendingUp } from "lucide-react";

const templateCategories = [
  { name: 'All', count: 50 },
  { name: 'Professional', count: 15 },
  { name: 'Mobile First', count: 12 },
  { name: 'Minimal', count: 8 },
  { name: 'Analytics', count: 10 },
  { name: 'DeFi', count: 5 }
];

const mockTemplates = [
  {
    id: 1,
    name: "Professional Trader",
    description: "Advanced charts, order book, and portfolio management for serious traders.",
    category: "Professional",
    previewImage: "/api/placeholder/400/300",
    features: ["TradingView Charts", "Order Book", "Portfolio Management", "Risk Tools"],
    isPopular: true
  },
  {
    id: 2,
    name: "Mobile Trader",
    description: "Optimized for mobile trading with touch-friendly interfaces.",
    category: "Mobile First",
    previewImage: "/api/placeholder/400/300",
    features: ["Mobile Optimized", "Touch Controls", "Simplified UI", "Quick Actions"],
    isPopular: false
  },
  {
    id: 3,
    name: "Clean Interface",
    description: "Minimalist design focused on essential trading functions.",
    category: "Minimal",
    previewImage: "/api/placeholder/400/300",
    features: ["Clean Design", "Essential Tools", "Fast Loading", "Distraction Free"],
    isPopular: false
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    description: "Data-driven trading with advanced analytics and insights.",
    category: "Analytics",
    previewImage: "/api/placeholder/400/300",
    features: ["Advanced Analytics", "Performance Tracking", "Custom Metrics", "Reporting"],
    isPopular: true
  },
  {
    id: 5,
    name: "DeFi Integration",
    description: "Comprehensive DeFi trading with multiple protocol support.",
    category: "DeFi",
    previewImage: "/api/placeholder/400/300",
    features: ["Multi-Protocol", "Yield Farming", "Liquidity Pools", "Governance"],
    isPopular: false
  },
  {
    id: 6,
    name: "Scalping Pro",
    description: "High-frequency trading interface with millisecond precision.",
    category: "Professional",
    previewImage: "/api/placeholder/400/300",
    features: ["Real-time Data", "One-Click Trading", "Hotkeys", "Speed Optimization"],
    isPopular: true
  }
];

export default function Templates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      // Mock API call - in real app this would fetch from backend
      return new Promise(resolve => {
        setTimeout(() => resolve(mockTemplates), 500);
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Professional':
        return <BarChart3 className="w-5 h-5" />;
      case 'Mobile First':
        return <Smartphone className="w-5 h-5" />;
      case 'Minimal':
        return <Minimize2 className="w-5 h-5" />;
      case 'Analytics':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getTemplatePreview = (template: any) => {
    const colors = {
      'Professional': 'bg-gray-900 text-white',
      'Mobile First': 'bg-indigo-900 text-white',
      'Minimal': 'bg-gray-100 text-gray-900 border-2 border-gray-200',
      'Analytics': 'bg-blue-900 text-white',
      'DeFi': 'bg-green-900 text-white'
    };

    return (
      <div className={`${colors[template.category as keyof typeof colors]} p-6 h-48 relative`}>
        {template.isPopular && (
          <div className="absolute top-4 right-4 bg-liquid-green text-white px-2 py-1 rounded text-xs font-semibold">
            Popular
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{template.name}</h3>
          <div className="text-green-400 font-mono text-sm">$67,845</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
        </div>
        <div className="h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded opacity-30"></div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Template Marketplace</h1>
        <p className="text-xl text-gray-600">
          Choose from professionally designed templates to kickstart your trading platform
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {templateCategories.map(category => (
          <Button
            key={category.name}
            variant={category.name === 'All' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center"
          >
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template: any) => (
            <Card key={template.id} className="overflow-hidden card-hover">
              {getTemplatePreview(template)}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <div className="flex items-center text-liquid-green">
                    {getCategoryIcon(template.category)}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 3).map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.features.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-liquid-green font-semibold">Free</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <Link href={`/builder/${template.id}`}>
                    <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
                      Use Template
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" className="px-8 py-3">
          Load More Templates
        </Button>
      </div>
    </div>
  );
}
