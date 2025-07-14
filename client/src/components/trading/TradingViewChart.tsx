import React from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

export function TradingViewChart({ symbol = 'BTCUSDT', theme = 'dark' }: TradingViewChartProps) {
  // Ensure we have a valid symbol
  const validSymbol = symbol && symbol.length > 0 ? symbol : 'BTCUSDT';
  
  // Use TradingView's iframe embed
  const embedUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${Date.now()}&symbol=BINANCE%3A${validSymbol}&interval=15&theme=${theme}&style=1&locale=en&toolbar_bg=${theme === 'dark' ? '%23131313' : '%23f1f3f6'}&enable_publishing=false&allow_symbol_change=true&container_id=tradingview_advanced`;

  return (
    <div className="h-full w-full relative bg-[#131313]">
      <iframe
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        frameBorder={0}
        scrolling="no"
        allowFullScreen
      />
    </div>
  );
}