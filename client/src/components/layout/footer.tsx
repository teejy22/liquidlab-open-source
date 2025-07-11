import { Link } from "wouter";
import { Github, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-liquid-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold">
                LIQUID<span className="text-liquid-green">LAB</span>
              </div>
              <div className="ml-2 w-6 h-6 bg-liquid-green rounded transform rotate-45"></div>
            </div>
            <p className="text-gray-400 mb-4">
              Build professional trading platforms on Hyperliquid with zero coding required.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-liquid-green transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-liquid-green transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-liquid-green transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/templates">
                  <a className="hover:text-liquid-green transition-colors">Templates</a>
                </Link>
              </li>
              <li>
                <Link href="/builder">
                  <a className="hover:text-liquid-green transition-colors">Builder</a>
                </Link>
              </li>
              <li>
                <Link href="/analytics">
                  <a className="hover:text-liquid-green transition-colors">Analytics</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Integrations</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Community</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Support</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">About</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-liquid-green transition-colors">Privacy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 LiquidLab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
