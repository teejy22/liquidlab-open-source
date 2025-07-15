import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Volume2, Activity, X } from "lucide-react";
import liquidLabLogo from "@assets/Trade (6)_1752434284086.png";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";
import { PrivyProvider } from "@/components/PrivyProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { HyperliquidTradingInterface } from "@/components/trading/HyperliquidTradingInterface";

import { MoonPayButton } from "@/components/MoonPayButton";

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

  const [maxLeverage, setMaxLeverage] = useState(100); // Default to 100x
  const [marketStats, setMarketStats] = useState<MarketData>({
    price: "0.00",
    change24h: "+0.00%",
    high24h: "0.00",
    low24h: "0.00",
    volume24h: "0.00"
  });
  const [allMarketData, setAllMarketData] = useState<{[key: string]: any}>({});
  const [platformData, setPlatformData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [hyperliquidPrices, setHyperliquidPrices] = useState<{[key: string]: string}>({});

  // Fetch platform data and verification code
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
            
            // Fetch verification code for this platform
            const verifyResponse = await fetch(`/api/platforms/${latestPlatform.id}/verification-code`);
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              setVerificationCode(verifyData.code);
            }
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
        <div className="flex items-center justify-between h-36 lg:h-24 px-4 py-1 lg:py-0">
          <div className="flex items-center space-x-2 lg:space-x-6">
            <Link href="/" className="hidden lg:block">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to LiquidLab
              </Button>
            </Link>
            <Link href="/" className="lg:hidden">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-gray-700 hover:bg-gray-800 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            {platformData?.logoUrl ? (
              <img 
                src={platformData.logoUrl} 
                alt={platformData.name || "Trading Platform"} 
                className="h-32 lg:h-36 w-auto"
              />
            ) : (
              <img 
                src={liquidLabLogo} 
                alt="LiquidLab" 
                className="h-32 lg:h-36 w-auto"
              />
            )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <PlatformVerificationBadge
              platformId={platformData?.id || 1}
              platformName={platformData?.name || "Example Trading Platform"}
              isVerified={true}
              compactMode={true}
              className="hidden lg:block"
            />
            <WalletConnect />
            <MoonPayButton 
              platformId={platformData?.id}
              className="h-8 lg:h-9 hidden lg:block"
            />
          </div>
        </div>
      </header>

      {/* Trust Indicators */}
      <TrustIndicators 
        platformName={platformData?.name || "Example Trading Platform"}
        platformId={platformData?.id || 1}
        builderCode={platformData?.config?.builderCode || "LIQUIDLAB2025"}
        verificationCode={verificationCode || undefined}
      />

      {/* Main Trading Area */}
      <div className="flex-1 overflow-hidden">
        <HyperliquidTradingInterface />
      </div>
      </div>
    </PrivyProvider>
  );
}