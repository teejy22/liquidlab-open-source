import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketDataProps {
  symbols?: string[];
  height?: number;
  showHeader?: boolean;
}

interface MarketItem {
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  isPositive: boolean;
}

const generateMockData = (symbols: string[]): MarketItem[] => {
  return symbols.map(symbol => {
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol,
      price: (Math.random() * 50000 + 1000).toFixed(2),
      change24h: change.toFixed(2),
      volume: (Math.random() * 1000000000).toFixed(0),
      isPositive: change > 0
    };
  });
};

export default function MarketData({ 
  symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'ARB/USD'],
  height,
  showHeader = true
}: MarketDataProps) {
  const [marketData, setMarketData] = useState<MarketItem[]>(generateMockData(symbols));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time market data updates
    const interval = setInterval(() => {
      setMarketData(prevData => 
        prevData.map(item => {
          const priceChange = (Math.random() - 0.5) * 100;
          const newPrice = parseFloat(item.price) + priceChange;
          const newChange = parseFloat(item.change24h) + (Math.random() - 0.5) * 0.5;
          return {
            ...item,
            price: newPrice.toFixed(2),
            change24h: newChange.toFixed(2),
            isPositive: newChange > 0
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [symbols]);

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${(num / 1e3).toFixed(2)}K`;
  };

  return (
    <Card className="h-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Market Data
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3" style={{ maxHeight: height ? `${height - 100}px` : 'auto', overflowY: 'auto' }}>
          {marketData.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{item.symbol}</h4>
                <Badge 
                  variant={item.isPositive ? "default" : "destructive"}
                  className={`${item.isPositive ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {item.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {item.isPositive ? '+' : ''}{item.change24h}%
                </Badge>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold">${item.price}</p>
                  <p className="text-xs text-gray-500 mt-1">24h Volume</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{formatVolume(item.volume)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}