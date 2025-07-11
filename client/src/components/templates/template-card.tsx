import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Template } from "@/types";
import { BarChart3, Smartphone, Minimize2, TrendingUp, Star } from "lucide-react";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Professional':
        return <BarChart3 className="w-5 h-5" />;
      case 'Mobile First':
        return <Smartphone className="w-5 h-5" />;
      case 'Minimal':
        return <Minimize2 className="w-5 h-5" />;
      case 'Analytics':
        return <TrendingView className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getTemplatePreview = () => {
    const colors = {
      'Professional': 'bg-gray-900 text-white',
      'Mobile First': 'bg-indigo-900 text-white',
      'Minimal': 'bg-gray-100 text-gray-900 border-2 border-gray-200',
      'Analytics': 'bg-blue-900 text-white',
      'DeFi': 'bg-green-900 text-white'
    };

    return (
      <div className={`${colors[template.category as keyof typeof colors]} p-6 h-48 relative`}>
        <div className="absolute top-4 right-4 bg-liquid-green text-white px-2 py-1 rounded text-xs font-semibold">
          {template.category}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{template.name}</h3>
          <div className="text-green-400 font-mono text-sm">$67,845</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
          <div className="bg-gray-800 h-8 rounded opacity-50"></div>
        </div>
        <div className="h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded opacity-30"></div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden card-hover">
      {getTemplatePreview()}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{template.name}</h3>
          <div className="flex items-center text-liquid-green">
            {getCategoryIcon(template.category)}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{template.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-liquid-green font-semibold">Free</span>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          <Link href={`/builder/${template.id}`}>
            <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
              Use Template
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
