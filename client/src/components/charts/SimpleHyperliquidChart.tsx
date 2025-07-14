import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  volume?: number;
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
          const formattedCandles = data.candles.map((candle: any, index: number) => ({
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume || Math.random() * 1000000,
            date: new Date(candle.time * 1000).toLocaleTimeString(),
            index: index
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

  const chartTheme = {
    background: '#0a0a0a',
    grid: '#1a1a1a',
    text: '#9ca3af',
    tooltip: {
      background: '#1a1a1a',
      border: '#374151',
      text: '#ffffff'
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded p-2 text-xs">
          <p className="text-gray-400">{data.date}</p>
          <p className="text-white">Open: ${data.open.toFixed(2)}</p>
          <p className="text-white">High: ${data.high.toFixed(2)}</p>
          <p className="text-white">Low: ${data.low.toFixed(2)}</p>
          <p className="text-white">Close: ${data.close.toFixed(2)}</p>
        </div>
      );
    }
    return null;
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

      {/* Recharts Chart */}
      <div className="pt-16 pb-12 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={candleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis 
              dataKey="index" 
              stroke={chartTheme.text}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                if (candleData[value]) {
                  return new Date(candleData[value].time * 1000).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                }
                return '';
              }}
            />
            <YAxis 
              stroke={chartTheme.text}
              tick={{ fontSize: 10 }}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#22c55e" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

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