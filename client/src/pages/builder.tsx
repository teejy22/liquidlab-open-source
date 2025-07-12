import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LiveComponentRenderer from "@/components/builder/live-component-renderer";
import { 
  BarChart3, 
  List, 
  ArrowUpDown, 
  Wallet, 
  PieChart,
  Settings,
  Eye,
  Save,
  Files,
  Play,
  Zap,
  TrendingUp
} from "lucide-react";

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const availableComponents: ComponentConfig[] = [
  {
    id: 'tradingview-chart',
    type: 'tradingview-chart',
    name: 'TradingView Chart',
    icon: BarChart3,
    color: 'border-liquid-green',
    description: 'Advanced charting widget'
  },
  {
    id: 'orderbook',
    type: 'orderbook',
    name: 'Order Book',
    icon: List,
    color: 'border-blue-500',
    description: 'Live bid/ask display'
  },
  {
    id: 'trade-form',
    type: 'trade-form',
    name: 'Trade Form',
    icon: ArrowUpDown,
    color: 'border-purple-500',
    description: 'Buy/sell interface'
  },
  {
    id: 'portfolio',
    type: 'portfolio',
    name: 'Portfolio',
    icon: Wallet,
    color: 'border-orange-500',
    description: 'Account balance & positions'
  },
  {
    id: 'market-data',
    type: 'market-data',
    name: 'Market Data',
    icon: PieChart,
    color: 'border-red-500',
    description: 'Price tickers & stats'
  }
];

const demoLayouts = [
  {
    id: 'professional',
    name: 'Professional Trader',
    description: 'Full-featured trading layout with charts, order book, and portfolio',
    components: [
      {
        id: 'chart-1',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'BTC/USD 1H Chart',
        settings: { symbol: 'BINANCE:BTCUSDT', interval: '1h', theme: 'light' }
      },
      {
        id: 'orderbook-1',
        type: 'orderbook',
        name: 'Order Book',
        icon: List,
        color: 'border-blue-500',
        description: 'Live order book',
        settings: { symbol: 'BTC/USD' }
      },
      {
        id: 'portfolio-1',
        type: 'portfolio',
        name: 'Portfolio',
        icon: Wallet,
        color: 'border-orange-500',
        description: 'Account overview',
        settings: {}
      },
      {
        id: 'trade-form-1',
        type: 'trade-form',
        name: 'Trade Form',
        icon: ArrowUpDown,
        color: 'border-purple-500',
        description: 'Buy/sell interface',
        settings: {}
      }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Setup',
    description: 'Clean interface focused on charts and trading',
    components: [
      {
        id: 'chart-2',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'ETH/USD 4H Chart',
        settings: { symbol: 'BINANCE:ETHUSDT', interval: '4h', theme: 'light' }
      },
      {
        id: 'trade-form-2',
        type: 'trade-form',
        name: 'Trade Form',
        icon: ArrowUpDown,
        color: 'border-purple-500',
        description: 'Quick trading',
        settings: {}
      }
    ]
  },
  {
    id: 'multi-chart',
    name: 'Multi-Chart Analysis',
    description: 'Multiple timeframes and pairs for advanced analysis',
    components: [
      {
        id: 'chart-3',
        type: 'tradingview-chart',
        name: 'BTC Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'BTC/USD 1D',
        settings: { symbol: 'BINANCE:BTCUSDT', interval: '1D', theme: 'light' }
      },
      {
        id: 'chart-4',
        type: 'tradingview-chart',
        name: 'ETH Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'ETH/USD 1D',
        settings: { symbol: 'BINANCE:ETHUSDT', interval: '1D', theme: 'light' }
      },
      {
        id: 'market-data-1',
        type: 'market-data',
        name: 'Market Data',
        icon: PieChart,
        color: 'border-red-500',
        description: 'Top movers',
        settings: { symbols: ['BTC/USD', 'ETH/USD', 'SOL/USD'] }
      }
    ]
  }
];

export default function Builder() {
  const { templateId } = useParams();
  const [selectedComponents, setSelectedComponents] = useState<ComponentConfig[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleAddComponent = (component: ComponentConfig) => {
    setSelectedComponents(prev => [...prev, { ...component, id: `${component.type}-${Date.now()}` }]);
  };

  const handleRemoveComponent = (id: string) => {
    setSelectedComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const handleLoadDemoLayout = (layout: typeof demoLayouts[0]) => {
    setSelectedComponents(layout.components);
    setIsDemoMode(true);
  };

  const renderComponentPreview = (component: ComponentConfig) => {
    const IconComponent = component.icon;
    
    return (
      <div key={component.id} className={`bg-white rounded-lg p-4 border-2 ${component.color} relative group shadow-sm`}>
        <div className="text-center text-gray-500 py-4">
          <IconComponent className={`text-2xl mx-auto mb-2 ${component.color.replace('border-', 'text-')}`} />
          <div className="text-sm font-medium">{component.name}</div>
          <div className="text-xs text-gray-400 mt-1">{component.description}</div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleRemoveComponent(component.id)}
        >
          ×
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Builder</h1>
            <p className="text-gray-600">
              {templateId ? `Building from template ${templateId}` : 'Create your custom trading platform'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
              <Files className="w-4 h-4 mr-2" />
              Files
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Compact Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Builder Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
                    <TabsTrigger value="demo" className="text-xs">Demo</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="demo" className="space-y-3">
                    <div className="mb-3">
                      <h3 className="font-medium text-sm flex items-center">
                        <Play className="w-4 h-4 mr-1 text-liquid-green" />
                        Demo Layouts
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Live data demos
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {demoLayouts.map((layout) => (
                        <Card key={layout.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-medium text-sm">{layout.name}</h4>
                                <p className="text-xs text-gray-600">{layout.description}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {layout.components.length} items
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => handleLoadDemoLayout(layout)}
                                  className="bg-liquid-green hover:bg-liquid-accent text-white text-xs"
                                >
                                  Load
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="text-center p-3 bg-liquid-green/10 rounded text-xs">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-liquid-green" />
                      <p className="font-medium">Live market data included</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="components" className="space-y-2">
                    <p className="text-xs text-gray-600 mb-3">Click to add components</p>
                    {availableComponents.map(component => {
                      const IconComponent = component.icon;
                      return (
                        <div
                          key={component.id}
                          className={`bg-white p-3 rounded cursor-pointer hover:shadow-md transition-all border ${component.color} hover:scale-105`}
                          onClick={() => handleAddComponent(component)}
                        >
                          <div className="flex items-center">
                            <IconComponent className={`w-4 h-4 mr-2 ${component.color.replace('border-', 'text-')}`} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{component.name}</div>
                              <div className="text-xs text-gray-500">{component.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-3">
                    <p className="text-xs text-gray-600 mb-3">Platform settings</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Platform Name</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-2 border rounded-md"
                          placeholder="My Trading Platform"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Builder Code</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-2 border rounded-md"
                          placeholder="LIQUIDLAB2024"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Commission Rate</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option value="0.5">0.5%</option>
                          <option value="1.0">1.0%</option>
                          <option value="1.5">1.5%</option>
                          <option value="2.0">2.0%</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Theme</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Expanded Canvas Area */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Canvas Preview</span>
                    {isDemoMode && (
                      <Badge className="bg-liquid-green text-white">
                        <Play className="w-3 h-3 mr-1" />
                        Live Demo
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      Mobile
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gray-100 rounded-lg p-6" style={{ minHeight: '800px' }}>
                  {/* Live Preview Area */}
                  <div className={`bg-white rounded-lg shadow-inner p-6 h-full ${
                    previewMode === 'mobile' ? 'max-w-md mx-auto' : 'w-full'
                  }`}>
                    {selectedComponents.length > 0 ? (
                      <div className={`grid gap-6 ${
                        previewMode === 'mobile' ? 'grid-cols-1' : 
                        selectedComponents.length === 1 ? 'grid-cols-1' :
                        selectedComponents.length === 2 ? 'grid-cols-2' :
                        selectedComponents.length === 3 ? 'grid-cols-3' :
                        selectedComponents.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
                        'grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {selectedComponents.map(component => 
                          isDemoMode ? (
                            <div key={component.id} className={`${
                              selectedComponents.length === 1 ? 'h-[600px]' :
                              selectedComponents.length === 2 ? 'h-[500px]' :
                              'h-[400px]'
                            }`}>
                              <LiveComponentRenderer
                                component={component}
                                onRemove={handleRemoveComponent}
                                isDemoMode={true}
                              />
                            </div>
                          ) : (
                            renderComponentPreview(component)
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-16">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                        <p className="text-sm">
                          {isDemoMode ? 'Load a demo layout to see live TradingView charts and trading components' : 'Drag components from the left panel to start building your trading platform'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Configuration */}
            {selectedComponents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Component Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Select a component in the canvas to configure its settings
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedComponents.map(component => (
                        <Badge key={component.id} variant="secondary">
                          {component.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
