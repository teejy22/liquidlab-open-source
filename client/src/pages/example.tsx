import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Volume2, Activity, X, AlertCircle, Shield, Copy } from "lucide-react";
import liquidLabLogo from "@assets/Trade (6)_1752434284086.png";
import { TrustIndicators } from "@/components/TrustIndicators";
import { PlatformVerificationBadge } from "@/components/PlatformVerificationBadge";
import { PrivyProvider } from "@/components/PrivyProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { HyperliquidTradingInterface } from "@/components/trading/HyperliquidTradingInterface";

import { MoonPayButton } from "@/components/MoonPayButton";
import { PWAInstaller } from "@/components/PWAInstaller";
import { validateImageUrl } from "@/lib/urlValidator";
import { usePrivy } from "@privy-io/react-auth";

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
  const [verificationCodeLoading, setVerificationCodeLoading] = useState<boolean>(false);
  const [hyperliquidPrices, setHyperliquidPrices] = useState<{[key: string]: string}>({});
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check for preview mode parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === 'true';
  const previewName = urlParams.get('name');
  const previewLogo = urlParams.get('logo');
  const previewPlatformId = urlParams.get('platformId');

  // Helper function for exponential backoff
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Retry function with exponential backoff
  const retryFetch = async (fn: () => Promise<Response>, maxRetries = 3, retryDelay = 1000) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fn();
        if (response.ok || response.status < 500) {
          return response; // Success or client error (don't retry client errors)
        }
        if (i < maxRetries) {
          console.log(`Retry ${i + 1}/${maxRetries} after ${retryDelay}ms`);
          await delay(retryDelay);
          retryDelay *= 2; // Exponential backoff
        }
      } catch (error) {
        if (i === maxRetries) throw error;
        await delay(retryDelay);
        retryDelay *= 2;
      }
    }
    throw new Error('Max retries exceeded');
  };

  // Fetch platform data and verification code
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setPlatformError(null);
        
        // If in preview mode, use preview data
        if (isPreview && (previewName || previewLogo || previewPlatformId)) {
          console.log('Preview mode - Logo URL:', previewLogo);
          console.log('Validated Logo URL:', validateImageUrl(previewLogo));
          setPlatformData({
            id: previewPlatformId ? parseInt(previewPlatformId) : undefined,
            name: previewName || 'Preview Platform',
            logoUrl: previewLogo || null  // Don't validate in preview mode since it's a relative URL
          });
          
          // If we have a platform ID, fetch its verification code
          if (previewPlatformId) {
            const verifyResponse = await retryFetch(() => 
              fetch(`/api/platforms/${previewPlatformId}/verification-code`)
            );
            if (verifyResponse.ok) {
              const { code } = await verifyResponse.json();
              setVerificationCode(code);
            }
          }
          
          return;
        }

        // For centralized SaaS, fetch platform based on current domain
        const response = await retryFetch(() => fetch('/api/platform/current'));
        if (response.ok) {
          const platform = await response.json();
          
          let platformId = platform?.id;
          
          // In development, use a fallback platform ID if no platform is resolved
          if (!platform && (window.location.hostname === 'localhost' || window.location.hostname.includes('.replit.dev'))) {
            // Use platform ID 13 (liquidL) as the development example
            const devPlatformResponse = await retryFetch(() => fetch('/api/platforms/13'));
            if (devPlatformResponse.ok) {
              const devPlatform = await devPlatformResponse.json();
              setPlatformData(devPlatform);
              platformId = devPlatform.id;
            }
          } else if (platform) {
            setPlatformData(platform);
          }
          
          if (platformId) {
            // Fetch verification code for this platform with retry
            console.log('Fetching verification code for platform:', platformId);
            setVerificationCodeLoading(true);
            try {
              const verifyResponse = await retryFetch(() => 
                fetch(`/api/platforms/${platformId}/verification-code`)
              );
              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                console.log('Verification response:', verifyData);
                if (verifyData.code) {
                  console.log('Setting verification code:', verifyData.code);
                  setVerificationCode(verifyData.code);
                } else {
                  console.warn('No verification code in response');
                  // Server should always return a code now, but just in case
                  setVerificationCode(null);
                }
              } else {
                console.error('Failed to fetch verification code:', verifyResponse.status);
                // Don't set platform error for verification code issues
                console.error('Unable to fetch verification code');
              }
            } catch (error) {
              console.error('Error fetching verification code:', error);
            } finally {
              setVerificationCodeLoading(false);
            }
          }
        } else {
          setPlatformError('Unable to load platform data');
        }
      } catch (error) {
        console.error("Error fetching platform data:", error);
        setPlatformError('Failed to connect to server. Please refresh the page.');
      }
    };
    
    fetchPlatformData();
  }, [retryCount, isPreview, previewName, previewLogo, previewPlatformId]);

  // Cache for market data to reduce API calls
  const marketDataCache = useMemo(() => {
    const cache = new Map<string, { data: any; timestamp: number }>();
    const CACHE_DURATION = 5000; // 5 seconds cache
    
    return {
      get: (key: string) => {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
        return null;
      },
      set: (key: string, data: any) => {
        cache.set(key, { data, timestamp: Date.now() });
      }
    };
  }, []);

  // Fetch Hyperliquid market data
  useEffect(() => {
    const fetchHyperliquidData = async () => {
      try {
        setMarketError(null);
        
        // Check cache first
        const cachedData = marketDataCache.get('market-data');
        if (cachedData) {
          setHyperliquidPrices(cachedData);
          updateMarketStats(cachedData[selectedMarket]);
          setIsLoading(false);
          return;
        }
        
        // Fetch current market prices with retry
        const priceResponse = await retryFetch(() => fetch('/api/hyperliquid/market-data'), 2, 2000);
        if (!priceResponse.ok) {
          throw new Error(`HTTP error! status: ${priceResponse.status}`);
        }
        
        const priceData = await priceResponse.json();
        marketDataCache.set('market-data', priceData);
        setHyperliquidPrices(priceData);
        
        // Update stats for selected market
        updateMarketStats(priceData[selectedMarket]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Hyperliquid data:", error);
        setMarketError('Unable to fetch market data. Will retry...');
        setIsLoading(false);
        
        // Retry after 5 seconds if there's an error
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000);
      }
    };

    const updateMarketStats = (currentPrice: string | undefined) => {
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
    };

    fetchHyperliquidData();
    
    // Reduce frequency to 5 seconds to avoid rate limiting
    const interval = setInterval(fetchHyperliquidData, 5000);
    return () => clearInterval(interval);
  }, [selectedMarket, retryCount]);

  // Format number with commas
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };



  return (
    <PrivyProvider>
      <TradingPlatform 
        platformData={platformData}
        selectedMarket={selectedMarket}
        setSelectedMarket={setSelectedMarket}
        marketStats={marketStats}
        marketDataError={marketDataError}
        handleRetry={handleRetry}
        retryCount={retryCount}
        verificationCode={verificationCode}
        verificationCodeLoading={verificationCodeLoading}
        isPreview={isPreview}
      />
    </PrivyProvider>
  );
}

function TradingPlatform({ 
  platformData, 
  selectedMarket, 
  setSelectedMarket, 
  marketStats, 
  marketDataError, 
  handleRetry, 
  retryCount,
  verificationCode,
  verificationCodeLoading,
  isPreview 
}: any) {
  const { ready } = usePrivy();
  
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Initializing wallet connection...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-gray-800">
        <div className="flex items-center justify-between h-24 sm:h-28 lg:h-24 px-2 sm:px-4 py-1 lg:py-0">
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-6">
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
            {(() => {
              // In preview mode, use logoUrl directly (it's already a relative path)
              const logoUrl = isPreview ? platformData?.logoUrl : validateImageUrl(platformData?.logoUrl);
              if (logoUrl) {
                return (
                  <img 
                    src={logoUrl} 
                    alt={platformData?.name || "Trading Platform"} 
                    className="h-32 sm:h-24 lg:h-36 w-auto"
                  />
                );
              }
              return (
                <img 
                  src={liquidLabLogo} 
                  alt="LiquidLab" 
                  className="h-32 sm:h-24 lg:h-36 w-auto"
                />
              );
            })()}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <div className="hidden sm:block">
              <PlatformVerificationBadge
                platformId={platformData?.id || 1}
                platformName={platformData?.name || "Example Trading Platform"}
                isVerified={true}
                compactMode={true}
                verificationCode={verificationCode}
              />
            </div>
            <WalletConnect />
            <MoonPayButton 
              platformId={platformData?.id}
              className="h-7 sm:h-8 lg:h-9 text-xs sm:text-sm px-2 sm:px-4"
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

      {/* Verification Code Display */}
      {(verificationCode || verificationCodeLoading) && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-4 py-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Platform Verification Code</div>
                <div className="flex items-center gap-3 mt-1">
                  {verificationCodeLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl font-bold font-mono text-blue-800 dark:text-blue-200">{verificationCode}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (verificationCode) {
                            navigator.clipboard.writeText(verificationCode);
                            const toast = (window as any).toast;
                            if (toast) {
                              toast({
                                title: "Copied!",
                                description: "Verification code copied to clipboard",
                              });
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-700 dark:text-blue-300">Verify at</div>
              <a 
                href="https://liquidlab.trade/verify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                liquidlab.trade/verify
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Trading Area */}
      <div className="flex-1 overflow-hidden">
        <HyperliquidTradingInterface />
      </div>
      
      {/* PWA Installer */}
      <PWAInstaller platformName={platformData?.name || "Trading Platform"} />
    </div>
  );
}