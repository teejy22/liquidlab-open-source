import { Shield, CheckCircle, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  verificationCode?: string;
}

export function TrustIndicators({ 
  platformName, 
  platformId, 
  builderCode,
  customDomain,
  verificationCode 
}: TrustIndicatorsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md px-2 py-1 mb-1 bg-[#080505]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-[10px] font-medium text-green-900 dark:text-green-100">Secure Platform</span>
          </div>
          
          <TooltipProvider>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] text-green-800 dark:text-green-200">SSL</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>All data is encrypted using SSL/TLS certificates</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] text-green-800 dark:text-green-200">Privy</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enterprise-grade wallet security by Privy</p>
                </TooltipContent>
              </Tooltip>



              {verificationCode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 dark:bg-blue-900/30 px-1.5 py-0.5 rounded bg-[#0b0d0c]">
                      <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] text-blue-800 dark:text-blue-200 font-mono font-bold">{verificationCode}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verification code - verify at liquidlab.trade/verify</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full bg-[#0b0d0c]">
                    <div className="relative">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[10px] text-green-800 dark:text-green-200 font-medium">Connected to Hyperliquid</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Live connection to Hyperliquid DEX established</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 px-2 self-start sm:self-auto"
        >
          {showDetails ? "Hide" : "Details"}
        </Button>
      </div>
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 space-y-2">
          <div className="bg-white dark:bg-gray-900 rounded p-2 space-y-1.5">
            <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100">Security Features</h4>
            
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                <div>
                  <strong>Non-Custodial:</strong> Your wallet remains in your control
                </div>
              </div>
              
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                <div>
                  <strong>Direct Trading:</strong> Trades execute on Hyperliquid DEX
                </div>
              </div>
              
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                <div>
                  <strong>Transparent:</strong> Builder code <Badge variant="outline" className="ml-1 text-xs h-4 px-1">{builderCode}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded p-2">
            <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 mb-1">Verify This Platform</h4>
            
            <ol className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside">
              <li>Visit <a href="https://liquidlab.trade/verify" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">liquidlab.trade/verify</a></li>
              <li>Enter Platform ID: <strong>#{platformId}</strong></li>
              <li>Confirm the URL matches: <strong>{customDomain || window.location.hostname}</strong></li>
            </ol>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Report suspicious platforms to <a href="mailto:security@liquidlab.trade" className="text-blue-600 hover:underline">security@liquidlab.trade</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}