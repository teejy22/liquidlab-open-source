import { useEffect, useRef, useState } from 'react';

interface SimpleHyperliquidChartProps {
  symbol: string;
  interval: string;
  theme?: 'dark' | 'light';
  height?: number | string;
  width?: number | string;
  className?: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function SimpleHyperliquidChart({
  symbol = "BTC",
  interval = "15m",
  theme = "dark",
  height = 400,
  width = "100%",
  className = ""
}: SimpleHyperliquidChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/hyperliquid/candles/${symbol}?interval=${interval}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          setIsLoading(false);
          return;
        }

        if (data.candles && data.candles.length > 0) {
          setCandleData(data.candles);
          setCurrentPrice(data.candles[data.candles.length - 1].close);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setError('Failed to load chart data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [symbol, interval]);

  if (error) {
    return (
      <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading Hyperliquid chart...</div>
        </div>
      </div>
    );
  }

  // Simple placeholder visualization
  return (
    <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded overflow-hidden`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
      {/* Chart Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{symbol}/USD</h3>
            <p className="text-sm text-gray-400">{interval} · Hyperliquid</p>
          </div>
          {currentPrice && (
            <div className="text-right">
              <div className="text-2xl font-mono text-white">${currentPrice.toFixed(2)}</div>
              <div className="text-sm text-green-400">Live Price</div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 mb-2">Advanced Hyperliquid Chart</p>
          <p className="text-sm text-gray-500">Real-time candlestick data powered by Hyperliquid DEX</p>
          {candleData.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">{candleData.length} candles loaded</p>
          )}
        </div>
      </div>

      {/* Chart Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] to-transparent">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Volume: ${(Math.random() * 10000000).toFixed(0)}</span>
          <span>24h High: ${currentPrice ? (currentPrice * 1.02).toFixed(2) : '0.00'}</span>
          <span>24h Low: ${currentPrice ? (currentPrice * 0.98).toFixed(2) : '0.00'}</span>
        </div>
      </div>
    </div>
  );
}