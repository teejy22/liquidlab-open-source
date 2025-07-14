import { Button } from "@/components/ui/button";
import { useHyperliquidTrading } from "@/hooks/useHyperliquidTrading";
import { Loader2 } from "lucide-react";

export function HyperliquidPositions() {
  const { 
    authenticated,
    positions, 
    accountSummary, 
    positionsLoading,
    userAddress 
  } = useHyperliquidTrading();

  if (!authenticated) {
    return (
      <div className="bg-[#0a0a0a] border-t border-gray-900 p-8 text-center">
        <p className="text-gray-400">Connect your wallet to view positions</p>
      </div>
    );
  }

  if (positionsLoading) {
    return (
      <div className="bg-[#0a0a0a] border-t border-gray-900 p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border-t border-gray-900">
      {/* Account Summary Bar */}
      <div className="bg-[#0f0f0f] border-b border-gray-900 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Account Value:</span>
              <span className="font-mono text-white">
                ${accountSummary ? parseFloat(accountSummary.accountValue).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Margin Used:</span>
              <span className="font-mono text-white">
                ${accountSummary ? parseFloat(accountSummary.totalMarginUsed).toFixed(2) : '0.00'}
              </span>
              {accountSummary && parseFloat(accountSummary.accountValue) > 0 && (
                <span className="text-gray-400">
                  ({((parseFloat(accountSummary.totalMarginUsed) / parseFloat(accountSummary.accountValue)) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Free Collateral:</span>
              <span className="font-mono text-white">
                ${accountSummary ? parseFloat(accountSummary.withdrawable).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Total PnL:</span>
              {positions.length > 0 ? (
                <span className={`font-mono ${
                  positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0) >= 0 ? '+' : ''}
                  ${positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0).toFixed(2)}
                </span>
              ) : (
                <span className="font-mono text-gray-400">$0.00</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
              Deposit
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#0f0f0f] border-b border-gray-900">
            <tr className="text-gray-500">
              <th className="text-left py-3 px-4 font-normal whitespace-nowrap">Market</th>
              <th className="text-center py-3 px-3 font-normal whitespace-nowrap">Side</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Size</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Value</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Entry</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Mark</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Liq</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">PnL</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">PnL %</th>
              <th className="text-right py-3 px-3 font-normal whitespace-nowrap">Margin</th>
              <th className="text-center py-3 px-3 font-normal whitespace-nowrap">TP/SL</th>
              <th className="text-center py-3 px-4 font-normal whitespace-nowrap">Close</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-400">
                  No open positions
                </td>
              </tr>
            ) : (
              positions.map((position, index) => (
                <tr key={`${position.coin}-${index}`} className="border-b border-gray-900 hover:bg-[#0f0f0f] transition-colors">
                  <td className="py-2 px-4 font-mono">{position.coin}-USD</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`font-semibold ${
                      position.side === 'LONG' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {position.side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">{position.size.toFixed(4)}</td>
                  <td className="py-2 px-2 text-right font-mono text-gray-300">
                    ${position.positionValue.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {position.entryPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {position.markPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-orange-400">
                    {position.liquidationPrice > 0 ? position.liquidationPrice.toFixed(2) : 'N/A'}
                  </td>
                  <td className={`py-2 px-2 text-right font-mono ${
                    position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}${Math.abs(position.unrealizedPnl).toFixed(2)}
                  </td>
                  <td className={`py-2 px-2 text-right ${
                    position.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    ${position.marginUsed.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Button size="sm" variant="ghost" className="h-5 px-1 text-[10px] text-gray-400 hover:text-white">
                      Set
                    </Button>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Button size="sm" variant="ghost" className="h-5 px-2 text-[10px] text-gray-400 hover:text-white hover:bg-red-900/20">
                      Close
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}