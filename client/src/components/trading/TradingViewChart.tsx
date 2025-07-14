import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    TradingView: any;
  }
}

let tvScriptLoadingPromise: Promise<void> | null = null;

export function TradingViewChart({ symbol = 'BTCUSDT', theme = 'dark' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const containerId = useRef(`tradingview_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    const initWidget = async () => {
      // Load TradingView script if not already loaded
      if (!tvScriptLoadingPromise && !window.TradingView) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://s3.tradingview.com/tv.js';
          script.async = true;
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      await tvScriptLoadingPromise;

      if (containerRef.current && window.TradingView) {
        // Clean up previous widget
        if (widgetRef.current) {
          widgetRef.current.remove();
        }

        // Create new widget
        widgetRef.current = new window.TradingView.widget({
          symbol: `BINANCE:${symbol}`,
          interval: '15',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#131313' : '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId.current,
          autosize: true,
          studies: [], // No default indicators
          disabled_features: ['header_symbol_search', 'header_compare'],
          enabled_features: ['study_templates'],
          overrides: {
            'mainSeriesProperties.style': 1,
            'paneProperties.background': theme === 'dark' ? '#131313' : '#ffffff',
            'paneProperties.backgroundGradientStartColor': theme === 'dark' ? '#131313' : '#ffffff',
            'paneProperties.backgroundGradientEndColor': theme === 'dark' ? '#131313' : '#ffffff',
            'paneProperties.vertGridProperties.color': theme === 'dark' ? '#1e1e1e' : '#e1e3e6',
            'paneProperties.horzGridProperties.color': theme === 'dark' ? '#1e1e1e' : '#e1e3e6',
            'scalesProperties.textColor': theme === 'dark' ? '#d1d4dc' : '#131722',
            'scalesProperties.backgroundColor': theme === 'dark' ? '#131313' : '#ffffff',
          },
        });
      }
    };

    initWidget();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      id={containerId.current}
      ref={containerRef} 
      className="h-full w-full"
    />
  );
}