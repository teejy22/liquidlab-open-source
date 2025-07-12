import { useState } from "react";
import TradingViewWidget from "@/components/charts/tradingview-widget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

const tradingPairs = [
  { symbol: "BTCUSDT", name: "Bitcoin/USDT", exchange: "BINANCE" },
  { symbol: "ETHUSDT", name: "Ethereum/USDT", exchange: "BINANCE" },
  { symbol: "BNBUSDT", name: "BNB/USDT", exchange: "BINANCE" },
  { symbol: "SOLUSDT", name: "Solana/USDT", exchange: "BINANCE" },
  { symbol: "ADAUSDT", name: "Cardano/USDT", exchange: "BINANCE" },
  { symbol: "XRPUSDT", name: "XRP/USDT", exchange: "BINANCE" },
  { symbol: "DOTUSDT", name: "Polkadot/USDT", exchange: "BINANCE" },
  { symbol: "AVAXUSDT", name: "Avalanche/USDT", exchange: "BINANCE" },
];

export default function Example() {
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0]);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Mock market stats
  const marketStats = {
    price: "43,567.89",
    change24h: "+2.34%",
    high24h: "44,123.45",
    low24h: "42,890.12",
    volume24h: "1.2B",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MarketBeat-style Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">MarketBeat Trading</h1>
              <span className="text-sm text-gray-300">Powered by LiquidLab</span>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="#" className="hover:text-gray-300 transition-colors">Markets</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Portfolio</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Research</a>
                <a href="#" className="hover:text-gray-300 transition-colors">News</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Asset Selector and Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedPair.symbol}
                onValueChange={(value) => {
                  const pair = tradingPairs.find(p => p.symbol === value);
                  if (pair) setSelectedPair(pair);
                }}
              >
                <SelectTrigger className="w-[250px] h-12 text-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair.symbol} value={pair.symbol}>
                      {pair.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Market Stats */}
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-2xl font-bold">${marketStats.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Change</p>
                <p className={`text-xl font-semibold ${marketStats.change24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {marketStats.change24h}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                <p className="text-lg font-medium">${marketStats.volume24h}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Trading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Section - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] overflow-hidden">
              <TradingViewWidget
                symbol={`${selectedPair.exchange}:${selectedPair.symbol}`}
                interval="60"
                theme="light"
                height={600}
                className="w-full"
              />
            </Card>
          </div>

          {/* Trading Panel - Takes up 1 column */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Place Order</h3>
              
              <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "buy" | "sell")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    Sell
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={orderType} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Price (USDT)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Amount ({selectedPair.symbol.replace('USDT', '')})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-2 pb-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Total</span>
                      <span className="font-medium">
                        {price && amount ? `$${(parseFloat(price) * parseFloat(amount)).toFixed(2)}` : '$0.00'} USDT
                      </span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-12 text-lg font-semibold ${
                      orderType === 'buy' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.symbol.replace('USDT', '')}
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Market Info</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">24h High</span>
                  <span className="font-medium">${marketStats.high24h}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">24h Low</span>
                  <span className="font-medium">${marketStats.low24h}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-lg font-semibold">$850.3B</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Circulating Supply</p>
                <p className="text-lg font-semibold">19.5M BTC</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Trades</p>
                <p className="text-lg font-semibold">1.2M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Funding Rate</p>
                <p className="text-lg font-semibold">0.01%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2024 MarketBeat Trading. Powered by LiquidLab</p>
            <p className="text-xs text-gray-400 mt-2">
              Trading involves risk. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}