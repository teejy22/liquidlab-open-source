import React, { useMemo, memo, useState, useEffect } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

// Memoize the chart component to prevent re-renders unless symbol or theme changes
export const TradingViewChart = memo(({ symbol = 'BTCUSDT', theme = 'dark' }: TradingViewChartProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Ensure we have a valid symbol
  const validSymbol = symbol && symbol.length > 0 ? symbol : 'BTCUSDT';
  
  // Try simplified URL first for better desktop compatibility
  const embedUrl = useMemo(() => {
    // Simplified URL that works better with strict browser security
    return `https://www.tradingview.com/widgetembed/?symbol=BINANCE:${validSymbol}&interval=D&theme=${theme}&style=1&locale=en&enable_publishing=false&allow_symbol_change=false&container_id=tradingview_${Date.now()}`;
  }, [validSymbol, theme]);

  // Reset loading state when symbol changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [validSymbol]);

  // Add timeout for slow loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by changing key
    window.location.reload();
  };

  return (
    <div className="h-full w-full relative bg-[#131313]">
      {(isLoading || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#131313] z-10">
          <div className="flex flex-col items-center p-4">
            {hasError ? (
              <>
                <div className="text-yellow-500 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm font-semibold mb-2">TradingView Chart Loading Slowly</p>
                <p className="text-gray-500 text-xs text-center mb-4">
                  TradingView may be blocked by browser extensions or security settings.
                </p>
                <div className="flex flex-col items-center space-y-3">
                  <button 
                    onClick={handleRetry}
                    className="px-4 py-2 bg-liquid-green text-black rounded hover:bg-liquid-accent transition-colors text-sm font-medium"
                  >
                    Retry Loading
                  </button>
                  <a 
                    href={`https://www.tradingview.com/chart/?symbol=BINANCE:${validSymbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-liquid-green text-xs hover:underline"
                  >
                    Open TradingView in new tab →
                  </a>
                </div>
                <div className="text-gray-600 text-xs mt-4 text-center space-y-1">
                  <p>If charts aren't loading on desktop:</p>
                  <p>• Disable ad blockers temporarily</p>
                  <p>• Try a different browser</p>
                  <p>• Check firewall settings</p>
                </div>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-liquid-green"></div>
                <p className="mt-4 text-gray-400 text-sm">Loading TradingView Chart...</p>
                <p className="mt-2 text-gray-500 text-xs">This may take a moment during peak hours</p>
              </>
            )}
          </div>
        </div>
      )}
      <iframe
        key={`${validSymbol}-${theme}-${hasError ? 'retry' : 'normal'}`}
        src={embedUrl}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none', 
          display: isLoading && !hasError ? 'none' : 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        frameBorder={0}
        scrolling="no"
        allowFullScreen
        allow="clipboard-write; fullscreen"
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
        referrerPolicy="no-referrer"
        title={`TradingView Chart - ${validSymbol}`}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if symbol or theme actually changes
  return prevProps.symbol === nextProps.symbol && prevProps.theme === nextProps.theme;
});