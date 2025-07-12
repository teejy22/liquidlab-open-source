import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Wallet
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
                  <button className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors text-lg shadow-lg">
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
              </div>
            </div>
            <div className="lg:block hidden">
              {/* Trading Platform Preview */}
              <Card className="transform rotate-3 hover:rotate-0 transition-transform shadow-2xl">
                <CardContent className="p-6">
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">BTC/USD</h3>
                      <div className="text-green-400 font-mono">$67,845.23</div>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded opacity-50"></div>
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
                title: "Multi-Wallet Support",
                description: "Connect with MetaMask, WalletConnect, Coinbase Wallet, and more.",
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
              <button className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors text-lg shadow-lg">
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
