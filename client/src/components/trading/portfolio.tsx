import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface PortfolioProps {
  height?: number;
  showHeader?: boolean;
}

interface Position {
  symbol: string;
  size: string;
  pnl: string;
  pnlPercent: string;
  avgPrice: string;
  currentPrice: string;
}

const mockPortfolio = {
  totalBalance: "125,432.87",
  availableBalance: "45,234.56",
  totalPnL: "+12,543.21",
  totalPnLPercent: "+11.13",
  positions: [
    {
      symbol: "BTC",
      size: "2.45",
      pnl: "+5,234.56",
      pnlPercent: "+15.23",
      avgPrice: "61,234.00",
      currentPrice: "63,345.67"
    },
    {
      symbol: "ETH",
      size: "18.76",
      pnl: "+3,456.78",
      pnlPercent: "+8.45",
      avgPrice: "3,234.56",
      currentPrice: "3,521.34"
    },
    {
      symbol: "SOL",
      size: "234.56",
      pnl: "-1,234.56",
      pnlPercent: "-4.56",
      avgPrice: "98.45",
      currentPrice: "94.12"
    }
  ]
};

export default function Portfolio({ height, showHeader = true }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState(mockPortfolio);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time portfolio updates
    const interval = setInterval(() => {
      setPortfolio(prev => ({
        ...prev,
        totalBalance: (parseFloat(prev.totalBalance.replace(/,/g, '')) + (Math.random() - 0.5) * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalPnL: (parseFloat(prev.totalPnL.replace(/[+,]/g, '')) + (Math.random() - 0.5) * 10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Portfolio
            </div>
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              USDT
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Account Summary */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-gray-500">Total Balance</p>
            <p className="text-lg font-semibold">${portfolio.totalBalance}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Available</p>
            <p className="text-lg font-semibold">${portfolio.availableBalance}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total P&L</p>
            <p className={`text-lg font-semibold ${portfolio.totalPnL.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.totalPnL}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">P&L %</p>
            <p className={`text-lg font-semibold ${portfolio.totalPnLPercent.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.totalPnLPercent}%
            </p>
          </div>
        </div>

        {/* Positions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center">
            Open Positions
            <Badge variant="outline" className="ml-2 text-xs">
              {portfolio.positions.length}
            </Badge>
          </h4>
          <div className="space-y-2" style={{ maxHeight: height ? `${height - 250}px` : 'auto', overflowY: 'auto' }}>
            {portfolio.positions.map((position, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium">{position.symbol}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {position.size}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center ${position.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {position.pnl.startsWith('+') ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      <span className="font-medium">{position.pnl}</span>
                    </div>
                    <span className={`text-xs ${position.pnlPercent.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {position.pnlPercent}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Avg: ${position.avgPrice}</span>
                  <span>Current: ${position.currentPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}