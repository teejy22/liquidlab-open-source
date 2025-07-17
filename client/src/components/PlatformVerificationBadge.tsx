import { Shield, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PlatformVerificationBadgeProps {
  platformId: number;
  platformName: string;
  isVerified?: boolean;
  compactMode?: boolean;
  verificationCode?: string;
  className?: string;
}

export function PlatformVerificationBadge({ 
  platformId, 
  platformName,
  isVerified = true,
  compactMode = false,
  verificationCode,
  className
}: PlatformVerificationBadgeProps) {
  console.log('PlatformVerificationBadge props:', { platformId, platformName, verificationCode });
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (verificationCode) {
      try {
        await navigator.clipboard.writeText(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={compactMode ? "sm" : "default"}
          className={`${compactMode ? 'gap-1 h-7 px-2 text-xs' : 'gap-2'} hover:bg-teal-50 dark:hover:bg-teal-950/20`}
        >
          {isVerified ? (
            <>
              <Shield className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} text-teal-600 dark:text-teal-400`} />
              {!compactMode && <span>LiquidLab Verified</span>}
              <CheckCircle className={`${compactMode ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-teal-600 dark:text-teal-400`} />
            </>
          ) : (
            <>
              <AlertCircle className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-600 dark:text-yellow-400`} />
              {!compactMode && <span>Verification Pending</span>}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="font-semibold">Platform Verification</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform Name:</span>
              <span className="font-medium">{platformName}</span>
            </div>
            {verificationCode ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verification Code:</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono">{verificationCode}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Copy verification code"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-teal-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform ID:</span>
                <Badge variant="outline">#{platformId}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <Badge variant={isVerified ? "default" : "secondary"}>
                {isVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
          
          <div className="pt-2 border-t space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>✓ Built on LiquidLab infrastructure</p>
            <p>✓ Direct Hyperliquid integration</p>
            <p>✓ Non-custodial wallet connection</p>
            <p>✓ Transparent fee structure</p>
          </div>
          
          <a 
            href="https://liquidlab.trade/verify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Verify on LiquidLab.trade →
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}