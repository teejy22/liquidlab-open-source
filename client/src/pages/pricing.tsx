import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check, X, Zap, Crown, Building2 } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for getting started with trading platform building",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "5 trading platforms",
      "Basic templates",
      "Community support",
      "Standard integrations",
      "Monthly analytics",
      "Basic customization"
    ],
    limitations: [
      "Limited to 100 users per platform",
      "LiquidLab branding",
      "Basic support only"
    ],
    popular: false,
    cta: "Get Started Free",
    ctaLink: "/builder"
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "For serious traders and small teams building multiple platforms",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Unlimited trading platforms",
      "Premium templates",
      "Priority support",
      "Advanced integrations",
      "Real-time analytics",
      "Full customization",
      "Custom domains",
      "White-label options",
      "API access"
    ],
    limitations: [
      "Up to 1,000 users per platform"
    ],
    popular: true,
    cta: "Start 14-Day Trial",
    ctaLink: "/builder"
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For large organizations and high-volume trading operations",
    icon: <Building2 className="w-6 h-6" />,
    features: [
      "Everything in Professional",
      "Unlimited users",
      "24/7 phone support",
      "Custom integrations",
      "Advanced analytics",
      "Multi-region deployment",
      "SLA guarantees",
      "Dedicated account manager",
      "Custom development"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales",
    ctaLink: "/contact"
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start building professional trading platforms today. Scale as you grow with flexible pricing that adapts to your needs.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="px-4 py-2">
              💰 Revenue sharing available
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🔄 Cancel anytime
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🚀 14-day free trial
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-liquid-green border-2 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-liquid-green text-white px-4 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-liquid-green text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Includes:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start">
                              <X className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <Link href={plan.ctaLink}>
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-liquid-green hover:bg-liquid-accent text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does revenue sharing work?
              </h3>
              <p className="text-gray-600">
                You earn a percentage of trading fees generated by users on your platform. Revenue sharing is available on all paid plans, with higher percentages on premium plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my platforms if I cancel?
              </h3>
              <p className="text-gray-600">
                Your platforms will continue to work, but you'll lose access to premium features and support. You can always reactivate your subscription to restore full functionality.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer custom enterprise solutions?
              </h3>
              <p className="text-gray-600">
                Yes, we work with large organizations to create custom solutions. Contact our sales team to discuss your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of traders who are already earning with LiquidLab
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder">
              <Button className="bg-white text-liquid-green hover:bg-gray-100 px-8 py-3 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-liquid-green px-8 py-3 text-lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}