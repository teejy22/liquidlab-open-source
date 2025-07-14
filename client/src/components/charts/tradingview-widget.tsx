interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function TradingViewWidget({
  symbol = "BINANCE:BTCUSDT",
  interval = "D",
  theme = "light",
  width = "100%",
  height = 400,
  className = ""
}: TradingViewWidgetProps) {
  // Convert interval to TradingView format
  const getIntervalValue = (interval: string) => {
    const intervalMap: { [key: string]: string } = {
      "1": "1",
      "5": "5", 
      "15": "15",
      "60": "60",
      "240": "240",
      "D": "D",
      "W": "W",
      "M": "M"
    };
    return intervalMap[interval] || "D";
  };

  // Create iframe URL with parameters
  const iframeUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(symbol)}&interval=${getIntervalValue(interval)}&theme=${theme}&style=1&locale=en&toolbar_bg=%23f1f3f6&enable_publishing=false&allow_symbol_change=true&details=true&hotlist=true&calendar=true`;
  
  return (
    <div className={`tradingview-widget-container ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height, width }}>
      <iframe
        src={iframeUrl}
        style={{ width: '100%', height: '100%', border: 0 }}
        allowFullScreen
        loading="lazy"
        title="TradingView Chart"
      />
      <div className="tradingview-widget-copyright mt-2">
        <a 
          href={`https://www.tradingview.com/symbols/${symbol?.replace(':', '-')}/`}
          rel="noopener nofollow" 
          target="_blank"
          className="text-xs text-gray-400 hover:text-liquid-green"
        >
          Track all markets on TradingView
        </a>
      </div>
    </div>
  );
}
