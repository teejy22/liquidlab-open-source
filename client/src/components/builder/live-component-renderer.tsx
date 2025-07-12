import TradingViewWidget from "@/components/charts/tradingview-widget";
import Orderbook from "@/components/trading/orderbook";
import Portfolio from "@/components/trading/portfolio";
import MarketData from "@/components/trading/market-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ComponentConfig } from "@/types";
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  X
} from "lucide-react";

interface LiveComponentRendererProps {
  component: ComponentConfig;
  onRemove: (id: string) => void;
  isDemoMode?: boolean;
}

export default function LiveComponentRenderer({ 
  component, 
  onRemove, 
  isDemoMode = false 
}: LiveComponentRendererProps) {
  const renderComponent = () => {
    switch (component.type) {
      case 'tradingview-chart':
        return (
          <div className="h-full">
            <TradingViewWidget
              symbol={component.settings?.symbol || "BINANCE:BTCUSDT"}
              interval={component.settings?.interval || "1h"}
              theme={component.settings?.theme || "light"}
              height="100%"
              width="100%"
            />
          </div>
        );

      case 'orderbook':
        return (
          <Orderbook
            symbol={component.settings?.symbol || "BTC/USD"}
            height={450}
            showHeader={true}
          />
        );

      case 'portfolio':
        return (
          <Portfolio
            height={450}
            showHeader={true}
          />
        );

      case 'market-data':
        return (
          <MarketData
            symbols={component.settings?.symbols || ['BTC/USD', 'ETH/USD', 'SOL/USD']}
            height={450}
            showHeader={true}
          />
        );

      case 'trade-form':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Buy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-500 border-red-500 hover:bg-red-50"
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Sell
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select defaultValue="market">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount"
                    type="number" 
                    placeholder="0.00"
                    className="text-right"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price"
                    type="number" 
                    placeholder="Market Price"
                    className="text-right"
                  />
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Available:</span>
                    <span className="font-mono">1,234.56 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Est. Total:</span>
                    <span className="font-mono">~0.00 USDT</span>
                  </div>
                  <Button className="w-full bg-liquid-green hover:bg-liquid-accent">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Place Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <component.icon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">{component.name}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="relative group h-full">
      {isDemoMode && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-liquid-green text-white">
            Live Demo
          </Badge>
        </div>
      )}
      
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => onRemove(component.id)}
      >
        <X className="w-4 h-4" />
      </Button>
      
      <div className="h-full">
        {renderComponent()}
      </div>
    </div>
  );
}