import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TradingViewWidget from "@/components/charts/tradingview-widget";
import { BarChart3, Settings, Maximize2, RefreshCw } from "lucide-react";

export default function ChartDemo() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1D");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [refreshKey, setRefreshKey] = useState(0);

  const symbols = [
    { value: "BINANCE:BTCUSDT", label: "BTC/USDT" },
    { value: "BINANCE:ETHUSDT", label: "ETH/USDT" },
    { value: "BINANCE:SOLUSDT", label: "SOL/USDT" },
    { value: "BINANCE:AVAXUSDT", label: "AVAX/USDT" },
    { value: "BINANCE:ADAUSDT", label: "ADA/USDT" },
    { value: "BINANCE:DOTUSDT", label: "DOT/USDT" },
  ];

  const intervals = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1D", label: "1 Day" },
    { value: "1W", label: "1 Week" },
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TradingView Charts Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of TradingView charts integration in LiquidLab
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Chart Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trading Pair
                </label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Interval
                </label>
                <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intervals.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Chart
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">
                <BarChart3 className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Badge variant="outline">
                <Maximize2 className="w-3 h-3 mr-1" />
                Responsive
              </Badge>
              <Badge variant="outline">
                Technical Indicators
              </Badge>
              <Badge variant="outline">
                Drawing Tools
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {symbols.find(s => s.value === selectedSymbol)?.label} Chart
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedInterval}</Badge>
                <Badge variant="secondary">{theme}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TradingViewWidget
              key={refreshKey}
              symbol={selectedSymbol}
              interval={selectedInterval}
              theme={theme}
              height={600}
              width="100%"
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Multiple Charts Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BTC/USDT - 1 Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <TradingViewWidget
                symbol="BINANCE:BTCUSDT"
                interval="1h"
                theme="light"
                height={400}
                width="100%"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ETH/USDT - 4 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <TradingViewWidget
                symbol="BINANCE:ETHUSDT"
                interval="4h"
                theme="dark"
                height={400}
                width="100%"
              />
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <Card>
          <CardHeader>
            <CardTitle>TradingView Integration Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-800">Real-time Data</h3>
                <p className="text-sm text-green-600">
                  Live market data with instant updates
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Settings className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Customizable</h3>
                <p className="text-sm text-blue-600">
                  Multiple themes, intervals, and symbols
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Maximize2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Professional</h3>
                <p className="text-sm text-purple-600">
                  Advanced indicators and drawing tools
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}