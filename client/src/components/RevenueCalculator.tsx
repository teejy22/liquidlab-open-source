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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Revenue Calculator
        </CardTitle>
        <CardDescription>
          Calculate your potential monthly earnings from trading fees and MoonPay commissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spot-volume">Monthly Spot Trading Volume</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="spot-volume"
                type="number"
                placeholder="1,000,000"
                value={spotVolume}
                onChange={(e) => setSpotVolume(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-500">0.2% fee • 70% to you</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="perp-volume">Monthly Perp Trading Volume</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="perp-volume"
                type="number"
                placeholder="5,000,000"
                value={perpVolume}
                onChange={(e) => setPerpVolume(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-500">0.1% fee • 70% to you</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moonpay-volume">Monthly MoonPay Purchases</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="moonpay-volume"
                type="number"
                placeholder="100,000"
                value={moonpayVolume}
                onChange={(e) => setMoonpayVolume(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-500">1% affiliate commission • 50% to you</p>
          </div>
        </div>

        {/* Results Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Monthly Earnings
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Spot Trading Revenue</span>
              <span className="font-medium">{formatCurrency(spotRevenue)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Perp Trading Revenue</span>
              <span className="font-medium">{formatCurrency(perpRevenue)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">MoonPay Affiliate Revenue</span>
              <span className="font-medium">{formatCurrency(moonpayRevenue)}</span>
            </div>
            
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Total Monthly Revenue</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Annual Projection */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Annual Projection</p>
              <p className="text-xs text-green-700 dark:text-green-300">Based on current monthly volume</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue * 12)}</p>
          </div>
        </div>

        {/* Revenue Split Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Trading fees split: 70% Platform Owner / 30% LiquidLab</p>
          <p>• MoonPay commission split: 50% Platform Owner / 50% LiquidLab</p>
          <p className="pt-2">LiquidLab's share from your inputs: {formatCurrency(liquidLabTotal)}/month</p>
        </div>
      </CardContent>
    </Card>
  );
}