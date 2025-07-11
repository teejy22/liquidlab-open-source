import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  List, 
  ArrowUpDown, 
  Wallet, 
  PieChart,
  Settings,
  Eye,
  Save,
  Files
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

export default function Builder() {
  const { templateId } = useParams();
  const [selectedComponents, setSelectedComponents] = useState<ComponentConfig[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleAddComponent = (component: ComponentConfig) => {
    setSelectedComponents(prev => [...prev, { ...component, id: `${component.type}-${Date.now()}` }]);
  };

  const handleRemoveComponent = (id: string) => {
    setSelectedComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const renderComponentPreview = (component: ComponentConfig) => {
    const IconComponent = component.icon;
    
    return (
      <div key={component.id} className={`bg-gray-100 rounded-lg p-4 border-2 border-dashed ${component.color} relative group`}>
        <div className="text-center text-gray-500 py-4">
          <IconComponent className={`text-2xl mx-auto mb-2 ${component.color.replace('border-', 'text-')}`} />
          <div className="text-sm">{component.name}</div>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Component Library */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="components" className="space-y-3 mt-4">
                    {availableComponents.map(component => {
                      const IconComponent = component.icon;
                      return (
                        <div
                          key={component.id}
                          className={`bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 ${component.color}`}
                          onClick={() => handleAddComponent(component)}
                        >
                          <div className="flex items-center">
                            <IconComponent className={`mr-3 ${component.color.replace('border-', 'text-')}`} />
                            <div>
                              <div className="font-medium">{component.name}</div>
                              <div className="text-sm text-gray-500">{component.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-3 mt-4">
                    <div className="space-y-4">
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

          {/* Builder Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Canvas Preview</span>
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
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-6 min-h-96">
                  {/* Live Preview */}
                  <div className={`bg-white rounded-lg p-4 min-h-80 ${
                    previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}>
                    {selectedComponents.length > 0 ? (
                      <div className={`grid gap-4 ${
                        previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {selectedComponents.map(component => renderComponentPreview(component))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-16">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                        <p className="text-sm">
                          Drag components from the left panel to start building your trading platform
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
