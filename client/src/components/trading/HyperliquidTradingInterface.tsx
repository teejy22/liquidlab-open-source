import React, { useState, useEffect } from 'react';
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

  const address = user?.wallet?.address || '';

  // Get TradingView symbol based on selected market
  const getTradingViewSymbol = () => {
    if (tradingMode === 'perp' && selectedPerpMarket) {
      return `${selectedPerpMarket.name}USDT`;
    } else if (tradingMode === 'spot' && selectedSpotMarket) {
      return `${selectedSpotMarket.token}USDT`;
    }
    return 'BTCUSDT';
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Mode Selector */}
      <div className="bg-gray-900 border-b border-gray-800 p-2">
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
        <div className="w-56 border-r border-gray-800 overflow-y-auto">
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
          <div className="flex-1 min-h-[400px]">
            <TradingViewChart 
              symbol={getTradingViewSymbol()}
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