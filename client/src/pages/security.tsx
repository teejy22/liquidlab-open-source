import { Shield, Lock, CheckCircle, AlertTriangle, ExternalLink, Key, Server, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Security() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Platform Security & Trust
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Understanding how LiquidLab protects traders and ensures platform authenticity
          </p>
        </div>

        {/* Key Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Lock className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Non-Custodial Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Your wallet keys never leave your control. All transactions are signed locally 
                and executed directly on Hyperliquid DEX.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Platform Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Every LiquidLab platform is verified and assigned a unique ID. Check any 
                platform's authenticity at liquidlab.trade/verify.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Key className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Privy Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise-grade wallet security powered by Privy, supporting social logins 
                and multi-factor authentication.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Security Information */}
        <Tabs defaultValue="verification" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="trading">Trading Security</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Verify a Trading Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Before Connecting Your Wallet:</h3>
                  
                  <div className="pl-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Check the URL</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Legitimate platforms use either a custom domain or a .liquidlab.app subdomain. 
                          Look for the SSL padlock in your browser.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Look for the Verification Badge</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          All legitimate platforms display a "LiquidLab Verified" badge in the header. 
                          Click it to see the platform ID and verification details.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Verify Platform ID</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Visit{" "}
                          <a 
                            href="https://liquidlab.trade/verify" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            liquidlab.trade/verify
                          </a>
                          {" "}and enter the platform ID to confirm it's officially registered.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Check Privy Branding</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          When connecting your wallet, ensure the Privy modal shows official branding 
                          and the correct platform name.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Never enter your seed phrase or private keys on any website. 
                    Legitimate platforms only request wallet connections through Privy or MetaMask.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Non-Custodial Architecture</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Your funds remain in your wallet until you execute a trade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>All transactions are signed locally in your browser</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Direct settlement on Hyperliquid DEX smart contracts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>No intermediary holds your assets</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Transaction Transparency</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>All trades visible on Hyperliquid explorer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Builder fees clearly displayed before trading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Real-time balance updates from blockchain</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Hosting & Security
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• SSL/TLS encryption on all domains</li>
                      <li>• DDoS protection via Cloudflare</li>
                      <li>• Regular security audits</li>
                      <li>• Automated vulnerability scanning</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      API Security
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• Rate limiting on all endpoints</li>
                      <li>• API key authentication</li>
                      <li>• Request signing verification</li>
                      <li>• Audit logging for all actions</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Third-Party Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Hyperliquid</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Official API integration for trading and market data
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Privy</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enterprise wallet infrastructure with MFA support
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">MoonPay</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        KYC/AML compliant fiat on-ramp services
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Suspicious Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    If you encounter a suspicious website claiming to be a LiquidLab platform, 
                    please report it immediately to protect other traders.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold">Warning Signs of Fake Platforms:</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <span>Asks for seed phrases or private keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <span>No verification badge or invalid platform ID</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <span>Suspicious domain not ending in .liquidlab.app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <span>Missing SSL certificate (no padlock in browser)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <span>Promises of guaranteed returns or bonuses</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">How to Report</h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Report via liquidlab.trade/report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Email: security@liquidlab.trade
                    </Button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Include the suspicious URL, screenshots, and any other relevant information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Trade Safely?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Build your own secure trading platform or explore verified platforms built by our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/builder">
                  <Button size="lg">
                    Start Building
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline">
                    Browse Platforms
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}