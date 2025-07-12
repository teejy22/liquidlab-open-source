import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Play,
  Zap,
  TrendingUp,
  Layout,
  Monitor,
  Smartphone,
  Check
} from "lucide-react";

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  settings?: any;
};

const templateLayouts = [
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
        settings: { symbol: 'BINANCE:BTCUSDT', interval: '60', theme: 'light' }
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
        description: 'Quick buy/sell',
        settings: { defaultPair: 'BTC/USD' }
      }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Setup',
    description: 'Clean and simple with chart and trading interface',
    components: [
      {
        id: 'chart-2',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'ETH/USD Daily Chart',
        settings: { symbol: 'BINANCE:ETHUSDT', interval: 'D', theme: 'light' }
      },
      {
        id: 'trade-form-2',
        type: 'trade-form',
        name: 'Trade Form',
        icon: ArrowUpDown,
        color: 'border-purple-500',
        description: 'Trade interface',
        settings: { defaultPair: 'ETH/USD' }
      }
    ]
  },
  {
    id: 'multi-chart',
    name: 'Multi-Chart Analysis',
    description: 'Multiple timeframe analysis with different chart views',
    components: [
      {
        id: 'chart-3',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'BTC 15m Chart',
        settings: { symbol: 'BINANCE:BTCUSDT', interval: '15', theme: 'light' }
      },
      {
        id: 'chart-4',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'BTC 1H Chart',
        settings: { symbol: 'BINANCE:BTCUSDT', interval: '60', theme: 'light' }
      },
      {
        id: 'chart-5',
        type: 'tradingview-chart',
        name: 'TradingView Chart',
        icon: BarChart3,
        color: 'border-liquid-green',
        description: 'BTC Daily Chart',
        settings: { symbol: 'BINANCE:BTCUSDT', interval: 'D', theme: 'light' }
      }
    ]
  }
];

export default function Builder() {
  const { templateId } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [selectedComponents, setSelectedComponents] = useState<ComponentConfig[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Load template components when template changes
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templateLayouts.find(t => t.id === templateId);
    if (template) {
      setSelectedComponents(template.components);
    }
  };

  // Initialize with first template
  useEffect(() => {
    const template = templateLayouts[0];
    if (template) {
      setSelectedComponents(template.components);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Builder</h1>
            <p className="text-gray-600">
              Choose a template and customize your trading platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Platform
            </Button>
            <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Template Selection Sidebar */}
          <div className="w-96 flex-shrink-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="w-5 h-5 mr-2" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Select a template to preview it with live data
                    </p>
                    
                    <RadioGroup 
                      value={selectedTemplate} 
                      onValueChange={handleSelectTemplate}
                      className="space-y-3"
                    >
                      {templateLayouts.map((template) => (
                        <div key={template.id} className="relative">
                          <Label
                            htmlFor={template.id}
                            className={`block cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                              selectedTemplate === template.id 
                                ? 'border-liquid-green bg-liquid-green/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem
                              value={template.id}
                              id={template.id}
                              className="sr-only"
                            />
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {template.components.length} components
                                  </Badge>
                                  {selectedTemplate === template.id && (
                                    <Badge className="bg-liquid-green text-white text-xs">
                                      <Check className="w-3 h-3 mr-1" />
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <div className="mt-6 p-4 bg-liquid-green/10 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="w-5 h-5 mr-2 text-liquid-green" />
                        <h4 className="font-semibold text-sm">Live Market Data</h4>
                      </div>
                      <p className="text-xs text-gray-600">
                        All templates include real-time TradingView charts and live market data from major exchanges
                      </p>
                    </div>
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

          {/* Live Preview Canvas */}
          <div className="flex-1 min-w-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Live Preview</span>
                    <Badge className="bg-liquid-green text-white">
                      <Play className="w-3 h-3 mr-1" />
                      Real-Time Data
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50" style={{ minHeight: '700px' }}>
                <div className={`transition-all ${
                  previewMode === 'mobile' ? 'max-w-md mx-auto' : 'w-full'
                }`}>
                  {selectedComponents.length > 0 ? (
                    <div className="bg-gray-900 text-white p-8 rounded-lg min-h-[600px] relative">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-xl font-bold">My Trading Platform</h2>
                          <Badge className="bg-liquid-green text-white">
                            {selectedTemplate === 'professional' ? 'Professional' : 
                             selectedTemplate === 'minimal' ? 'Minimal' : 'Multi-Chart'}
                          </Badge>
                        </div>
                        <div className="text-green-400 font-mono text-lg">$67,845.32</div>
                      </div>

                      {/* Mock Trading Interface */}
                      <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-1 gap-4' : 'grid-cols-12 gap-4'} h-96`}>
                        {/* Left Panel - Market Data */}
                        <div className={previewMode === 'mobile' ? 'col-span-1' : 'col-span-3 space-y-4'}>
                          <div className="bg-black/20 p-4 rounded">
                            <h3 className="text-sm font-semibold mb-2">Market Data</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>ETH/USD</span>
                                <span className="text-green-400">+2.34%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>BTC/USD</span>
                                <span className="text-red-400">-1.23%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>SOL/USD</span>
                                <span className="text-green-400">+5.67%</span>
                              </div>
                            </div>
                          </div>
                          
                          {previewMode === 'desktop' && (
                            <div className="bg-black/20 p-4 rounded">
                              <h3 className="text-sm font-semibold mb-2">Order Book</h3>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-red-400">67,845</span>
                                  <span>0.234</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-red-400">67,840</span>
                                  <span>0.156</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-400">67,850</span>
                                  <span>0.891</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Center - Chart */}
                        <div className={previewMode === 'mobile' ? 'col-span-1' : 'col-span-6'}>
                          <div className="bg-black/20 p-4 rounded h-full">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-semibold">
                                {selectedTemplate === 'multi-chart' ? 'Multi-Chart View' : 'ETH/USD Chart'}
                              </h3>
                              <div className="flex space-x-2">
                                <span className="text-xs bg-liquid-green px-2 py-1 rounded">1H</span>
                                <span className="text-xs bg-gray-600 px-2 py-1 rounded">4H</span>
                                <span className="text-xs bg-gray-600 px-2 py-1 rounded">1D</span>
                              </div>
                            </div>
                            <div className="h-64 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded flex items-center justify-center">
                              <div className="text-center">
                                <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                <p className="text-sm opacity-70">TradingView Chart</p>
                                <p className="text-xs opacity-50 mt-2">Live data will be shown here</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Panel - Trading */}
                        <div className={previewMode === 'mobile' ? 'col-span-1' : 'col-span-3 space-y-4'}>
                          <div className="bg-black/20 p-4 rounded">
                            <h3 className="text-sm font-semibold mb-2">Trade</h3>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <button className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs">Buy</button>
                                <button className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs">Sell</button>
                              </div>
                              <div className="text-xs">
                                <div className="flex justify-between mb-1">
                                  <span>Amount:</span>
                                  <span>0.5 ETH</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span>Price:</span>
                                  <span>$67,845</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span>$33,922.50</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {previewMode === 'desktop' && (
                            <div className="bg-black/20 p-4 rounded">
                              <h3 className="text-sm font-semibold mb-2">Portfolio</h3>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>ETH</span>
                                  <span>2.34</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>BTC</span>
                                  <span>0.045</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>USDC</span>
                                  <span>1,247.89</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="mt-6 pt-4 border-t border-white/20">
                        <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-center`}>
                          <div>
                            <div className="text-lg font-bold text-green-400">+12.34%</div>
                            <div className="text-xs opacity-70">24h Change</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">$2.4M</div>
                            <div className="text-xs opacity-70">Volume</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">1,247</div>
                            <div className="text-xs opacity-70">Active Users</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">$156.78</div>
                            <div className="text-xs opacity-70">Avg Trade</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full min-h-[600px] flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Layout className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Select a Template</h3>
                        <p className="text-sm">
                          Choose a template from the left to see it in action
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}