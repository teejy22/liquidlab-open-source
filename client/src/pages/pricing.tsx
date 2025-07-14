import { Check, Zap, TrendingUp, Users, Shield, DollarSign, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { RevenueCalculator } from "@/components/RevenueCalculator";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">No Upfront Costs</Badge>
          <h1 className="text-4xl font-bold mb-4">Build Your Trading Platform for Free</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start building immediately. LiquidLab only makes money when you do - through a simple revenue share on trading fees.
          </p>
        </div>

        {/* Revenue Share Model */}
        <Card className="max-w-5xl mx-auto mb-16 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              Simple Revenue Sharing Model
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Two fee structures optimized for different trading types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Spot Trading */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Spot Trading
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Builder Fee</span>
                    <span className="font-semibold">0.2%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">70%</div>
                      <div className="text-xs font-medium">You Keep</div>
                      <div className="text-xs text-muted-foreground mt-1">0.14% of volume</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30%</div>
                      <div className="text-xs font-medium">LiquidLab</div>
                      <div className="text-xs text-muted-foreground mt-1">0.06% of volume</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    Example: $10,000 spot trade = $20 fee
                    <br />You earn: $14 • LiquidLab: $6
                  </div>
                </div>
              </div>

              {/* Perp Trading */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Perp Trading
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Builder Fee</span>
                    <span className="font-semibold">0.1% <span className="text-xs text-muted-foreground">(max allowed)</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">70%</div>
                      <div className="text-xs font-medium">You Keep</div>
                      <div className="text-xs text-muted-foreground mt-1">0.07% of volume</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30%</div>
                      <div className="text-xs font-medium">LiquidLab</div>
                      <div className="text-xs text-muted-foreground mt-1">0.03% of volume</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    Example: $10,000 perp trade = $10 fee
                    <br />You earn: $7 • LiquidLab: $3
                  </div>
                </div>
              </div>
            </div>

            {/* MoonPay Affiliate Revenue */}
            <div className="border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                MoonPay Fiat On-Ramp Revenue
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Affiliate Commission</span>
                  <span className="font-semibold">1% <span className="text-xs text-muted-foreground">(of fiat purchases)</span></span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">50%</div>
                    <div className="text-xs font-medium">You Keep</div>
                    <div className="text-xs text-muted-foreground mt-1">0.5% of purchases</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50%</div>
                    <div className="text-xs font-medium">LiquidLab</div>
                    <div className="text-xs text-muted-foreground mt-1">0.5% of purchases</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Example: $10,000 crypto purchase = $100 commission
                  <br />You earn: $50 • LiquidLab: $50
                </div>
              </div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">$0</div>
              <div className="text-sm font-medium mt-2">Upfront Cost</div>
              <div className="text-xs text-muted-foreground mt-1">No setup fees • No monthly charges • No hidden costs</div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Calculator */}
        <div className="mb-16">
          <RevenueCalculator />
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Everything Included, No Hidden Costs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Rocket className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Unlimited Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build as many trading platforms as you want. Each with its own custom domain and branding.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>All Premium Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access our entire library of professional trading interface templates. No restrictions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your revenue, user activity, and trading volume with comprehensive dashboards.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Builder & Referral Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate additional revenue through builder codes and referral programs.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-grade security, SSL certificates, and DDoS protection included at no extra cost.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Instant Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your trading fee revenue is automatically deposited to your wallet. No waiting periods.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-lg mb-6 opacity-90">
                Join hundreds of traders who are already generating passive income with their custom trading platforms.
              </p>
              <Link href="/builder">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Start Building for Free
                </Button>
              </Link>
              <p className="mt-4 text-sm opacity-80">
                No credit card required • Start earning in minutes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-card rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I get paid?</h3>
              <p className="text-muted-foreground">
                Your earnings are automatically deposited to your connected wallet in real-time. You earn 70% of trading fees (0.14% on spot trades, 0.07% on perp trades) plus 50% of MoonPay affiliate commissions (0.5% of fiat purchases). No minimum payout thresholds.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
              <p className="text-muted-foreground">
                No hidden fees whatsoever. You only share revenue from actual trades. Domain hosting, SSL, templates, and all features are included at no extra cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What types of trading are supported?</h3>
              <p className="text-muted-foreground">
                Your platforms support both Spot Trading (0.2% builder fee) and Perpetual Trading (0.1% builder fee). You keep 70% of all builder fees generated. The fee structures are optimized for each trading type.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I use my own domain?</h3>
              <p className="text-muted-foreground">
                Yes! Custom domains are included free. We handle all the technical setup, SSL certificates, and hosting.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What if I don't get any traders?</h3>
              <p className="text-muted-foreground">
                Then you pay nothing! LiquidLab only makes money when you do. There are no monthly fees, hosting costs, or maintenance charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How much can I earn?</h3>
              <p className="text-muted-foreground">
                Your earnings scale with trading volume. A platform doing $1M daily spot volume generates $1,400/day (0.14%). For perp trading, $1M daily volume generates $700/day (0.07%). Many platforms trade both types.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does MoonPay revenue work?</h3>
              <p className="text-muted-foreground">
                When users buy crypto through MoonPay on your platform, you earn 0.5% of the purchase amount (50% of the 1% affiliate commission). For example, if users purchase $100,000 worth of crypto per month, you earn an additional $500/month on top of trading fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}