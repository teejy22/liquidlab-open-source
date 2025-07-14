import { Shield, Lock, ExternalLink, FileCheck } from "lucide-react";

interface SecurityFooterProps {
  platformName: string;
  platformId: number;
  builderCode: string;
}

export function SecurityFooter({ platformName, platformId, builderCode }: SecurityFooterProps) {
  return (
    <footer className="bg-black text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Security Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Non-custodial trading
              </li>
              <li className="flex items-center gap-2">
                <FileCheck className="w-3 h-3" />
                Audited smart contracts
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                SSL encrypted
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h3 className="font-semibold mb-3">Platform Details</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Platform: {platformName}</li>
              <li>ID: #{platformId}</li>
              <li>Builder Code: {builderCode}</li>
              <li>
                <a 
                  href={`https://liquidlab.com/verify/${platformId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Verify Platform
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Compliance */}
          <div>
            <h3 className="font-semibold mb-3">Trust & Compliance</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✓ LiquidLab Verified</li>
              <li>✓ Privy Wallet Security</li>
              <li>✓ Hyperliquid Official API</li>
              <li>✓ Transparent Fee Structure</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="https://docs.liquidlab.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Security Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://liquidlab.com/report"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Report Suspicious Activity
                </a>
              </li>
              <li>
                <a 
                  href="https://status.liquidlab.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>
            Powered by{" "}
            <a 
              href="https://liquidlab.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              LiquidLab
            </a>
            {" "}• Trading on{" "}
            <a 
              href="https://hyperliquid.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Hyperliquid DEX
            </a>
            {" "}• Secured by{" "}
            <a 
              href="https://privy.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Privy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}