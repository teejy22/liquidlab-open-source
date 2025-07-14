import React, { useMemo, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

// Memoize the chart component to prevent re-renders unless symbol or theme changes
export const TradingViewChart = memo(({ symbol = 'BTCUSDT', theme = 'dark' }: TradingViewChartProps) => {
  // Ensure we have a valid symbol
  const validSymbol = symbol && symbol.length > 0 ? symbol : 'BTCUSDT';
  
  // Create a stable iframe URL that only changes when symbol or theme changes
  const embedUrl = useMemo(() => {
    return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE%3A${validSymbol}&interval=15&theme=${theme}&style=1&locale=en&toolbar_bg=${theme === 'dark' ? '%23131313' : '%23f1f3f6'}&enable_publishing=false&allow_symbol_change=true&container_id=tradingview_advanced`;
  }, [validSymbol, theme]);

  return (
    <div className="h-full w-full relative bg-[#131313]">
      <iframe
        key={`${validSymbol}-${theme}`}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        frameBorder={0}
        scrolling="no"
        allowFullScreen
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if symbol or theme actually changes
  return prevProps.symbol === nextProps.symbol && prevProps.theme === nextProps.theme;
});