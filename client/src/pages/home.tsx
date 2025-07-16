import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueCalculator } from "@/components/RevenueCalculator";

import { 
  TrendingUp, 
  Users, 
  Zap, 
  Globe,
  BarChart3,
  Smartphone,
  Rocket,
  DollarSign,
  CheckCircle,
  Plug,
  Wallet,
  Check,
  CreditCard,
  Shield,
  Lock,
  Key,
  AlertTriangle,
  Activity,
  FileText,
  Eye
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Your Own
                <span className="block">Trading Platform</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-green-100">
                Create professional trading interfaces on Hyperliquid with drag-and-drop simplicity. Generate revenue through builder codes while providing seamless trading experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/builder">
                  <button 
                    className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#00D084', 
                      border: '2px solid #00D084' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#00D084';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#00D084';
                    }}
                  >
                    Start Building Free
                  </button>
                </Link>
                <Link href="/templates">
                  <button 
                    className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#00D084', 
                      border: '2px solid #00D084' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#00D084';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#00D084';
                    }}
                  >
                    View Templates
                  </button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-green-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>No coding required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Hyperliquid integration</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Revenue sharing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-semibold">NEW: Polymarket Premium</span>
                </div>
              </div>
            </div>
            <div className="lg:block hidden">
              {/* Trading Platform Preview */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-liquid-green to-liquid-accent rounded-xl blur-xl opacity-20"></div>
                <Card className="transform rotate-3 hover:rotate-0 transition-transform shadow-2xl relative backdrop-blur-sm bg-white/90">
                  <CardContent className="p-6">
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">BTC/USD</h3>
                        <div className="text-green-400 font-mono">$67,845.23</div>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded relative overflow-hidden">
                        {/* Price Chart Lines */}
                        <div className="absolute inset-0 p-2">
                          <svg width="100%" height="100%" viewBox="0 0 200 100" className="opacity-70">
                            <polyline
                              points="10,80 30,70 50,85 70,60 90,65 110,45 130,40 150,55 170,35 190,25"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              className="animate-pulse"
                            />
                            <polyline
                              points="10,90 30,85 50,75 70,80 90,70 110,65 130,60 150,50 170,45 190,40"
                              fill="none"
                              stroke="rgba(255,255,255,0.5)"
                              strokeWidth="1"
                            />
                            {/* Price points */}
                            <circle cx="190" cy="25" r="3" fill="white" className="animate-pulse" />
                            <circle cx="170" cy="35" r="2" fill="rgba(255,255,255,0.8)" />
                            <circle cx="150" cy="55" r="2" fill="rgba(255,255,255,0.8)" />
                          </svg>
                        </div>
                        {/* Price trend indicator */}
                        <div className="absolute top-2 right-2 text-white text-xs font-mono">
                          +2.34%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="bg-green-500 text-white hover:bg-green-600">Buy</Button>
                      <Button className="bg-red-500 text-white hover:bg-red-600">Sell</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privy Wallet Infrastructure Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="mb-4 bg-purple-100 text-purple-700">Enterprise Infrastructure</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Privy Wallet Infrastructure Included
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Every platform you build comes with enterprise-grade wallet infrastructure powered by Privy - at absolutely no additional cost.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Social logins (Google, Twitter, Discord)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Email & SMS authentication</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Built-in wallet creation for new users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Support for 10+ external wallets</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>$0 extra cost</strong> - Included free with every LiquidLab platform
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl shadow-2xl flex items-center justify-center">
                  <Wallet className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MoonPay Integration Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 order-2 md:order-1">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl shadow-2xl flex items-center justify-center">
                  <CreditCard className="w-24 h-24 text-white" />
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <Badge className="mb-4 bg-blue-100 text-blue-700">Fiat On-Ramp</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  MoonPay Integration Built-In
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Every trading platform includes MoonPay's fiat-to-crypto gateway, making it easy for users to fund their accounts with traditional payment methods.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Credit card & bank transfer support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">170+ countries supported</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Built-in KYC/AML compliance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Earn affiliate revenue on transactions</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Automatically integrated</strong> - No setup required, works out of the box
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank-Level Security Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500 text-white">Enterprise Security</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Bank-Level Security Built Into Every Platform
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your traders' security is our top priority. Every LiquidLab platform is deployed with enterprise-grade security features that protect both platform owners and traders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Feature Cards */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">SSL/TLS Encryption</h3>
                <p className="text-gray-400 text-sm">
                  All data transmission is encrypted with industry-standard SSL/TLS certificates, ensuring secure communication between traders and your platform.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Non-Custodial Architecture</h3>
                <p className="text-gray-400 text-sm">
                  Users maintain full control of their wallets and funds. Your platform never holds private keys, eliminating custody risk.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2FA Authentication</h3>
                <p className="text-gray-400 text-sm">
                  Built-in two-factor authentication support using TOTP, adding an extra layer of security for user accounts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Anti-Phishing Protection</h3>
                <p className="text-gray-400 text-sm">
                  Advanced phishing detection with unique verification codes and domain legitimacy checks protect users from scam sites.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Rate Limiting & DDoS Protection</h3>
                <p className="text-gray-400 text-sm">
                  Intelligent rate limiting prevents API abuse and DDoS attacks, ensuring your platform stays online during high traffic.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Audit Logging</h3>
                <p className="text-gray-400 text-sm">
                  Comprehensive audit logs track all security events, login attempts, and transactions for complete transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">24/7 Security Monitoring</h3>
                <p className="text-gray-400 text-sm">
                  Real-time security monitoring detects and prevents threats. Automated systems track suspicious patterns and protect against emerging risks.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Security Features */}
          <div className="mt-12 bg-gray-800/30 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Additional Security Measures</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">CSRF Protection</span>
                    <p className="text-gray-500 text-sm">Cross-Site Request Forgery prevention on all state-changing operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">Input Sanitization</span>
                    <p className="text-gray-500 text-sm">XSS prevention with DOMPurify and comprehensive input validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">Security Headers</span>
                    <p className="text-gray-500 text-sm">Helmet.js implementation with CSP, HSTS, and X-Frame-Options</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">Platform Verification</span>
                    <p className="text-gray-500 text-sm">Unique verification codes for each platform to prevent impersonation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">Suspicious Activity Monitoring</span>
                    <p className="text-gray-500 text-sm">Real-time detection and automatic suspension of malicious platforms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-300 font-medium">Webhook Verification</span>
                    <p className="text-gray-500 text-sm">Cryptographic signing for all external service integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 px-6 py-3 rounded-full">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Enterprise-Grade Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Polymarket Premium Feature */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-purple-600 text-white mb-4 px-3 py-1">NEW PREMIUM FEATURE</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <span className="text-purple-600">Polymarket</span> Prediction Markets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expand beyond trading with prediction markets. Earn additional 0.5% platform fees on every prediction.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Why Add Polymarket?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <TrendingUp className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Additional Revenue Stream</span>
                      <p className="text-gray-600 text-sm mt-1">Earn 0.5% on all prediction trades, on top of your trading fees</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Attract New Users</span>
                      <p className="text-gray-600 text-sm mt-1">Appeal to prediction market enthusiasts and event traders</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Multi-Chain Support</span>
                      <p className="text-gray-600 text-sm mt-1">Seamlessly switch between Hyperliquid and Polygon networks</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <Card className="border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-700">Premium Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-purple-600">$50</div>
                    <div className="text-purple-500">/month</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                      <span>Integrated prediction markets</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                      <span>0.5% platform fee on predictions</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                      <span>Purple-themed professional UI</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                      <span>Social login options</span>
                    </div>
                  </div>
                  <Link href="/templates">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      View Polymarket Templates
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Calculator Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your Potential Earnings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how much you could earn from trading fees and MoonPay affiliate commissions
            </p>
          </div>
          <RevenueCalculator />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-liquid-green mb-2">$10M+</div>
              <div className="text-gray-600">Builder Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-liquid-green mb-2">500+</div>
              <div className="text-gray-600">Trading Platforms Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-liquid-green mb-2">50+</div>
              <div className="text-gray-600">Templates Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-liquid-green mb-2">24/7</div>
              <div className="text-gray-600">Hyperliquid Integration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Template Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Template
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with professionally designed templates optimized for different trading styles and user experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Professional Trader",
                category: "Professional",
                description: "Advanced charts, order book, and portfolio management for serious traders.",
                color: "bg-gray-900",
                accent: "bg-liquid-green",
                price: "$67,845"
              },
              {
                name: "Mobile Trader",
                category: "Mobile First",
                description: "Optimized for mobile trading with touch-friendly interfaces.",
                color: "bg-indigo-900",
                accent: "bg-purple-500",
                price: "$2,340"
              },
              {
                name: "Clean Interface",
                category: "Minimal",
                description: "Minimalist design focused on essential trading functions.",
                color: "bg-gray-100 border-2 border-gray-200",
                accent: "bg-gray-600",
                price: "$45,230"
              }
            ].map((template, index) => (
              <Card key={index} className="overflow-hidden card-hover">
                <div className={`${template.color} p-6 text-white h-48 relative`}>
                  <div className={`absolute top-4 right-4 ${template.accent} text-white px-2 py-1 rounded text-xs font-semibold`}>
                    {template.category}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="text-green-400 font-mono text-sm">{template.price}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-800 h-8 rounded"></div>
                    <div className="bg-gray-800 h-8 rounded"></div>
                    <div className="bg-gray-800 h-8 rounded"></div>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded opacity-30"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-liquid-green font-semibold">Free</span>
                    <Link href={`/builder/${index + 1}`}>
                      <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/templates">
              <Button className="bg-liquid-green text-white px-8 py-4 rounded-lg font-semibold hover:bg-liquid-accent transition-colors text-lg">
                Browse All Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built-in features to create professional trading platforms that compete with the best in the industry.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Plug,
                title: "Hyperliquid Integration",
                description: "Direct connection to Hyperliquid's orderbook and trading engine for lightning-fast execution.",
                color: "bg-liquid-green/10 text-liquid-green"
              },
              {
                icon: BarChart3,
                title: "TradingView Charts",
                description: "Professional charting tools with advanced indicators and drawing tools.",
                color: "bg-blue-500/10 text-blue-500"
              },
              {
                icon: Wallet,
                title: "Privy Wallet Integration",
                description: "Enterprise wallet infrastructure with social logins, built-in wallets, and 10+ wallet connections.",
                color: "bg-purple-500/10 text-purple-500"
              },
              {
                icon: Smartphone,
                title: "Mobile Responsive",
                description: "All platforms are optimized for mobile trading on any device.",
                color: "bg-orange-500/10 text-orange-500"
              },
              {
                icon: Rocket,
                title: "One-Click Deploy",
                description: "Launch your trading platform with a single click and start earning immediately.",
                color: "bg-red-500/10 text-red-500"
              },
              {
                icon: DollarSign,
                title: "Revenue Sharing",
                description: "Earn revenue through builder codes and referral programs automatically.",
                color: "bg-green-500/10 text-green-500"
              },
              {
                icon: Users,
                title: "Trader Support Included",
                description: "Basic trader support provided by LiquidLab for all platforms, ensuring your users get help when needed.",
                color: "bg-indigo-500/10 text-indigo-500"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Build Your Trading Empire?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of builders creating the next generation of trading platforms. Start free, scale unlimited.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <button 
                className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#00D084', 
                  border: '2px solid #00D084' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00D084';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#00D084';
                }}
              >
                Start Building Free
              </button>
            </Link>
            <button 
              className="px-8 py-4 rounded-lg font-semibold transition-colors text-lg shadow-lg"
              style={{ 
                backgroundColor: 'white', 
                color: '#00D084', 
                border: '2px solid #00D084' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00D084';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#00D084';
              }}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
