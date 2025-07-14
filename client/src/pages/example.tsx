import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Volume2, Activity } from "lucide-react";
import liquidLabLogo from "@assets/Trade (6)_1752434284086.png";
import TradingViewWidget from "@/components/charts/tradingview-widget";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";

interface MarketData {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function ExampleTradingPage() {
  const [selectedPair, setSelectedPair] = useState({ symbol: "BTCUSDT", display: "BTC/USDT" });
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("limit");
  const [timeInterval, setTimeInterval] = useState("15m");
  const [isLoading, setIsLoading] = useState(true);
  const [marketStats, setMarketStats] = useState<MarketData>({
    price: "0.00",
    change24h: "+0.00%",
    high24h: "0.00",
    low24h: "0.00",
    volume24h: "0.00"
  });

  // Fetch real market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const symbol = selectedPair.symbol.replace("USDT", "").toLowerCase();
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol === "btc" ? "bitcoin" : symbol === "eth" ? "ethereum" : symbol}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`);
        const data = await response.json();
        
        const coinData = data[symbol === "btc" ? "bitcoin" : symbol === "eth" ? "ethereum" : symbol];
        if (coinData) {
          setMarketStats({
            price: coinData.usd.toFixed(2),
            change24h: `${coinData.usd_24h_change >= 0 ? '+' : ''}${coinData.usd_24h_change.toFixed(2)}%`,
            high24h: (coinData.usd * 1.02).toFixed(2), // Approximate
            low24h: (coinData.usd * 0.98).toFixed(2), // Approximate
            volume24h: (coinData.usd_24h_vol / 1000000).toFixed(2) + "M"
          });
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Format number with commas
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Generate mock orderbook data
  const generateOrderbook = () => {
    const asks = [];
    const bids = [];
    const currentPrice = parseFloat(marketStats.price) || 50000;
    
    // Generate asks (sell orders) above current price
    for (let i = 0; i < 6; i++) {
      const price = currentPrice + (i + 1) * 0.50;
      const amount = (Math.random() * 2).toFixed(4);
      const total = (price * parseFloat(amount)).toFixed(2);
      asks.push({
        price: formatPrice(price),
        amount,
        total: formatPrice(parseFloat(total))
      });
    }
    
    // Generate bids (buy orders) below current price
    for (let i = 0; i < 6; i++) {
      const price = currentPrice - (i + 1) * 0.50;
      const amount = (Math.random() * 2).toFixed(4);
      const total = (price * parseFloat(amount)).toFixed(2);
      bids.push({
        price: formatPrice(price),
        amount,
        total: formatPrice(parseFloat(total))
      });
    }
    
    return { asks, bids };
  };
  
  const orderbook = useMemo(() => generateOrderbook(), [marketStats.price]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-gray-800">
        <div className="flex items-center justify-between h-20 px-4">
          <div className="flex items-center space-x-6">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to LiquidLab
              </Button>
            </Link>
            <img 
              src={liquidLabLogo} 
              alt="LiquidLab" 
              className="h-24 w-auto"
            />
          </div>
          <div className="flex items-center space-x-4">
            <PlatformVerificationBadge
              platformId={1}
              platformName="Example Trading Platform"
              isVerified={true}
            />
            <span className="text-sm text-gray-400">Powered by LiquidLab</span>
          </div>
        </div>
      </header>

      {/* Trust Indicators */}
      <TrustIndicators 
        platformName="Example Trading Platform"
        platformId={1}
        builderCode="LIQUIDLAB2025"
      />

      {/* Main Trading Area */}
      <div className="flex">
        {/* Markets Sidebar */}
        <div className="w-48 bg-[#0f0f0f] border-r border-gray-800">
          <div className="p-2 border-b border-gray-800">
            <h3 className="text-xs font-medium text-gray-400">Markets</h3>
          </div>
          <div className="p-1">
            {[
              { symbol: "BTCUSDT", display: "BTC/USDT" },
              { symbol: "ETHUSDT", display: "ETH/USDT" },
              { symbol: "SOLUSDT", display: "SOL/USDT" },
            ].map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPair(pair)}
                className={`w-full text-left p-2 rounded text-sm hover:bg-gray-800 transition-colors ${
                  selectedPair.symbol === pair.symbol ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pair.display}</span>
                  <span className="text-xs text-green-400">+2.3%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart and Trading Area */}
        <div className="flex-1 flex flex-col">
          {/* Market Stats Bar */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-xl font-semibold">{selectedPair.display}</span>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Last Price</div>
                  {isLoading ? (
                    <div className="w-20 h-6 bg-gray-700 animate-pulse rounded" />
                  ) : (
                    <div className={`text-lg font-semibold ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      ${marketStats.price}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400">24h Change</div>
                  <div className={`text-sm ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {marketStats.change24h}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">24h High</div>
                  <div className="text-sm">${marketStats.high24h}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">24h Low</div>
                  <div className="text-sm">${marketStats.low24h}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">24h Volume</div>
                  <div className="text-sm">${marketStats.volume24h}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart and Order Area */}
          <div className="flex-1 flex">
            {/* Chart Section */}
            <div className="flex-1 flex flex-col">
              {/* Chart Time Intervals */}
              <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
                <div className="flex items-center space-x-2">
                  {['1m', '5m', '15m', '1h', '4h', '1d'].map(interval => (
                    <Button
                      key={interval}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeInterval(interval)}
                      className={`h-7 px-3 ${
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

            {/* Order Book and Trading Panel */}
            <div className="w-[340px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col">
              {/* Order Book */}
              <div className="flex-1 overflow-hidden">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="text-sm font-medium">Order Book</h3>
                </div>
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
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <span className="inline-block w-20 h-5 bg-gray-700 animate-pulse rounded" />
                        <span className="inline-block w-16 h-4 bg-gray-700 animate-pulse rounded" />
                      </div>
                    ) : (
                      <>
                        <span className={`text-lg font-semibold ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          ${marketStats.price}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">≈ ${marketStats.price}</span>
                      </>
                    )}
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

              {/* Trading Form */}
              <div className="border-t border-gray-800 p-4">
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
                        Buy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSide("sell")}
                        className={side === "sell" ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : "text-gray-300 border-gray-700 hover:border-red-600 hover:text-red-400"}
                      >
                        Sell
                      </Button>
                    </div>

                    {/* Order Type */}
                    <div className="space-y-2">
                      <Label className="text-xs">Order Type</Label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="market">Market</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Input */}
                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Price</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label className="text-xs">Amount</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>

                    {/* Leverage */}
                    <div className="space-y-2">
                      <Label className="text-xs">Leverage</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="w-full bg-gray-900 border-gray-700">
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
                  
                  <TabsContent value="cross" className="space-y-4 mt-4">
                    <div className="text-center text-gray-400 py-8">
                      Cross margin trading coming soon
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="isolated" className="space-y-4 mt-4">
                    <div className="text-center text-gray-400 py-8">
                      Isolated margin trading coming soon
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Area - Hyperliquid Style */}
      <div className="bg-[#0a0a0a] border-t border-gray-900">
        {/* Account Summary Bar */}
        <div className="bg-[#0f0f0f] border-b border-gray-900 px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Account Value:</span>
                <span className="font-mono text-white">$125,430.45</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Margin Used:</span>
                <span className="font-mono text-white">$80,200.33</span>
                <span className="text-gray-400">(63.9%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Free Collateral:</span>
                <span className="font-mono text-white">$45,230.12</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">uPnL:</span>
                <span className="font-mono text-green-400">+$1,910.00</span>
                <span className="text-green-400">(+1.54%)</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                Deposit
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Positions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#0f0f0f] border-b border-gray-900 sticky top-0">
              <tr className="text-gray-500">
                <th className="text-left py-2 px-4 font-normal">Market</th>
                <th className="text-center py-2 px-2 font-normal">Side</th>
                <th className="text-right py-2 px-2 font-normal">Size</th>
                <th className="text-right py-2 px-2 font-normal">Value</th>
                <th className="text-right py-2 px-2 font-normal">Entry</th>
                <th className="text-right py-2 px-2 font-normal">Mark</th>
                <th className="text-right py-2 px-2 font-normal">Liq</th>
                <th className="text-right py-2 px-2 font-normal">PnL</th>
                <th className="text-right py-2 px-2 font-normal">PnL %</th>
                <th className="text-right py-2 px-2 font-normal">Margin</th>
                <th className="text-center py-2 px-2 font-normal">TP/SL</th>
                <th className="text-center py-2 px-4 font-normal">Close</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-900 hover:bg-[#0f0f0f] transition-colors">
                <td className="py-2 px-4 font-mono">BTC-USD</td>
                <td className="py-2 px-2 text-center">
                  <span className="text-green-400 font-semibold">LONG</span>
                </td>
                <td className="py-2 px-2 text-right font-mono">0.5</td>
                <td className="py-2 px-2 text-right font-mono text-gray-300">$32,945</td>
                <td className="py-2 px-2 text-right font-mono">64,230.0</td>
                <td className="py-2 px-2 text-right font-mono">65,890.0</td>
                <td className="py-2 px-2 text-right font-mono text-orange-400">58,450.0</td>
                <td className="py-2 px-2 text-right font-mono text-green-400">+$830.00</td>
                <td className="py-2 px-2 text-right text-green-400">+2.58%</td>
                <td className="py-2 px-2 text-right font-mono">$3,294</td>
                <td className="py-2 px-2 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-gray-400 hover:text-white">
                    Set
                  </Button>
                </td>
                <td className="py-2 px-4 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px] text-gray-400 hover:text-white hover:bg-red-900/20">
                    Close
                  </Button>
                </td>
              </tr>
              <tr className="border-b border-gray-900 hover:bg-[#0f0f0f] transition-colors">
                <td className="py-2 px-4 font-mono">ETH-USD</td>
                <td className="py-2 px-2 text-center">
                  <span className="text-red-400 font-semibold">SHORT</span>
                </td>
                <td className="py-2 px-2 text-right font-mono">10.0</td>
                <td className="py-2 px-2 text-right font-mono text-gray-300">$33,800</td>
                <td className="py-2 px-2 text-right font-mono">3,450.00</td>
                <td className="py-2 px-2 text-right font-mono">3,380.00</td>
                <td className="py-2 px-2 text-right font-mono text-orange-400">3,890.00</td>
                <td className="py-2 px-2 text-right font-mono text-green-400">+$700.00</td>
                <td className="py-2 px-2 text-right text-green-400">+2.03%</td>
                <td className="py-2 px-2 text-right font-mono">$3,380</td>
                <td className="py-2 px-2 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-gray-400 hover:text-white">
                    Set
                  </Button>
                </td>
                <td className="py-2 px-4 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px] text-gray-400 hover:text-white hover:bg-red-900/20">
                    Close
                  </Button>
                </td>
              </tr>
              <tr className="border-b border-gray-900 hover:bg-[#0f0f0f] transition-colors">
                <td className="py-2 px-4 font-mono">SOL-USD</td>
                <td className="py-2 px-2 text-center">
                  <span className="text-green-400 font-semibold">LONG</span>
                </td>
                <td className="py-2 px-2 text-right font-mono">100.0</td>
                <td className="py-2 px-2 text-right font-mono text-gray-300">$10,230</td>
                <td className="py-2 px-2 text-right font-mono">98.50</td>
                <td className="py-2 px-2 text-right font-mono">102.30</td>
                <td className="py-2 px-2 text-right font-mono text-orange-400">78.20</td>
                <td className="py-2 px-2 text-right font-mono text-green-400">+$380.00</td>
                <td className="py-2 px-2 text-right text-green-400">+3.86%</td>
                <td className="py-2 px-2 text-right font-mono">$1,023</td>
                <td className="py-2 px-2 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-gray-400 hover:text-white">
                    Set
                  </Button>
                </td>
                <td className="py-2 px-4 text-center">
                  <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px] text-gray-400 hover:text-white hover:bg-red-900/20">
                    Close
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}