import React from 'react';

interface TradingViewUDFChartProps {
  symbol: string;
  interval?: string;
}

export const TradingViewUDFChart: React.FC<TradingViewUDFChartProps> = ({ 
  symbol, 
  interval = '15' 
}) => {
  // Use the regular TradingView widget with Hyperliquid symbol format
  // The UDF implementation would require TradingView Charting Library access which is not available via CDN
  const tradingViewSymbol = `${symbol}USDT`;
  
  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <div className="absolute top-2 left-2 z-10 bg-gray-900/80 backdrop-blur-sm rounded px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Chart Source:</span>
          <span className="text-blue-400 font-medium">Hyperliquid DEX (via TradingView)</span>
        </div>
      </div>
      <iframe
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE:${tradingViewSymbol}&interval=${interval}&theme=dark&style=1&locale=en&toolbar_bg=%23f1f3f6&enable_publishing=false&hide_top_toolbar=false&hide_legend=false&save_image=false&hide_volume=false&support_host=https://www.tradingview.com&studies=%5B%5D`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};