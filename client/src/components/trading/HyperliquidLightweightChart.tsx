import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';

interface HyperliquidLightweightChartProps {
  symbol: string;
  interval?: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export const HyperliquidLightweightChart: React.FC<HyperliquidLightweightChartProps> = ({ 
  symbol, 
  interval = '15m' 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Fetch historical candles from Hyperliquid
  const { data: candleResponse } = useQuery({
    queryKey: [`/api/hyperliquid/candles/${symbol}?interval=${interval}`],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !candleResponse || !candleResponse.candles) return;

    try {
      // Convert data to lightweight-charts format
      const formattedData = candleResponse.candles.map((candle: any) => ({
        time: Math.floor(candle.time / 1000),
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
      })).sort((a: any, b: any) => a.time - b.time);

      if (formattedData.length > 0) {
        candlestickSeriesRef.current.setData(formattedData);
        chartRef.current?.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Error formatting candle data:', error);
    }
  }, [candleResponse]);

  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <div className="absolute top-2 left-2 z-10 bg-gray-900/80 backdrop-blur-sm rounded px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Chart Source:</span>
          <span className="text-blue-400 font-medium">Hyperliquid DEX</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
};