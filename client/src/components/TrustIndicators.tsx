import { Shield, Lock, CheckCircle, Info, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface TrustIndicatorsProps {
  platformName: string;
  platformId: number;
  builderCode: string;
  customDomain?: string;
}

export function TrustIndicators({ 
  platformName, 
  platformId, 
  builderCode,
  customDomain 
}: TrustIndicatorsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-green-900 dark:text-green-100">Platform Security</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">SSL Secured</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>All data is encrypted using SSL/TLS certificates</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">Privy Secured</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enterprise-grade wallet security by Privy</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">LiquidLab Verified</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Officially verified by LiquidLab platform</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">Platform ID: #{platformId}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Unique platform identifier for verification</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 space-y-3">
          <div className="bg-white dark:bg-gray-900 rounded p-3 space-y-2">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">Security Features</h4>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Non-Custodial Trading:</strong> Your wallet remains in your control. The platform never has access to your private keys.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Direct Hyperliquid Integration:</strong> All trades execute directly on Hyperliquid DEX through official APIs.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Transparent Fees:</strong> Builder code <Badge variant="outline" className="ml-1">{builderCode}</Badge> takes only standard exchange fees.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Open Source Verification:</strong> Platform built on LiquidLab's audited infrastructure.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded p-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">How to Verify This Platform</h4>
            
            <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
              <li>Check the URL matches: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{customDomain || `${platformName.toLowerCase().replace(/\s+/g, '-')}.liquidlab.app`}</code></li>
              <li>Look for the green padlock (SSL) in your browser</li>
              <li>Verify the platform ID #{platformId} on LiquidLab.com</li>
              <li>Confirm Privy wallet connection shows official branding</li>
            </ol>
          </div>

          <div className="flex items-center justify-between">
            <a 
              href="https://liquidlab.com/verify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center gap-1"
            >
              Verify on LiquidLab.com
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <a 
              href="https://docs.liquidlab.com/security" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center gap-1"
            >
              Security Documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}