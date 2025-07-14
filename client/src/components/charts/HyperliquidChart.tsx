import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface HyperliquidChartProps {
  symbol: string;
  interval: string;
  theme?: 'dark' | 'light';
  height?: number | string;
  width?: number | string;
  className?: string;
}

export default function HyperliquidChart({
  symbol = "BTC",
  interval = "15m",
  theme = "dark",
  height = 400,
  width = "100%",
  className = ""
}: HyperliquidChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const isMountedRef = useRef(true);
  const [isChartReady, setIsChartReady] = useState(false);

  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !isMountedRef.current) return;
    
    // Clear any existing chart
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        // Chart already disposed
      }
      chartRef.current = null;
      candleSeriesRef.current = null;
    }

    // Create chart with Hyperliquid-style dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: {
          visible: true,
          color: '#1f2937',
          style: 1,
        },
        horzLines: {
          visible: true,
          color: '#1f2937',
          style: 1,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: typeof height === 'number' ? height : parseInt(height),
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#758696',
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          color: '#758696',
          labelBackgroundColor: '#374151',
        },
      },
    });

    chartRef.current = chart;

    // Create candlestick series with Hyperliquid colors  
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candleSeriesRef.current = candleSeries;

    // Function to generate real-time candle data from orderbook prices
    const generateCandleData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current price from Hyperliquid
        const priceResponse = await fetch('/api/hyperliquid/market-prices');
        const prices = await priceResponse.json();
        const currentPrice = prices[symbol];
        
        if (!currentPrice) {
          console.error(`No price found for ${symbol}`);
          return;
        }

        setCurrentPrice(currentPrice);

        // Generate synthetic candle data based on current price
        // In production, you'd fetch historical data from Hyperliquid
        const now = Math.floor(Date.now() / 1000);
        const candleData: any[] = [];
        
        // Generate 100 candles of historical data
        for (let i = 100; i >= 0; i--) {
          const time = now - i * getIntervalSeconds(interval);
          const basePrice = currentPrice * (1 - i * 0.0001); // Slight trend
          const volatility = 0.002; // 0.2% volatility
          
          const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
          const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
          const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
          const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
          
          candleData.push({
            time,
            open,
            high,
            low,
            close,
          });
        }

        candleSeries.setData(candleData);
        chart.timeScale().fitContent();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chart data:', error);
        setIsLoading(false);
      }
    };

    generateCandleData().then(() => {
      setIsChartReady(true);
    });

    // Set up real-time updates
    let isDisposed = false;
    const updateInterval = setInterval(async () => {
      if (isDisposed || !isMountedRef.current) return;
      
      try {
        const priceResponse = await fetch('/api/hyperliquid/market-prices');
        const prices = await priceResponse.json();
        const newPrice = prices[symbol];
        
        if (newPrice && candleSeriesRef.current && chartRef.current && !isDisposed && isMountedRef.current) {
          setCurrentPrice(newPrice);
          
          try {
            // Update the last candle with new price
            const now = Math.floor(Date.now() / 1000);
            candleSeriesRef.current.update({
              time: now,
              open: newPrice * (1 + (Math.random() - 0.5) * 0.001),
              high: newPrice * (1 + Math.random() * 0.001),
              low: newPrice * (1 - Math.random() * 0.001),
              close: newPrice,
            });
          } catch (updateError) {
            // Ignore disposal errors
            if (!updateError.message?.includes('disposed')) {
              console.error('Error updating candle:', updateError);
            }
          }
        }
      } catch (error) {
        if (!error.message?.includes('disposed')) {
          console.error('Error updating price:', error);
        }
      }
    }, 5000); // Update every 5 seconds

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current && !isDisposed) {
        try {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        } catch (error) {
          if (!error.message?.includes('disposed')) {
            console.error('Error resizing chart:', error);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      clearInterval(updateInterval);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          // Chart already disposed
        }
      }
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []); // Only create chart once on mount

  // Handle symbol/interval changes
  useEffect(() => {
    if (!candleSeriesRef.current || !isMountedRef.current || !isChartReady) return;

    const updateChartData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current price from Hyperliquid
        const priceResponse = await fetch('/api/hyperliquid/market-prices');
        const prices = await priceResponse.json();
        
        // Handle API error
        if (!priceResponse.ok || prices.error) {
          console.error('API error:', prices.error || 'Failed to fetch prices');
          setIsLoading(false);
          return;
        }
        
        const currentPrice = prices[symbol];
        
        if (!currentPrice) {
          console.error(`No price found for ${symbol}`);
          setIsLoading(false);
          return;
        }

        setCurrentPrice(currentPrice);

        // Generate new candle data for the symbol
        const now = Math.floor(Date.now() / 1000);
        const candleData: any[] = [];
        
        for (let i = 100; i >= 0; i--) {
          const time = now - i * getIntervalSeconds(interval);
          const basePrice = currentPrice * (1 - i * 0.0001);
          const volatility = 0.002;
          
          const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
          const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
          const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
          const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
          
          candleData.push({ time, open, high, low, close });
        }

        if (candleSeriesRef.current && isMountedRef.current) {
          try {
            candleSeriesRef.current.setData(candleData);
            chartRef.current?.timeScale().fitContent();
          } catch (error) {
            if (!error.message?.includes('disposed')) {
              console.error('Error setting chart data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error updating chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateChartData();
  }, [symbol, interval, isChartReady]);

  const getIntervalSeconds = (interval: string): number => {
    const intervalMap: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return intervalMap[interval] || 900;
  };

  return (
    <div className={`relative ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-gray-400">Loading Hyperliquid chart...</div>
        </div>
      )}
      <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }} />
      {currentPrice && (
        <div className="absolute top-2 right-2 bg-gray-800/80 px-3 py-1 rounded text-sm">
          <span className="text-gray-400">Live: </span>
          <span className="text-white font-mono">${currentPrice.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}