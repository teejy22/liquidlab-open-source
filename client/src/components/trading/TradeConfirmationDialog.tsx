import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

interface TradeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  market: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  leverage: number;
  isMarketOrder: boolean;
  markPrice: number;
  liquidationPrice?: number;
  notionalValue: number;
  requiredMargin: number;
  fee: number;
  isReduceOnly?: boolean;
  sizeMode?: 'asset' | 'usd';
}

export function TradeConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  market,
  side,
  size,
  price,
  leverage,
  isMarketOrder,
  markPrice,
  liquidationPrice,
  notionalValue,
  requiredMargin,
  fee,
  isReduceOnly,
  sizeMode = 'asset'
}: TradeConfirmationDialogProps) {
  const priceDisplay = isMarketOrder ? markPrice : price;
  const sideColor = side === 'buy' ? 'text-green-400' : 'text-red-400';
  const sideBgColor = side === 'buy' ? 'bg-green-900/20' : 'bg-red-900/20';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Trade</DialogTitle>
          <DialogDescription className="text-gray-400">
            Review your order details before submitting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Market and Side */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Market</span>
              <span className="font-semibold text-white">{market}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Side</span>
              <span className={`font-semibold uppercase ${sideColor} ${sideBgColor} px-2 py-1 rounded`}>
                {side}
              </span>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Type</span>
                <span className="text-white">{isMarketOrder ? 'Market' : 'Limit'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Size</span>
                <span className="text-white">
                  {sizeMode === 'usd' ? `$${size.toFixed(2)} USD` : `${size.toLocaleString()} ${market}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="text-white">${priceDisplay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Leverage</span>
                <span className="font-semibold text-white">{leverage}x</span>
              </div>
              {isReduceOnly && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reduce Only</span>
                  <span className="text-yellow-400">Yes</span>
                </div>
              )}
            </div>
          </Card>

          <Separator className="bg-gray-700" />

          {/* Position Details */}
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h4 className="font-semibold mb-3 text-sm uppercase text-gray-400">Position Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Notional Value</span>
                <span className="text-white">${notionalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Margin</span>
                <span className="text-white">${requiredMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Fee (0.1%)</span>
                <span className="text-white">${fee.toFixed(2)}</span>
              </div>
              {liquidationPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Liquidation Price</span>
                  <span className="text-orange-400 font-semibold">
                    ${liquidationPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Warning for high leverage */}
          {leverage >= 10 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-semibold">High Leverage Warning</p>
                <p className="text-gray-300 mt-1">
                  You are using {leverage}x leverage. High leverage increases both potential profits and losses.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            Confirm {side === 'buy' ? 'Buy' : 'Sell'} Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}