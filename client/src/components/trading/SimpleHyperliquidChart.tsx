import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface SimpleHyperliquidChartProps {
  symbol: string;
  interval?: string;
}

export const SimpleHyperliquidChart: React.FC<SimpleHyperliquidChartProps> = ({ 
  symbol, 
  interval = '15m' 
}) => {
  // Fetch historical candles from Hyperliquid
  const { data: candleResponse } = useQuery({
    queryKey: [`/api/hyperliquid/candles/${symbol}?interval=${interval}`],
    refetchInterval: 5000, // Update every 5 seconds
  });

  return (
    <div className="relative h-full w-full bg-[#0a0a0a] flex items-center justify-center">
      <div className="absolute top-2 left-2 z-10 bg-gray-900/80 backdrop-blur-sm rounded px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Chart Source:</span>
          <span className="text-blue-400 font-medium">Hyperliquid DEX</span>
        </div>
      </div>
      
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {symbol} / USD - Hyperliquid Chart
        </h3>
        <p className="text-gray-400 mb-2">
          Real-time data from Hyperliquid DEX
        </p>
        {candleResponse && candleResponse.candles && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Latest candles loaded: {candleResponse.candles.length}</p>
            <p className="text-xs mt-2">
              Chart visualization in development
            </p>
          </div>
        )}
      </div>
    </div>
  );
};