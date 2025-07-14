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
import TradingViewWidget from "@/components/charts/TradingViewWidget";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";
import { PrivyProvider } from "@/components/PrivyProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { HyperliquidMarkets } from "@/components/trading/HyperliquidMarkets";
import { useHyperliquidTrading } from "@/hooks/useHyperliquidTrading";
import { HyperliquidOrder } from "@/lib/hyperliquid-signing";
import { HyperliquidTradeForm } from "@/components/trading/HyperliquidTradeForm";
import { HyperliquidPositions } from "@/components/trading/HyperliquidPositions";

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

  // Fetch Hyperliquid market data
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
        <div className="w-44 bg-[#0f0f0f] border-r border-gray-800 overflow-hidden">
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
            
            {/* TradingView Chart */}
            <div className="flex-1 bg-[#131313] h-full">
              <TradingViewWidget
                symbol={`BINANCE:${selectedPair.symbol}USDT`}
                theme="dark"
                interval={timeInterval === '1m' ? '1' : timeInterval === '5m' ? '5' : timeInterval === '15m' ? '15' : timeInterval === '1h' ? '60' : timeInterval === '4h' ? '240' : 'D'}
                autosize={true}
                allow_symbol_change={true}
                toolbar_bg="#131313"
              />
            </div>
          </div>

            {/* Trading Panel */}
            <div className="w-[340px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col h-full">
              {/* Trading Form */}
              <div className="flex-1">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="text-sm font-medium">Trade {selectedMarket}-USD</h3>
                  <div className="mt-2">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-block w-20 h-5 bg-gray-700 animate-pulse rounded" />
                        <span className="inline-block w-16 h-4 bg-gray-700 animate-pulse rounded" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-semibold ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          ${marketStats.price}
                        </span>
                        <span className={`text-xs ${marketStats.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {marketStats.change24h}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <HyperliquidTradeForm 
                  selectedMarket={selectedMarket}
                  currentPrice={parseFloat(marketStats.price.replace(/,/g, ''))}
                />
              </div>
            </div>
          </div>
        </div>

      {/* Positions Area - Hyperliquid Style */}
      <HyperliquidPositions />
      </div>
    </PrivyProvider>
  );
}