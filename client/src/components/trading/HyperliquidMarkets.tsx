import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HyperliquidMarket {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

interface MarketPrice {
  price: string;
  change24h: number;
  volume24h: string;
}

interface MarketSelection {
  name: string;
  displayName: string;
  index: number;
  markPx: string;
  dayNtlVlm: string;
  prevDayPx: string;
  maxLeverage: number;
}

export function HyperliquidMarkets({ onSelectMarket, autoSelectBTC = true }: { onSelectMarket: (market: MarketSelection) => void, autoSelectBTC?: boolean }) {
  const [markets, setMarkets] = useState<HyperliquidMarket[]>([]);
  const [marketContexts, setMarketContexts] = useState<any[]>([]);
  const [prices, setPrices] = useState<{[key: string]: MarketPrice}>({});
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState("BTC");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMarkets();
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await fetch('/api/hyperliquid/meta');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data[0] && data[0].universe) {
        setMarkets(data[0].universe);
        if (data[1]) {
          setMarketContexts(data[1]);
        }
        
        // Auto-select BTC on first load only if autoSelectBTC is true
        if (autoSelectBTC) {
          const btcMarket = data[0].universe.find((m: HyperliquidMarket) => m.name === 'BTC');
          if (btcMarket && data[1]) {
            const btcIndex = data[0].universe.findIndex((m: HyperliquidMarket) => m.name === 'BTC');
            const btcCtx = data[1][btcIndex];
            if (btcCtx) {
              const marketObj: MarketSelection = {
                name: 'BTC',
                displayName: 'BTC',
                index: btcIndex,
                markPx: btcCtx.markPx || '0',
                dayNtlVlm: btcCtx.dayNtlVlm || '0',
                prevDayPx: btcCtx.prevDayPx || '0',
                maxLeverage: btcMarket.maxLeverage
              };
              onSelectMarket(marketObj);
            }
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Hyperliquid markets:', error);
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/hyperliquid/market-prices');
      const data = await response.json();
      
      // Transform the data into a more usable format
      const priceMap: {[key: string]: MarketPrice} = {};
      Object.entries(data).forEach(([symbol, priceData]: [string, any]) => {
        // Handle both number and object formats
        if (typeof priceData === 'number') {
          priceMap[symbol] = {
            price: priceData.toString(),
            change24h: 0,
            volume24h: "0"
          };
        } else if (priceData && typeof priceData === 'object') {
          priceMap[symbol] = {
            price: priceData.price?.toString() || "0",
            change24h: priceData.change24h || 0,
            volume24h: priceData.volume24h || "0"
          };
        }
      });
      setPrices(priceMap);
    } catch (error) {
      console.error('Error fetching market prices:', error);
    }
  };

  const handleMarketClick = (market: HyperliquidMarket, index: number) => {
    setSelectedMarket(market.name);
    const ctx = marketContexts[index];
    if (ctx) {
      const marketObj: MarketSelection = {
        name: market.name,
        displayName: market.name,
        index: index,
        markPx: ctx.markPx || '0',
        dayNtlVlm: ctx.dayNtlVlm || '0',
        prevDayPx: ctx.prevDayPx || '0',
        maxLeverage: market.maxLeverage
      };
      onSelectMarket(marketObj);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Filter markets based on search query
  const filteredMarkets = markets.filter(market => 
    market.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by volume from highest to lowest
  const sortedMarkets = filteredMarkets.sort((a, b) => {
    const aVolume = prices[a.name]?.volume24h ? parseFloat(prices[a.name].volume24h) : 0;
    const bVolume = prices[b.name]?.volume24h ? parseFloat(prices[b.name].volume24h) : 0;
    return bVolume - aVolume;
  });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-2 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400">PERPETUAL MARKETS</h3>
      </div>
      <div className="p-2 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 h-7 text-xs bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>
      <div className="space-y-0.5 p-1">
        {sortedMarkets.map((market) => {
          const price = prices[market.name];
          const isSelected = selectedMarket === market.name;
          const originalIndex = markets.findIndex(m => m.name === market.name);
          
          return (
            <Card
              key={market.name}
              className={`p-2 cursor-pointer transition-all group ${
                isSelected ? 'bg-blue-600 border-blue-500' : 'bg-black hover:bg-gray-900 border-transparent'
              }`}
              onClick={() => handleMarketClick(market, originalIndex)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-xs text-white">{market.name}-USD</div>
                  <div className="text-[10px] text-gray-300">
                    {market.maxLeverage}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white">
                    ${price?.price && parseFloat(price.price) > 0 ? parseFloat(price.price).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-[10px] text-gray-300">
                    Vol: ${price?.volume24h ? (parseFloat(price.volume24h) / 1e6).toFixed(0) : '0'}M
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}