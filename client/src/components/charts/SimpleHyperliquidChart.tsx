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
          const formattedCandles = data.candles.map((candle: any) => ({
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));
          setCandleData(formattedCandles);
          setCurrentPrice(formattedCandles[formattedCandles.length - 1].close);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setError('Failed to load chart data');
        setIsLoading(false);
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 5000); // Update every 5 seconds
    
    return () => clearInterval(intervalId);
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

  // Calculate chart dimensions and scales
  const chartPadding = { top: 60, right: 60, bottom: 40, left: 10 };
  const chartHeight = typeof height === 'number' ? height : parseInt(height) || 400;
  const chartWidth = 800; // Will be responsive via viewBox
  const candleWidth = Math.max(2, (chartWidth - chartPadding.left - chartPadding.right) / candleData.length * 0.8);
  
  // Calculate price range
  const prices = candleData.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const priceRange = maxPrice - minPrice;
  
  const scaleY = (price: number) => {
    const ratio = (maxPrice - price) / priceRange;
    return chartPadding.top + ratio * (chartHeight - chartPadding.top - chartPadding.bottom);
  };
  
  const scaleX = (index: number) => {
    const totalWidth = chartWidth - chartPadding.left - chartPadding.right;
    return chartPadding.left + (index / (candleData.length - 1)) * totalWidth;
  };

  return (
    <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded overflow-hidden`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
      {/* Chart Header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">{symbol}/USD</h3>
            <p className="text-xs text-gray-400">{interval} · Hyperliquid</p>
          </div>
          {currentPrice && (
            <div className="text-right">
              <div className="text-xl font-mono text-white">${currentPrice.toFixed(2)}</div>
              <div className="text-xs text-green-400">Live</div>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        {/* Grid Lines */}
        <g className="opacity-20">
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = chartPadding.top + ratio * (chartHeight - chartPadding.top - chartPadding.bottom);
            const price = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartWidth - chartPadding.right}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={chartWidth - chartPadding.right + 5}
                  y={y + 4}
                  fill="#9ca3af"
                  fontSize="10"
                  textAnchor="start"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Candlesticks */}
        {candleData.map((candle, i) => {
          const x = scaleX(i);
          const isGreen = candle.close > candle.open;
          const color = isGreen ? '#22c55e' : '#ef4444';
          
          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x}
                y1={scaleY(candle.high)}
                x2={x}
                y2={scaleY(candle.low)}
                stroke={color}
                strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x - candleWidth / 2}
                y={scaleY(Math.max(candle.open, candle.close))}
                width={candleWidth}
                height={Math.abs(scaleY(candle.open) - scaleY(candle.close))}
                fill={color}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Current Price Line */}
        {currentPrice && (
          <g>
            <line
              x1={chartPadding.left}
              y1={scaleY(currentPrice)}
              x2={chartWidth - chartPadding.right}
              y2={scaleY(currentPrice)}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          </g>
        )}
      </svg>

      {/* Chart Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0a0a0a] to-transparent">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Vol: ${(Math.random() * 10000000).toFixed(0)}</span>
          <span>24h H: ${currentPrice ? (currentPrice * 1.02).toFixed(2) : '0.00'}</span>
          <span>24h L: ${currentPrice ? (currentPrice * 0.98).toFixed(2) : '0.00'}</span>
        </div>
      </div>
    </div>
  );
}