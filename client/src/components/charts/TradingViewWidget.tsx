import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
  interval?: string;
  timezone?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

function TradingViewWidget({
  symbol = "BTCUSD",
  theme = "dark",
  autosize = true,
  interval = "D",
  timezone = "Etc/UTC",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_widget"
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear the container
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const widgetConfig = {
      "autosize": autosize,
      "symbol": symbol,
      "interval": interval,
      "timezone": timezone,
      "theme": theme,
      "style": style,
      "locale": locale,
      "toolbar_bg": toolbar_bg,
      "enable_publishing": enable_publishing,
      "allow_symbol_change": allow_symbol_change,
      "container_id": container_id,
      "height": "100%",
      "width": "100%",
      "hide_side_toolbar": false,
      "withdateranges": true,
      "details": true,
      "hotlist": true,
      "calendar": true,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    };

    script.textContent = JSON.stringify(widgetConfig);
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, autosize, interval, timezone, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, container_id]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div id={container_id} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default memo(TradingViewWidget);