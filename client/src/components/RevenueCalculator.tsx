import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

export function RevenueCalculator() {
  const [spotVolume, setSpotVolume] = useState("");
  const [perpVolume, setPerpVolume] = useState("");
  const [moonpayVolume, setMoonpayVolume] = useState("");

  // Fee rates
  const SPOT_FEE_RATE = 0.002; // 0.2%
  const PERP_FEE_RATE = 0.001; // 0.1%
  const MOONPAY_AFFILIATE_RATE = 0.01; // 1%
  
  // Platform owner shares
  const TRADING_FEE_SHARE = 0.7; // 70% to platform owner
  const MOONPAY_SHARE = 0.5; // 50% to platform owner

  // Calculate revenues
  const spotRevenue = parseFloat(spotVolume || "0") * SPOT_FEE_RATE * TRADING_FEE_SHARE;
  const perpRevenue = parseFloat(perpVolume || "0") * PERP_FEE_RATE * TRADING_FEE_SHARE;
  const moonpayRevenue = parseFloat(moonpayVolume || "0") * MOONPAY_AFFILIATE_RATE * MOONPAY_SHARE;
  const totalRevenue = spotRevenue + perpRevenue + moonpayRevenue;

  // LiquidLab's share
  const liquidLabTrading = (spotRevenue + perpRevenue) * (0.3 / 0.7); // 30% share
  const liquidLabMoonpay = moonpayRevenue; // 50% share (same as platform owner)
  const liquidLabTotal = liquidLabTrading + liquidLabMoonpay;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-4 h-4" />
          Revenue Calculator
        </CardTitle>
        <CardDescription className="text-sm">
          Calculate your monthly earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        {/* Input Section - Compact Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="spot-volume" className="text-xs">Spot Volume</Label>
              <span className="text-[10px] text-gray-500">0.2% • 70% yours</span>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
              <Input
                id="spot-volume"
                type="number"
                placeholder="1,000,000"
                value={spotVolume}
                onChange={(e) => setSpotVolume(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="perp-volume" className="text-xs">Perp Volume</Label>
              <span className="text-[10px] text-gray-500">0.1% • 70% yours</span>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
              <Input
                id="perp-volume"
                type="number"
                placeholder="5,000,000"
                value={perpVolume}
                onChange={(e) => setPerpVolume(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="moonpay-volume" className="text-xs">MoonPay Purchases</Label>
              <span className="text-[10px] text-gray-500">1% • 50% yours</span>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
              <Input
                id="moonpay-volume"
                type="number"
                placeholder="100,000"
                value={moonpayVolume}
                onChange={(e) => setMoonpayVolume(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Section - Compact */}
        <div className="border-t pt-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Spot</span>
              <span className="font-medium">{formatCurrency(spotRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Perp</span>
              <span className="font-medium">{formatCurrency(perpRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MoonPay</span>
              <span className="font-medium">{formatCurrency(moonpayRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual</span>
              <span className="font-medium">{formatCurrency(totalRevenue * 12)}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-sm font-semibold">Monthly Total</span>
            <span className="text-xl font-bold text-[#1dd1a1]">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        {/* Revenue Split Info - Tiny Text */}
        <div className="text-[10px] text-gray-500 pt-2 border-t">
          <p>LiquidLab share: {formatCurrency(liquidLabTotal)}/mo</p>
        </div>
      </CardContent>
    </Card>
  );
}