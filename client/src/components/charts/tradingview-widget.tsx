import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function TradingViewWidget({
  symbol = "HYPERLIQUID:BTCUSDT",
  interval = "1D",
  theme = "light",
  width = "100%",
  height = 400,
  className = ""
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": true,
      "support_host": "https://www.tradingview.com",
      "width": width,
      "height": height,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": theme === 'dark' ? "rgba(19, 23, 34, 1)" : "rgba(255, 255, 255, 1)",
      "gridColor": theme === 'dark' ? "rgba(42, 46, 57, 1)" : "rgba(233, 233, 234, 1)",
      "details": true,
      "hotlist": true,
      "studies": [
        "Volume@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "container_id": "tradingview_widget"
    });

    // Clear any existing content
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, width, height]);

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div 
        ref={containerRef}
        id="tradingview_widget"
        style={{ width, height }}
        className="border rounded-lg overflow-hidden"
      />
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
          className="text-xs text-gray-500 hover:text-liquid-green"
        >
          Track all markets on TradingView
        </a>
      </div>
    </div>
  );
}
