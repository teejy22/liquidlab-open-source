import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Users, Palette, HeadphonesIcon, Zap, ChevronRight, Code, Server, Lock, Phone } from "lucide-react";

export default function Enterprise() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Enterprise Solutions for Financial Institutions
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              White-glove service for hedge funds, prop trading firms, and financial institutions building on Hyperliquid
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-liquid-green text-black hover:bg-liquid-accent transition-colors text-lg px-8">
                  Schedule Consultation
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-gray-800 text-white border-white hover:bg-white hover:text-gray-900 transition-colors text-lg px-8">
                  View Enterprise Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Scale, Designed for Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our enterprise solution provides everything your institution needs to launch and scale a professional trading platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">Bank-Grade Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enterprise-grade infrastructure with SOC 2 Type II compliance, advanced DDoS protection, and complete audit trails
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <Palette className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">Custom Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete white-label solution with custom domains, advanced theming, and brand-specific UI/UX design
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <HeadphonesIcon className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">Dedicated Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  24/7 priority support with dedicated account manager and direct access to our engineering team
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <Code className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">Custom Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bespoke functionality including advanced order types, risk management tools, and proprietary trading algorithms
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <Server className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">API Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Seamless integration with your existing systems, including risk management, compliance, and reporting tools
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-liquid-green transition-colors">
              <CardHeader>
                <Lock className="w-12 h-12 text-liquid-green mb-4" />
                <CardTitle className="text-xl">Compliance Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in KYC/AML compliance, transaction monitoring, and regulatory reporting capabilities
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Exclusive Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced capabilities designed for institutional trading needs
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Multi-Account Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage multiple trading accounts with role-based access control, sub-account hierarchies, and consolidated reporting.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Unlimited sub-accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Granular permission controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Cross-account position monitoring</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 p-8 rounded-lg">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <Users className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Advanced Risk Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Institutional-grade risk controls with real-time monitoring, automated circuit breakers, and customizable limits.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Real-time P&L tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Automated position limits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Custom risk metrics</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 p-8 rounded-lg">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <Shield className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Priority Infrastructure
                </h3>
                <p className="text-gray-600 mb-4">
                  Dedicated servers with guaranteed uptime, ultra-low latency connections, and priority order routing.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>99.99% uptime SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Sub-millisecond latency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-liquid-green" />
                    <span>Dedicated support team</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 p-8 rounded-lg">
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <Zap className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Institutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why top trading firms choose LiquidLab Enterprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Building2 className="w-12 h-12 text-liquid-green" />
                  <div>
                    <CardTitle>Apex Capital Management</CardTitle>
                    <CardDescription>Hedge Fund - $2.5B AUM</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "LiquidLab's enterprise solution transformed our trading operations. The custom risk management tools and dedicated support have been invaluable. We've seen a 40% increase in trading efficiency since implementation."
                </p>
                <p className="mt-4 font-semibold">- James Chen, CTO</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Building2 className="w-12 h-12 text-liquid-green" />
                  <div>
                    <CardTitle>Quantum Trading Partners</CardTitle>
                    <CardDescription>Prop Trading Firm</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "The white-glove service exceeded our expectations. From custom branding to API integration with our existing systems, everything was seamless. Our traders love the platform."
                </p>
                <p className="mt-4 font-semibold">- Sarah Martinez, Head of Trading</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Onboarding Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Onboarding Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From consultation to launch in just 4 weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-liquid-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Discovery Call</h3>
              <p className="text-gray-600">
                Understand your needs and trading requirements
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-liquid-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Custom Design</h3>
              <p className="text-gray-600">
                Create your branded platform with custom features
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-liquid-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Integration</h3>
              <p className="text-gray-600">
                Connect with your systems and test thoroughly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-liquid-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Launch & Scale</h3>
              <p className="text-gray-600">
                Go live with ongoing support and optimization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Trading Infrastructure?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join leading institutions already building on LiquidLab Enterprise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-liquid-green text-black hover:bg-liquid-accent transition-colors text-lg px-8">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Enterprise Demo
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-gray-800 text-white border-white hover:bg-white hover:text-gray-900 transition-colors text-lg px-8"
              onClick={() => window.location.href = 'mailto:enterprise@liquidlab.trade'}
            >
              Contact Sales Team
            </Button>
          </div>
          <p className="mt-8 text-gray-400">
            Or call us directly at <span className="text-white font-semibold">+1 (888) 555-0123</span>
          </p>
        </div>
      </section>
    </div>
  );
}