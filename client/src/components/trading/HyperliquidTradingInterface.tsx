import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HyperliquidMarkets } from './HyperliquidMarkets';
import { HyperliquidSpotMarkets } from './HyperliquidSpotMarkets';
import { HyperliquidTradeForm } from './HyperliquidTradeForm';
import { HyperliquidSpotTradeForm } from './HyperliquidSpotTradeForm';
import { HyperliquidAccountTransfer } from './HyperliquidAccountTransfer';
import { HyperliquidPositions } from './HyperliquidPositions';
import { TradingViewChart } from './TradingViewChart';
import { SpotMarket } from '@/lib/hyperliquid-spot';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

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
  const [tradingMode, setTradingMode] = useState<'perp' | 'spot'>('perp');
  const [selectedPerpMarket, setSelectedPerpMarket] = useState<Market | null>(null);
  const [selectedSpotMarket, setSelectedSpotMarket] = useState<SpotMarket | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [liveMarketData, setLiveMarketData] = useState<{
    price: string;
    volume24h: string;
    change24h: string;
    high24h: string;
    low24h: string;
  } | null>(null);

  const address = user?.wallet?.address || '';

  // Get TradingView symbol based on selected market - memoized to prevent unnecessary re-renders
  const tradingViewSymbol = useMemo(() => {
    if (tradingMode === 'perp' && selectedPerpMarket) {
      return `${selectedPerpMarket.name}USDT`;
    } else if (tradingMode === 'spot' && selectedSpotMarket) {
      return `${selectedSpotMarket.token}USDT`;
    }
    return 'BTCUSDT';
  }, [tradingMode, selectedPerpMarket?.name, selectedSpotMarket?.token]);

  // Fetch live market data
  useEffect(() => {
    if (!selectedPerpMarket && !selectedSpotMarket) return;

    const fetchLiveData = async () => {
      try {
        const marketName = tradingMode === 'perp' ? selectedPerpMarket?.name : selectedSpotMarket?.token;
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
            low24h: marketData.low24h?.toString() || '0'
          });
        }
      } catch (error) {
        console.error('Error fetching live market data:', error);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [selectedPerpMarket, selectedSpotMarket, tradingMode]);

  return (
    <div className="flex flex-col bg-black text-white" style={{ height: '600px' }}>
      {/* Mode Selector */}
      <div className="border-b border-gray-800 p-2 bg-[#000000]">
        <div className="flex items-center justify-between">
          <Tabs value={tradingMode} onValueChange={(v) => setTradingMode(v as 'perp' | 'spot')}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="perp" className="data-[state=active]:bg-gray-700">
                Perpetual
              </TabsTrigger>
              <TabsTrigger value="spot" className="data-[state=active]:bg-gray-700">
                Spot
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {authenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransfer(!showTransfer)}
              className="ml-4"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Transfer USDC
            </Button>
          )}
        </div>
      </div>
      {/* Main Trading Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Markets Sidebar */}
        <div className="w-44 border-r border-gray-800 overflow-y-auto">
          {tradingMode === 'perp' ? (
            <HyperliquidMarkets
              selectedMarket={selectedPerpMarket?.name || ''}
              onSelectMarket={setSelectedPerpMarket}
            />
          ) : (
            <HyperliquidSpotMarkets
              selectedMarket={selectedSpotMarket?.token || ''}
              onSelectMarket={setSelectedSpotMarket}
            />
          )}
        </div>

        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Market Stats Bar */}
          <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">
                  {tradingMode === 'perp' ? selectedPerpMarket?.name || 'Select Market' : selectedSpotMarket?.token || 'Select Market'} / USD
                </h2>
                {liveMarketData && (selectedPerpMarket || selectedSpotMarket) && (
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

          {/* Positions (Perp only) */}
          {tradingMode === 'perp' && authenticated && (
            <div className="border-t border-gray-800 h-64 overflow-y-auto">
              <HyperliquidPositions address={address} />
            </div>
          )}
        </div>

        {/* Right Sidebar - Trading Panel */}
        <div className="w-80 border-l border-gray-800 overflow-y-auto">
          {showTransfer ? (
            <HyperliquidAccountTransfer
              address={address}
              onTransferComplete={() => setShowTransfer(false)}
            />
          ) : (
            <>
              {tradingMode === 'perp' ? (
                <HyperliquidTradeForm
                  selectedMarket={selectedPerpMarket}
                  address={address}
                />
              ) : (
                <HyperliquidSpotTradeForm
                  selectedMarket={selectedSpotMarket}
                  address={address}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}