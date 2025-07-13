import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUp, ArrowDown, Settings, BarChart3, Star } from "lucide-react";
import TradingViewWidget from "@/components/charts/tradingview-widget";

interface MarketData {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function Example() {
  const [selectedPair, setSelectedPair] = useState({ symbol: "BTCUSDT", name: "BTC-USD" });
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [leverage, setLeverage] = useState("10");
  const [timeInterval, setTimeInterval] = useState("15m");
  const [marketStats, setMarketStats] = useState<MarketData>({
    price: "43,567.89",
    change24h: "+2.45%",
    high24h: "44,125.50",
    low24h: "42,890.25",
    volume24h: "2.34B"
  });

  const tradingPairs = [
    { symbol: "BTCUSDT", name: "BTC-USD" },
    { symbol: "ETHUSDT", name: "ETH-USD" },
    { symbol: "SOLUSDT", name: "SOL-USD" },
    { symbol: "ARBUSDT", name: "ARB-USD" },
    { symbol: "OPUSDT", name: "OP-USD" },
    { symbol: "INJUSDT", name: "INJ-USD" },
    { symbol: "SUIUSDT", name: "SUI-USD" },
    { symbol: "SEIUSDT", name: "SEI-USD" }
  ];

  const orderbook = {
    asks: [
      { price: "43,572.00", amount: "0.1234", total: "5,376.58" },
      { price: "43,571.50", amount: "0.5000", total: "21,785.75" },
      { price: "43,571.00", amount: "0.2500", total: "10,892.75" },
      { price: "43,570.50", amount: "1.0000", total: "43,570.50" },
      { price: "43,570.00", amount: "0.3750", total: "16,338.75" },
      { price: "43,569.50", amount: "0.2100", total: "9,149.60" },
    ],
    bids: [
      { price: "43,567.00", amount: "0.1234", total: "5,374.17" },
      { price: "43,566.50", amount: "0.5000", total: "21,783.25" },
      { price: "43,566.00", amount: "0.2500", total: "10,891.50" },
      { price: "43,565.50", amount: "1.0000", total: "43,565.50" },
      { price: "43,565.00", amount: "0.3750", total: "16,336.88" },
      { price: "43,564.50", amount: "0.2100", total: "9,148.55" },
    ]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Hyperliquid-style Header */}
      <header className="bg-[#0f0f0f] border-b border-gray-800">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-medium">Hyperliquid</h1>
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <a href="#" className="text-white">Trade</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Portfolio</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">More</a>
            </nav>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-green-400">●</span>
              <span>Mainnet</span>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Sidebar - Market List */}
        <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Markets</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Star className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {tradingPairs.map(pair => (
                <div 
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedPair.symbol === pair.symbol 
                      ? 'bg-gray-800' 
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pair.name.split('-')[0]}</span>
                    <span className="text-xs text-green-400">+2.45%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">$43,567.89</span>
                    <span className="text-xs text-gray-500">$2.3B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar - Asset Info */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">{selectedPair.name}</h2>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Perp</span>
                </div>
                
                {/* Price Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-400">Mark</span>
                    <span className="ml-2 font-medium text-white">${marketStats.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">24h</span>
                    <span className={`ml-2 font-medium ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {marketStats.change24h}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Volume</span>
                    <span className="ml-2 font-medium text-white">${marketStats.volume24h}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Funding</span>
                    <span className="ml-2 font-medium text-green-400">0.01%</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Quick actions */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Trading Area */}
          <div className="flex-1 flex">
            {/* Chart Area */}
            <div className="flex-1 flex flex-col">
              {/* Chart Time Intervals */}
              <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
                <div className="flex items-center space-x-4">
                  {['1m', '5m', '15m', '1h', '4h', '1d'].map(interval => (
                    <Button
                      key={interval}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeInterval(interval)}
                      className={`h-7 px-3 text-xs ${
                        timeInterval === interval 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {interval}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* TradingView Chart */}
              <div className="flex-1 bg-[#131313]">
                <TradingViewWidget
                  symbol={`BINANCE:${selectedPair.symbol}`}
                  interval={timeInterval}
                  theme="dark"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>

            {/* Right Panel - Order Book & Trading */}
            <div className="w-[420px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col">
              {/* Order Book */}
              <div className="border-b border-gray-800">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="text-sm font-medium">Order Book</h3>
                </div>
                <div className="h-[300px] overflow-hidden">
                  {/* Asks */}
                  <div className="px-3 py-1">
                    <div className="grid grid-cols-3 text-xs text-gray-400 mb-1">
                      <span>Price (USD)</span>
                      <span className="text-right">Amount</span>
                      <span className="text-right">Total</span>
                    </div>
                  </div>
                  <div className="px-3 space-y-0.5">
                    {orderbook.asks.reverse().map((ask, i) => (
                      <div key={i} className="grid grid-cols-3 text-xs relative">
                        <div className="absolute inset-0 bg-red-500/10" style={{width: `${(i + 1) * 15}%`}} />
                        <span className="text-red-400 z-10">{ask.price}</span>
                        <span className="text-gray-300 text-right z-10">{ask.amount}</span>
                        <span className="text-gray-300 text-right z-10">{ask.total}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current Price */}
                  <div className="px-3 py-2 border-y border-gray-800 my-1">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-green-400">${marketStats.price}</span>
                      <span className="text-xs text-gray-400 ml-2">≈ ${marketStats.price}</span>
                    </div>
                  </div>
                  
                  {/* Bids */}
                  <div className="px-3 space-y-0.5">
                    {orderbook.bids.map((bid, i) => (
                      <div key={i} className="grid grid-cols-3 text-xs relative">
                        <div className="absolute inset-0 bg-green-500/10" style={{width: `${(6 - i) * 15}%`}} />
                        <span className="text-green-400 z-10">{bid.price}</span>
                        <span className="text-gray-300 text-right z-10">{bid.amount}</span>
                        <span className="text-gray-300 text-right z-10">{bid.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Form */}
              <div className="flex-1 p-4">
                <Tabs defaultValue="spot" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                    <TabsTrigger value="spot" className="data-[state=active]:bg-gray-800">Spot</TabsTrigger>
                    <TabsTrigger value="cross" className="data-[state=active]:bg-gray-800">Cross</TabsTrigger>
                    <TabsTrigger value="isolated" className="data-[state=active]:bg-gray-800">Isolated</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="spot" className="space-y-4 mt-4">
                    {/* Buy/Sell Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={side === "buy" ? "default" : "outline"}
                        onClick={() => setSide("buy")}
                        className={side === "buy" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        Buy Long
                      </Button>
                      <Button
                        variant={side === "sell" ? "default" : "outline"}
                        onClick={() => setSide("sell")}
                        className={side === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        Sell Short
                      </Button>
                    </div>

                    {/* Order Type */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Order Type</Label>
                      <RadioGroup value={orderType} onValueChange={setOrderType}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="market" id="market" />
                            <Label htmlFor="market" className="text-sm cursor-pointer">Market</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="limit" id="limit" />
                            <Label htmlFor="limit" className="text-sm cursor-pointer">Limit</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Price Input (for limit orders) */}
                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-400">Price</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="bg-gray-900 border-gray-800"
                        />
                      </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Amount</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="bg-gray-900 border-gray-800"
                      />
                    </div>

                    {/* Leverage Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Leverage</Label>
                      <Select value={leverage} onValueChange={setLeverage}>
                        <SelectTrigger className="bg-gray-900 border-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '5', '10', '20', '50'].map(lev => (
                            <SelectItem key={lev} value={lev}>{lev}x</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      className={`w-full ${
                        side === "buy" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {side === "buy" ? "Buy Long" : "Sell Short"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Bottom Section - Positions */}
          <div className="bg-[#0f0f0f] border-t border-gray-800">
            <div className="p-4">
              <Tabs defaultValue="positions" className="w-full">
                <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0">
                  <TabsTrigger 
                    value="positions" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2"
                  >
                    Positions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2"
                  >
                    Orders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2"
                  >
                    Trade History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="positions" className="mt-4">
                  <div className="text-center py-8 text-gray-400">
                    <p>No open positions</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-4">
                  <div className="text-center py-8 text-gray-400">
                    <p>No open orders</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <div className="text-center py-8 text-gray-400">
                    <p>No trade history</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}