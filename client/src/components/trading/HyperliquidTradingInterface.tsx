import React, { useState, useEffect, useMemo } from 'react';
import { HyperliquidMarkets } from './HyperliquidMarkets';
import { HyperliquidTradeForm } from './HyperliquidTradeForm';
import { HyperliquidPositions } from './HyperliquidPositions';
import { TradingViewChart } from './TradingViewChart';

import { AIMarketAssistant } from './AIMarketAssistant';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';

interface Market {
  name: string;
  displayName: string;
  index: number;
  markPx: string;
  dayNtlVlm: string;
  prevDayPx: string;
  maxLeverage: number;
}

export function HyperliquidTradingInterface() {
  const { authenticated, user } = usePrivy();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const [liveMarketData, setLiveMarketData] = useState<{
    price: string;
    volume24h: string;
    change24h: string;
    high24h: string;
    low24h: string;
    fundingRate: string;
    openInterest: string;
  } | null>(null);

  const address = user?.wallet?.address || '';

  // Get TradingView symbol based on selected market - memoized to prevent unnecessary re-renders
  const tradingViewSymbol = useMemo(() => {
    if (selectedMarket) {
      return `${selectedMarket.name}USDT`;
    }
    return 'BTCUSDT';
  }, [selectedMarket?.name]);

  // Fetch live market data
  useEffect(() => {
    if (!selectedMarket) return;

    const fetchLiveData = async () => {
      try {
        const marketName = selectedMarket?.name;
        if (!marketName) return;

        const response = await fetch('/api/hyperliquid/market-prices');
        const data = await response.json();
        
        if (data[marketName]) {
          const marketData = data[marketName];
          setLiveMarketData({
            price: marketData.price?.toString() || '0',
            volume24h: marketData.volume24h || '0',
            change24h: marketData.change24h?.toString() || '0',
            high24h: marketData.high24h?.toString() || '0',
            low24h: marketData.low24h?.toString() || '0',
            fundingRate: marketData.fundingRate?.toString() || '0',
            openInterest: marketData.openInterest || '0'
          });
        }
      } catch (error) {
        console.error('Error fetching live market data:', error);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [selectedMarket]);

  return (
    <div className="flex flex-col bg-black text-white" style={{ height: '600px' }}>
      {/* Main Trading Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Markets Sidebar */}
        <div className="w-44 border-r border-gray-800 overflow-y-auto">
          <HyperliquidMarkets
            onSelectMarket={setSelectedMarket}
          />
        </div>

        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Market Stats Bar */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">
                  {selectedMarket?.name || 'Select Market'} / USD
                </h2>
                {liveMarketData && selectedMarket && (
                  <>
                    <div>
                      <div className="text-xs text-gray-400">Last Price</div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(liveMarketData.price).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">24h Change</div>
                      <div className={`text-sm ${parseFloat(liveMarketData.change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(liveMarketData.change24h) >= 0 ? '+' : ''}{parseFloat(liveMarketData.change24h).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">24h Volume</div>
                      <div className="text-sm">
                        ${parseFloat(liveMarketData.volume24h).toLocaleString(undefined, { 
                          maximumFractionDigits: 0 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">24h High</div>
                      <div className="text-sm text-green-400">
                        ${parseFloat(liveMarketData.high24h).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">24h Low</div>
                      <div className="text-sm text-red-400">
                        ${parseFloat(liveMarketData.low24h).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Funding APR</div>
                      <div className={`text-sm ${parseFloat(liveMarketData.fundingRate) > 0 ? 'text-green-400' : parseFloat(liveMarketData.fundingRate) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {parseFloat(liveMarketData.fundingRate).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Open Interest</div>
                      <div className="text-sm">
                        ${parseFloat(liveMarketData.openInterest).toLocaleString(undefined, { 
                          maximumFractionDigits: 0 
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            

          </div>

          {/* Chart */}
          <div className="flex-1">
            <TradingViewChart 
              symbol={tradingViewSymbol}
              theme="dark"
            />
          </div>

          {/* Positions */}
          {authenticated && (
            <div className="border-t border-gray-800 h-64 overflow-y-auto">
              <HyperliquidPositions address={address} />
            </div>
          )}
        </div>

        {/* Right Sidebar - Trading Panel & AI Assistant */}
        <div className="w-80 border-l border-gray-800 flex flex-col">
          <div className="flex-1 overflow-y-auto border-b border-gray-800">
            <HyperliquidTradeForm
              selectedMarket={selectedMarket?.name || 'BTC'}
              currentPrice={parseFloat(selectedMarket?.markPx || '0')}
              maxLeverage={selectedMarket?.maxLeverage}
            />
          </div>
          <div className="h-[180px] overflow-hidden">
            <AIMarketAssistant
              selectedMarket={selectedMarket?.name || 'BTC'}
              currentPrice={parseFloat(selectedMarket?.markPx || '0')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}