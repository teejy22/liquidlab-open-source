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
  volume24h?: string;
}

export function HyperliquidMarkets({ onSelectMarket }: { onSelectMarket: (market: string) => void }) {
  const [markets, setMarkets] = useState<HyperliquidMarket[]>([]);
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
      const data = await response.json();
      if (data && data[0] && data[0].universe) {
        setMarkets(data[0].universe);
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

  const handleMarketClick = (marketName: string) => {
    setSelectedMarket(marketName);
    onSelectMarket(marketName);
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

  // Sort by volume (if available) or by main markets
  const mainMarkets = ['BTC', 'ETH', 'SOL', 'ARB', 'MATIC', 'AVAX', 'BNB', 'DOGE', 'SUI', 'APT'];
  const sortedMarkets = filteredMarkets.sort((a, b) => {
    // First sort by volume if available
    const aVolume = prices[a.name]?.volume24h ? parseFloat(prices[a.name].volume24h) : 0;
    const bVolume = prices[b.name]?.volume24h ? parseFloat(prices[b.name].volume24h) : 0;
    if (aVolume !== bVolume) return bVolume - aVolume;
    
    // Then by main markets order
    const aIndex = mainMarkets.indexOf(a.name);
    const bIndex = mainMarkets.indexOf(b.name);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
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
          
          return (
            <Card
              key={market.name}
              className={`p-2 cursor-pointer transition-all group ${
                isSelected ? 'bg-gray-800 border-blue-500' : 'hover:bg-gray-800/50 border-transparent'
              }`}
              onClick={() => handleMarketClick(market.name)}
            >
              <div className={`flex justify-between items-center ${
                isSelected ? '' : 'group-hover:text-white'
              }`}>
                <div>
                  <div className="font-semibold text-xs">{market.name}-USD</div>
                  <div className="text-[10px] text-gray-400 group-hover:text-gray-300">
                    {market.maxLeverage}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs">
                    ${price?.price ? parseFloat(price.price).toLocaleString() : '---'}
                  </div>
                  <div className={`text-[10px] ${price?.change24h && price.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {price?.change24h ? `${price.change24h > 0 ? '+' : ''}${price.change24h.toFixed(2)}%` : '0.00%'}
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