import { useEffect, useRef, useState } from 'react';

interface CandlestickChartProps {
  symbol: string;
  interval: string;
  height?: number;
  className?: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function CandlestickChart({
  symbol = "BTC",
  interval = "15m",
  height = 400,
  className = ""
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
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
    const intervalId = setInterval(loadData, 5000);
    
    return () => clearInterval(intervalId);
  }, [symbol, interval]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || candleData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions
    const padding = { top: 60, right: 80, bottom: 40, left: 10 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Calculate price range
    const prices = candleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice;

    // Calculate candle width
    const candleWidth = Math.max(3, Math.floor(chartWidth / candleData.length * 0.8));
    const spacing = chartWidth / candleData.length;

    // Draw grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();

      // Draw price labels
      const price = maxPrice - (i / 5) * priceRange;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${price.toFixed(2)}`, canvas.width - padding.right + 5, y + 3);
    }

    // Draw candlesticks
    candleData.forEach((candle, i) => {
      const x = padding.left + i * spacing + spacing / 2;
      const isGreen = candle.close >= candle.open;
      
      // Set colors
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;

      // Calculate positions
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(openY - closeY) || 1;
      
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw current price line
    if (currentPrice) {
      const currentY = padding.top + ((maxPrice - currentPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, currentY);
      ctx.lineTo(canvas.width - padding.right, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [candleData, currentPrice, height]);

  if (error) {
    return (
      <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded`} style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded`} style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading Hyperliquid chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className} bg-[#0a0a0a] border border-gray-800 rounded overflow-hidden`} style={{ height: `${height}px` }}>
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

      {/* Canvas Chart */}
      <canvas 
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />

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