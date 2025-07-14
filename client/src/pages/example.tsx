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
import SimpleHyperliquidChart from "@/components/charts/SimpleHyperliquidChart";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";
import { PrivyProvider } from "@/components/PrivyProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { HyperliquidMarkets } from "@/components/trading/HyperliquidMarkets";

interface MarketData {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function ExampleTradingPage() {
  const [selectedPair, setSelectedPair] = useState({ symbol: "BTC", display: "BTC/USD" });
  const [selectedMarket, setSelectedMarket] = useState("BTC");
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
  const [allMarketData, setAllMarketData] = useState<{[key: string]: any}>({});
  const [platformData, setPlatformData] = useState<any>(null);
  const [hyperliquidPrices, setHyperliquidPrices] = useState<{[key: string]: string}>({});
  const [orderbook, setOrderbook] = useState<{ asks: any[], bids: any[] }>({ asks: [], bids: [] });

  // Fetch platform data
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const response = await fetch('/api/platforms');
        if (response.ok) {
          const platforms = await response.json();
          // Get the most recent platform
          if (platforms.length > 0) {
            const latestPlatform = platforms[platforms.length - 1];
            setPlatformData(latestPlatform);
          }
        }
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    };
    
    fetchPlatformData();
  }, []);

  // Fetch Hyperliquid market data and order book
  useEffect(() => {
    const fetchHyperliquidData = async () => {
      try {
        // Fetch current market prices
        const priceResponse = await fetch('/api/hyperliquid/market-data');
        const priceData = await priceResponse.json();
        setHyperliquidPrices(priceData);
        
        // Update stats for selected market
        const currentPrice = priceData[selectedMarket];
        if (currentPrice) {
          const price = parseFloat(currentPrice);
          setMarketStats({
            price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change24h: "+0.00%", // Hyperliquid doesn't provide 24h change in this endpoint
            high24h: (price * 1.02).toFixed(2),
            low24h: (price * 0.98).toFixed(2),
            volume24h: "---"
          });
        }
        
        // Fetch order book data
        const orderbookResponse = await fetch(`/api/hyperliquid/orderbook/${selectedMarket}`);
        if (orderbookResponse.ok) {
          const orderbookData = await orderbookResponse.json();
          
          // Format orderbook data
          const formattedAsks = orderbookData.levels[0].map((ask: any[]) => ({
            price: formatPrice(parseFloat(ask[0])),
            amount: parseFloat(ask[1]).toFixed(4),
            total: formatPrice(parseFloat(ask[0]) * parseFloat(ask[1]))
          })).slice(0, 10);
          
          const formattedBids = orderbookData.levels[1].map((bid: any[]) => ({
            price: formatPrice(parseFloat(bid[0])),
            amount: parseFloat(bid[1]).toFixed(4),
            total: formatPrice(parseFloat(bid[0]) * parseFloat(bid[1]))
          })).slice(0, 10);
          
          setOrderbook({ asks: formattedAsks, bids: formattedBids });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Hyperliquid data:", error);
        setIsLoading(false);
      }
    };

    fetchHyperliquidData();
    const interval = setInterval(fetchHyperliquidData, 2000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  // Format number with commas
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };



  return (
    <PrivyProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
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
            {platformData?.logoUrl ? (
              <img 
                src={platformData.logoUrl} 
                alt={platformData.name || "Trading Platform"} 
                className="h-24 w-auto"
              />
            ) : (
              <img 
                src={liquidLabLogo} 
                alt="LiquidLab" 
                className="h-24 w-auto"
              />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <PlatformVerificationBadge
              platformId={platformData?.id || 1}
              platformName={platformData?.name || "Example Trading Platform"}
              isVerified={true}
            />
            <WalletConnect />
            <span className="text-sm text-gray-400">Powered by LiquidLab</span>
          </div>
        </div>
      </header>

      {/* Trust Indicators */}
      <TrustIndicators 
        platformName={platformData?.name || "Example Trading Platform"}
        platformId={platformData?.id || 1}
        builderCode={platformData?.config?.builderCode || "LIQUIDLAB2025"}
      />

      {/* Main Trading Area - Fixed Height */}
      <div className="flex overflow-hidden" style={{ height: '450px' }}>
        {/* Markets Sidebar - Real Hyperliquid Markets */}
        <div className="w-64 bg-[#0f0f0f] border-r border-gray-800 overflow-hidden">
          <HyperliquidMarkets 
            onSelectMarket={(market) => {
              setSelectedPair({ symbol: market, display: `${market}/USD` });
              setSelectedMarket(market);
            }} 
          />
        </div>

        {/* Chart and Trading Area */}
        <div className="flex-1 flex h-full">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col">
            {/* Market Stats Bar */}
            <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">{selectedPair.display}</h2>
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
                </div>
                <div className="flex items-center space-x-4">
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
            
            {/* Hyperliquid Chart */}
            <div className="flex-1 bg-[#131313]">
              <SimpleHyperliquidChart
                symbol={selectedPair.symbol}
                interval={timeInterval}
                theme="dark"
                height="100%"
                width="100%"
              />
            </div>
          </div>

            {/* Order Book and Trading Panel */}
            <div className="w-[340px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col h-full">
              {/* Order Book */}
              <div className="flex-1 overflow-y-auto">
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

              {/* Trading Form - Compact */}
              <div className="border-t border-gray-800 p-3">
                <div className="space-y-2">
                  {/* Buy/Sell Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSide("buy")}
                      className="h-8 transition-colors !bg-green-600 hover:!bg-green-700 !text-white !border-green-600"
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSide("sell")}
                      className="h-8 transition-colors !bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
                    >
                      Sell
                    </Button>
                  </div>

                  {/* Order Type */}
                  <div>
                    <Label className="text-xs text-gray-400">Order Type</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="w-full h-8 bg-gray-900 border-gray-700 text-sm">
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
                    <div>
                      <Label className="text-xs text-gray-400">Price</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        className="bg-gray-900 border-gray-700 h-8 text-sm"
                      />
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <Label className="text-xs text-gray-400">Amount</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      className="bg-gray-900 border-gray-700 h-8 text-sm"
                    />
                  </div>

                  {/* Leverage */}
                  <div>
                    <Label className="text-xs text-gray-400">Leverage</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="w-full h-8 bg-gray-900 border-gray-700 text-sm">
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
                    size="sm"
                    className={`w-full h-9 ${
                      side === "buy" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {side === "buy" ? "Buy Long" : "Sell Short"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Positions Area - Hyperliquid Style */}
      <div className="bg-[#0a0a0a] border-t border-gray-900">
        {/* Account Summary Bar */}
        <div className="bg-[#0f0f0f] border-b border-gray-900 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
            <thead className="bg-[#0f0f0f] border-b border-gray-900">
              <tr className="text-gray-500">
                <th className="text-left py-3 px-4 font-normal whitespace-nowrap">Market</th>
                <th className="text-center py-3 px-3 font-normal whitespace-nowrap">Side</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Size</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Value</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Entry</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Mark</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Liq</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">PnL</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">PnL %</th>
                <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Margin</th>
                <th className="text-center py-3 px-3 font-normal whitespace-nowrap">TP/SL</th>
                <th className="text-center py-3 px-4 font-normal whitespace-nowrap">Close</th>
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
    </PrivyProvider>
  );
}