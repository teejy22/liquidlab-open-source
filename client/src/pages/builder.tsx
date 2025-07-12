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
              <CardContent className="p-6 bg-gray-100 h-full" style={{ minHeight: '800px' }}>
                <div className={`bg-white rounded-lg shadow-lg p-6 h-full transition-all ${
                  previewMode === 'mobile' ? 'max-w-md mx-auto' : 'w-full'
                }`}>
                  {selectedComponents.length > 0 ? (
                    <div className={`h-full grid gap-4 ${
                      previewMode === 'mobile' ? 'grid-cols-1' : 
                      selectedComponents.length === 1 ? 'grid-cols-1' :
                      selectedComponents.length === 2 ? 'grid-cols-2' :
                      selectedComponents.length === 3 ? 'grid-cols-3' :
                      selectedComponents.length === 4 ? 'grid-cols-2' :
                      'grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {selectedComponents.map(component => (
                        <div key={component.id} className={`${
                          selectedComponents.length === 1 ? 'h-[700px]' :
                          selectedComponents.length === 2 ? 'h-[600px]' :
                          selectedComponents.length === 4 ? 'h-[350px]' :
                          'h-[400px]'
                        }`}>
                          <LiveComponentRenderer
                            component={component}
                            onRemove={() => {}}
                            isDemoMode={true}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-400">
                        <Layout className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Select a Template</h3>
                        <p className="text-sm">
                          Choose a template from the left to see it in action with live market data
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