import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, Filter, BarChart3, Smartphone, Minimize2, TrendingUp, Eye } from "lucide-react";
import TemplatePreview from "@/components/templates/template-preview";

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
    name: "Hyperliquid Trading",
    description: "Professional perpetual trading interface with advanced charts and order management.",
    category: "Professional",
    previewImage: "/api/placeholder/400/300",
    features: ["TradingView Charts", "Order Book", "Portfolio Management", "0.1% Builder Fee"],
    isPopular: true,
    isPremium: false
  },
  {
    id: 2,
    name: "Hyperliquid + Polymarket",
    description: "Combined trading and prediction markets platform. Trade perps and predict outcomes.",
    category: "Professional",
    previewImage: "/api/placeholder/400/300",
    features: ["Perp Trading", "Prediction Markets", "Multi-Chain", "0.5% Extra Revenue"],
    isPopular: true,
    isPremium: true,
    premiumPrice: "$50/month"
  },
  {
    id: 3,
    name: "Polymarket Only",
    description: "Dedicated prediction markets platform for event-based trading and forecasting.",
    category: "DeFi",
    previewImage: "/api/placeholder/400/300",
    features: ["Event Trading", "Polygon Network", "Social Login", "0.5% Platform Fee"],
    isPopular: false,
    isPremium: true,
    premiumPrice: "$50/month"
  },
  {
    id: 4,
    name: "Mobile Trader",
    description: "Optimized for mobile trading with touch-friendly interfaces.",
    category: "Mobile First",
    previewImage: "/api/placeholder/400/300",
    features: ["Mobile Optimized", "Touch Controls", "Simplified UI", "Quick Actions"],
    isPopular: false
  },
  {
    id: 5,
    name: "Analytics Dashboard",
    description: "Data-driven trading with advanced analytics and insights.",
    category: "Analytics",
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
      'DeFi': 'bg-purple-900 text-white'
    };

    return (
      <div className={`${colors[template.category as keyof typeof colors]} p-4 h-36 relative overflow-hidden`}>
        {template.isPopular && !template.isPremium && (
          <div className="absolute top-2 right-2 bg-liquid-green text-white px-2 py-0.5 rounded text-[10px] font-semibold">
            Popular
          </div>
        )}
        {template.isPremium && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
            Premium
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{template.name}</h3>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="bg-gray-800 h-6 rounded opacity-50"></div>
          <div className="bg-gray-800 h-6 rounded opacity-50"></div>
          <div className="bg-gray-800 h-6 rounded opacity-50"></div>
        </div>
        <div className={`h-12 ${template.isPremium ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-green-400 to-blue-400'} rounded opacity-30`}></div>
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
            <Card key={template.id} className="overflow-hidden card-hover flex flex-col">
              {getTemplatePreview(template)}
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-base">{template.name}</h3>
                  <div className="flex items-center text-liquid-green">
                    {getCategoryIcon(template.category)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 2).map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 2 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      +{template.features.length - 2} more
                    </Badge>
                  )}
                </div>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {template.isPremium ? (
                        <span className="text-purple-600 font-bold">{template.premiumPrice}</span>
                      ) : (
                        <span className="text-liquid-green font-semibold text-sm">Free</span>
                      )}
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">{template.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TemplatePreview template={template}>
                      <Button variant="outline" size="sm" className="text-xs py-1.5">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </TemplatePreview>
                    <Link href={`/builder/${template.id}`} className="flex-1">
                      <Button className={`w-full text-xs py-1.5 ${template.isPremium ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-liquid-green text-white hover:bg-liquid-accent"}`} size="sm">
                        Use Template
                      </Button>
                    </Link>
                  </div>
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
