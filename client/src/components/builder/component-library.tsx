import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentConfig } from "@/types";
import { 
  BarChart3, 
  List, 
  ArrowUpDown, 
  Wallet, 
  PieChart,
  Settings,
  Plus
} from "lucide-react";

interface ComponentLibraryProps {
  onAddComponent: (component: ComponentConfig) => void;
  selectedComponentId?: string;
  onUpdateComponent?: (id: string, updates: Partial<ComponentConfig>) => void;
  selectedComponent?: ComponentConfig;
}

const availableComponents = [
  {
    id: 'tradingview-chart',
    type: 'tradingview-chart',
    name: 'TradingView Chart',
    icon: BarChart3,
    color: 'border-liquid-green',
    description: 'Advanced charting widget with technical indicators'
  },
  {
    id: 'orderbook',
    type: 'orderbook',
    name: 'Order Book',
    icon: List,
    color: 'border-blue-500',
    description: 'Live bid/ask order book display'
  },
  {
    id: 'trade-form',
    type: 'trade-form',
    name: 'Trade Form',
    icon: ArrowUpDown,
    color: 'border-purple-500',
    description: 'Buy/sell trading interface'
  },
  {
    id: 'portfolio',
    type: 'portfolio',
    name: 'Portfolio',
    icon: Wallet,
    color: 'border-orange-500',
    description: 'Account balance and positions overview'
  },
  {
    id: 'market-data',
    type: 'market-data',
    name: 'Market Data',
    icon: PieChart,
    color: 'border-red-500',
    description: 'Price tickers and market statistics'
  }
];

const popularSymbols = [
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'ARB/USD',
  'OP/USD', 'SUI/USD', 'DOGE/USD', 'WIF/USD', 'BONK/USD'
];

export default function ComponentLibrary({ 
  onAddComponent, 
  selectedComponentId, 
  onUpdateComponent,
  selectedComponent 
}: ComponentLibraryProps) {
  const [platformSettings, setPlatformSettings] = useState({
    name: 'My Trading Platform',
    builderCode: 'LIQUIDLAB2024',
    commissionRate: '0.5',
    theme: 'light'
  });

  const handleAddComponent = (baseComponent: typeof availableComponents[0]) => {
    const newComponent: ComponentConfig = {
      id: `${baseComponent.type}-${Date.now()}`,
      type: baseComponent.type as any,
      position: { x: 0, y: 0, w: 2, h: 2 },
      settings: {
        symbol: 'BTC/USD',
        interval: '1D',
        theme: platformSettings.theme,
        height: 400,
        width: '100%'
      }
    };
    
    onAddComponent(newComponent);
  };

  const handleUpdateComponentSettings = (field: string, value: any) => {
    if (selectedComponent && onUpdateComponent) {
      onUpdateComponent(selectedComponent.id, {
        settings: {
          ...selectedComponent.settings,
          [field]: value
        }
      });
    }
  };

  const renderComponentSettings = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Select a component to configure its settings</p>
        </div>
      );
    }

    const commonSettings = (
      <div className="space-y-4">
        <div>
          <Label htmlFor="component-symbol">Symbol</Label>
          <Select
            value={selectedComponent.settings.symbol || 'BTC/USD'}
            onValueChange={(value) => handleUpdateComponentSettings('symbol', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {popularSymbols.map(symbol => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="component-height">Height (px)</Label>
          <Input
            id="component-height"
            type="number"
            value={selectedComponent.settings.height || 400}
            onChange={(e) => handleUpdateComponentSettings('height', parseInt(e.target.value))}
            min="200"
            max="800"
          />
        </div>
      </div>
    );

    const chartSpecificSettings = selectedComponent.type === 'tradingview-chart' && (
      <div className="space-y-4">
        <div>
          <Label htmlFor="chart-interval">Interval</Label>
          <Select
            value={selectedComponent.settings.interval || '1D'}
            onValueChange={(value) => handleUpdateComponentSettings('interval', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 minute</SelectItem>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="1D">1 day</SelectItem>
              <SelectItem value="1W">1 week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="chart-theme">Chart Theme</Label>
          <Select
            value={selectedComponent.settings.theme || 'light'}
            onValueChange={(value) => handleUpdateComponentSettings('theme', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            <input
              type="checkbox"
              checked={selectedComponent.settings.showVolumeProfile || false}
              onChange={(e) => handleUpdateComponentSettings('showVolumeProfile', e.target.checked)}
              className="mr-2"
            />
            Show Volume Profile
          </Label>
        </div>

        <div>
          <Label>
            <input
              type="checkbox"
              checked={selectedComponent.settings.showOrderBook || false}
              onChange={(e) => handleUpdateComponentSettings('showOrderBook', e.target.checked)}
              className="mr-2"
            />
            Show Order Book
          </Label>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-4">
            {selectedComponent.type.replace('-', ' ')} Settings
          </h4>
          {commonSettings}
        </div>
        
        {chartSpecificSettings && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4">Chart Settings</h4>
            {chartSpecificSettings}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Builder Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="space-y-3 mt-4">
            <div className="text-sm text-gray-600 mb-3">
              Click to add components to your platform
            </div>
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
                    <div className="flex-1">
                      <div className="font-medium">{component.name}</div>
                      <div className="text-sm text-gray-500">{component.description}</div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-3 mt-4">
            {renderComponentSettings()}
          </TabsContent>
          
          <TabsContent value="config" className="space-y-3 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  value={platformSettings.name}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Trading Platform"
                />
              </div>
              
              <div>
                <Label htmlFor="builder-code">Builder Code</Label>
                <Input
                  id="builder-code"
                  value={platformSettings.builderCode}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, builderCode: e.target.value }))}
                  placeholder="LIQUIDLAB2024"
                />
              </div>
              
              <div>
                <Label htmlFor="commission-rate">Commission Rate</Label>
                <Select
                  value={platformSettings.commissionRate}
                  onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, commissionRate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                    <SelectItem value="1.5">1.5%</SelectItem>
                    <SelectItem value="2.0">2.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="platform-theme">Theme</Label>
                <Select
                  value={platformSettings.theme}
                  onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
