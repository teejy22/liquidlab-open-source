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
  symbol = "BINANCE:BTCUSDT",
  interval = "D",
  theme = "light",
  width = "100%",
  height = 400,
  className = ""
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`tradingview_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing script
    const existingScript = containerRef.current.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": false,
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "hide_side_toolbar": false,
      "studies": [],
      "show_popup_button": false,
      "container_id": widgetIdRef.current
    });

    // Create a div for the widget
    const widgetDiv = document.createElement('div');
    widgetDiv.id = widgetIdRef.current;
    widgetDiv.style.width = typeof width === 'number' ? `${width}px` : width;
    widgetDiv.style.height = typeof height === 'number' ? `${height}px` : height;
    
    // Clear container and add elements
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, width, height]);

  return (
    <div className={`tradingview-widget-container h-full ${className}`}>
      <div 
        ref={containerRef}
        className="h-full border rounded-lg overflow-hidden bg-gray-50"
      />
      <div className="tradingview-widget-copyright mt-1">
        <a 
          href="https://www.tradingview.com/" 
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
