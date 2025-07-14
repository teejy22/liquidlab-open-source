import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUp, ArrowDown, Settings, BarChart3, Star, ArrowLeft, Home, Menu, X, ChevronDown } from "lucide-react";
import TradingViewWidget from "@/components/charts/tradingview-widget";
import liquidLabLogo from "@assets/Trade (6)_1752423674786.png";
import { Link } from "wouter";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";
import { SecurityFooter } from "@/components/SecurityFooter";

interface MarketData {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function Example() {
  const [selectedPair, setSelectedPair] = useState({ symbol: "BTCUSDT", name: "BTC-USD", coinId: "bitcoin" });
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [leverage, setLeverage] = useState("10");
  const [timeInterval, setTimeInterval] = useState("15m");
  const [marketStats, setMarketStats] = useState<MarketData>({
    price: "0.00",
    change24h: "0.00%",
    high24h: "0.00",
    low24h: "0.00",
    volume24h: "0.00"
  });
  const [pricesData, setPricesData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('chart');
  const [showMarkets, setShowMarkets] = useState(false);

  const tradingPairs = [
    { symbol: "BTCUSDT", name: "BTC-USD", coinId: "bitcoin" },
    { symbol: "ETHUSDT", name: "ETH-USD", coinId: "ethereum" },
    { symbol: "SOLUSDT", name: "SOL-USD", coinId: "solana" },
    { symbol: "ARBUSDT", name: "ARB-USD", coinId: "arbitrum" },
    { symbol: "OPUSDT", name: "OP-USD", coinId: "optimism" },
    { symbol: "INJUSDT", name: "INJ-USD", coinId: "injective-protocol" },
    { symbol: "SUIUSDT", name: "SUI-USD", coinId: "sui" },
    { symbol: "SEIUSDT", name: "SEI-USD", coinId: "sei-network" }
  ];

  // Format number functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Fetch live prices
  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const coinIds = tradingPairs.map(pair => pair.coinId).join(',');
      
      // Use our backend proxy to fetch prices
      const response = await fetch(`/api/prices?ids=${encodeURIComponent(coinIds)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPricesData(data || {});
      
      // Update market stats for selected pair
      const selectedCoinData = data?.[selectedPair.coinId];
      if (selectedCoinData && selectedCoinData.usd) {
        setMarketStats({
          price: formatPrice(selectedCoinData.usd),
          change24h: formatChange(selectedCoinData.usd_24h_change || 0),
          high24h: formatPrice(selectedCoinData.usd * 1.02), // Approximate
          low24h: formatPrice(selectedCoinData.usd * 0.98), // Approximate
          volume24h: formatVolume(selectedCoinData.usd_24h_vol || 0)
        });
      }
      setIsLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching prices:', error);
      setIsLoading(false);
      // Set default values to prevent runtime errors
      setMarketStats({
        price: "0.00",
        change24h: "0.00%",
        high24h: "0.00",
        low24h: "0.00",
        volume24h: "0.00"
      });
    }
  };

  // Update prices on mount and every 60 seconds (to avoid rate limiting)
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Changed to 60 seconds
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Generate dynamic orderbook based on current price
  const generateOrderbook = () => {
    const currentPrice = parseFloat(marketStats.price.replace(/,/g, '')) || 0;
    if (currentPrice === 0) return { asks: [], bids: [] };
    
    const asks = [];
    const bids = [];
    
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
        <div className="flex items-center justify-between h-16 md:h-28 px-3 md:px-4">
          {/* Mobile Layout */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 mr-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <img 
              src={liquidLabLogo} 
              alt="LiquidLab" 
              className="h-12 w-auto"
            />
          </div>
          
          {/* Desktop Left Section */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
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
                className="h-32 w-auto py-2"
              />
            </div>
            <nav className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-white">Trade</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Portfolio</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">More</a>
            </nav>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:block">
              <PlatformVerificationBadge 
                platformId={1}
                platformName="Example Trading Platform"
                isVerified={true}
                compactMode={true}
              />
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-green-400">●</span>
              <span>Mainnet</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-gray-700 hover:bg-gray-800 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Connect</span>
              <span className="sm:hidden">Connect</span>
              <span className="ml-1">Wallet</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f0f0f] border-t border-gray-800 px-4 py-3">
            <nav className="flex flex-col space-y-3">
              <Link href="/">
                <a className="text-gray-400 hover:text-white flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to LiquidLab
                </a>
              </Link>
              <a href="#" className="text-white">Trade</a>
              <a href="#" className="text-gray-400 hover:text-white">Portfolio</a>
              <a href="#" className="text-gray-400 hover:text-white">Leaderboard</a>
              <a href="#" className="text-gray-400 hover:text-white">More</a>
            </nav>
          </div>
        )}
      </header>

      {/* Trust Indicators */}
      <div className="px-4 pt-4">
        <TrustIndicators 
          platformName="Example Trading Platform"
          platformId={1}
          builderCode="LIQUIDLAB2025"
          customDomain="example.liquidlab.app"
        />
      </div>

      {/* Main Trading Interface */}
      <div className="flex flex-col h-[calc(100vh-240px)]">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col flex-1">
          {/* Top Bar - Asset Info */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-3 md:px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Desktop Asset Info */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Select value={selectedPair.symbol} onValueChange={(value) => {
                    const pair = tradingPairs.find(p => p.symbol === value);
                    if (pair) setSelectedPair(pair);
                  }}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{selectedPair.name}</span>
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Perp</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tradingPairs.map(pair => {
                        const coinData = pricesData[pair.coinId];
                        const change = coinData?.usd_24h_change || 0;
                        return (
                          <SelectItem key={pair.symbol} value={pair.symbol}>
                            <div className="flex items-center justify-between w-full">
                              <span>{pair.name}</span>
                              <span className={`text-xs ml-4 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatChange(change)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Price Stats - Responsive */}
              <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm overflow-x-auto">
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="text-gray-400 md:mr-2">Mark</span>
                  <span className="font-medium text-white">
                    {isLoading ? (
                      <span className="inline-block w-14 h-3 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      `$${marketStats.price}`
                    )}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="text-gray-400 md:mr-2">24h</span>
                  <span className={`font-medium ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {isLoading ? (
                      <span className="inline-block w-10 h-3 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      marketStats.change24h
                    )}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col md:flex-row md:items-center">
                  <span className="text-gray-400 md:mr-2">Volume</span>
                  <span className="font-medium text-white">
                    {isLoading ? (
                      <span className="inline-block w-14 h-3 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      marketStats.volume24h
                    )}
                  </span>
                </div>
                <div className="hidden lg:flex items-center">
                  <span className="text-gray-400">Funding</span>
                  <span className="ml-2 font-medium text-green-400">0.01%</span>
                  {!isLoading && (
                    <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live" />
                  )}
                </div>
              </div>
            </div>
              
              {/* Right side - Quick actions */}
              <div className="flex items-center space-x-4">
                {lastUpdated && !isLoading && (
                  <div className="text-xs text-gray-400">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
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
          </div>

          {/* Main Trading Area - Desktop */}
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
            <div className="w-[340px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col">
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
                        variant="default"
                        onClick={() => setSide("buy")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Buy Long
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => setSide("sell")}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
          <div className="bg-[#0f0f0f] border-t border-gray-800 h-48">
            <div className="p-2">
              <Tabs defaultValue="positions" className="w-full">
                <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0">
                  <TabsTrigger 
                    value="positions" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2 text-sm"
                  >
                    Positions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2 text-sm"
                  >
                    Orders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-2 text-sm"
                  >
                    Trade History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="positions" className="mt-2">
                  <div className="text-center py-4 text-gray-400 text-sm">
                    <p>No open positions</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-2">
                  <div className="text-center py-4 text-gray-400 text-sm">
                    <p>No open orders</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-2">
                  <div className="text-center py-4 text-gray-400 text-sm">
                    <p>No trade history</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col flex-1">
          {/* Mobile Market Selector */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-3 py-2">
            <Button 
              onClick={() => setShowMarkets(!showMarkets)}
              className="w-full justify-between bg-gray-800 hover:bg-gray-700 border-gray-700"
              variant="outline"
              size="sm"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{selectedPair.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Perp</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMarkets ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Mobile Markets Dropdown */}
            {showMarkets && (
              <div className="absolute z-50 mt-2 w-[calc(100%-24px)] bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {tradingPairs.map(pair => {
                  const coinData = pricesData[pair.coinId];
                  const change = coinData?.usd_24h_change || 0;
                  
                  return (
                    <div
                      key={pair.symbol}
                      onClick={() => {
                        setSelectedPair(pair);
                        setShowMarkets(false);
                      }}
                      className={`p-3 border-b border-gray-800 last:border-0 cursor-pointer hover:bg-gray-800 ${
                        selectedPair.symbol === pair.symbol ? 'bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pair.name}</span>
                        <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatChange(change)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Tabs */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-40">
            <div className="flex justify-around">
              <Button
                variant="ghost"
                onClick={() => setMobileTab('chart')}
                className={`flex-1 rounded-none py-3 ${mobileTab === 'chart' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                Chart
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMobileTab('orderbook')}
                className={`flex-1 rounded-none py-3 ${mobileTab === 'orderbook' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                Order Book
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMobileTab('trade')}
                className={`flex-1 rounded-none py-3 ${mobileTab === 'trade' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                Trade
              </Button>
            </div>
          </div>

          {/* Mobile Trading Area */}
          <div className="flex-1 flex flex-col">
            {mobileTab === 'chart' && (
              <div className="flex-1 flex flex-col">
                {/* Chart Time Intervals */}
                <div className="bg-[#0f0f0f] border-b border-gray-800 px-3 py-2 overflow-x-auto">
                  <div className="flex items-center space-x-2 whitespace-nowrap">
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
            )}
            
            {mobileTab === 'orderbook' && (
              <div className="flex-1 bg-[#0f0f0f] overflow-auto">
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
            )}
            
            {mobileTab === 'trade' && (
              <div className="flex-1 bg-[#0f0f0f] p-4 overflow-auto">
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
                        variant="default"
                        onClick={() => setSide("buy")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Buy Long
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => setSide("sell")}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
                            <RadioGroupItem value="market" id="market-mobile" />
                            <Label htmlFor="market-mobile" className="text-sm cursor-pointer">Market</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="limit" id="limit-mobile" />
                            <Label htmlFor="limit-mobile" className="text-sm cursor-pointer">Limit</Label>
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
            )}
          </div>

        </div>
      </div>
      
      <SecurityFooter 
        platformName="Example Trading Platform"
        platformId={1}
        builderCode="LIQUIDLAB2025"
      />
    </div>
  );
}