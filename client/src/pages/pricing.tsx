import { Check, Zap, TrendingUp, Users, Shield, DollarSign, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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
        <Card className="max-w-4xl mx-auto mb-16 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              Simple Revenue Sharing Model
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Every trade on your platform has a 0.2% fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">0.15%</div>
                <div className="text-sm font-medium mt-2">Goes to You</div>
                <div className="text-xs text-muted-foreground mt-1">Platform Owner Revenue</div>
              </div>
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0.05%</div>
                <div className="text-sm font-medium mt-2">Goes to LiquidLab</div>
                <div className="text-xs text-muted-foreground mt-1">Platform Fee</div>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">$0</div>
                <div className="text-sm font-medium mt-2">Upfront Cost</div>
                <div className="text-xs text-muted-foreground mt-1">Start Building Today</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-center text-sm">
                <strong>Example:</strong> A $10,000 trade generates $20 in fees. You keep $15, LiquidLab gets $5.
              </p>
            </div>
          </CardContent>
        </Card>

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
                Your 0.15% share of trading fees is automatically deposited to your connected wallet in real-time. No minimum payout thresholds.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
              <p className="text-muted-foreground">
                No hidden fees whatsoever. You only share revenue from actual trades. Domain hosting, SSL, templates, and all features are included at no extra cost.
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
                Your earnings scale with trading volume. A platform doing $1M in daily volume would generate $1,500/day for you (0.15% of volume).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}