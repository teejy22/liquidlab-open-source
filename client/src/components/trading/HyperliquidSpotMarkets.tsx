import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getSpotMarkets, SpotMarket } from '@/lib/hyperliquid-spot';
import { cn } from '@/lib/utils';

interface HyperliquidSpotMarketsProps {
  selectedMarket: string;
  onSelectMarket: (market: SpotMarket) => void;
}

export function HyperliquidSpotMarkets({ selectedMarket, onSelectMarket }: HyperliquidSpotMarketsProps) {
  const [markets, setMarkets] = useState<SpotMarket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      const spotMarkets = await getSpotMarkets();
      setMarkets(spotMarkets);
      setLoading(false);
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredMarkets = markets.filter(market =>
    market.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(1)}K`;
    }
    return `$${vol.toFixed(0)}`;
  };

  const formatPrice = (price: string) => {
    const p = parseFloat(price);
    if (p >= 1000) {
      return p.toFixed(0);
    } else if (p >= 1) {
      return p.toFixed(2);
    } else if (p >= 0.01) {
      return p.toFixed(4);
    }
    return p.toFixed(6);
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border-r border-gray-800 w-56 p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-800 rounded mb-4"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border-r border-gray-800 w-56 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Spot Markets</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-900 border border-gray-800 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-black">
        {filteredMarkets.map((market) => (
          <div
            key={market.token}
            onClick={() => onSelectMarket(market)}
            className={cn(
              "p-3 cursor-pointer transition-all group",
              "hover:bg-gray-900",
              selectedMarket === market.token && "bg-blue-900/20 border-l-2 border-blue-500"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  selectedMarket === market.token ? "text-white" : "text-gray-300 group-hover:text-white"
                )}>
                  {market.token}
                </span>
                <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                  Spot
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-mono",
                selectedMarket === market.token ? "text-gray-300" : "text-gray-400 group-hover:text-gray-300"
              )}>
                ${formatPrice(market.markPrice)}
              </span>
              <span className={cn(
                "font-mono",
                parseFloat(market.change24h) >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {parseFloat(market.change24h) >= 0 ? '+' : ''}{market.change24h}%
              </span>
            </div>
            
            <div className="text-[10px] text-gray-500 mt-1">
              Vol: {formatVolume(market.volume24h)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}