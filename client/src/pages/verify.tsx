import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Shield, Search } from "lucide-react";

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/platforms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult(data);
      } else {
        setVerificationError(data.error || "Verification failed");
      }
    } catch (error) {
      setVerificationError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <img src="/logo.svg" alt="LiquidLab" className="h-8" />
                <span className="text-xl font-bold">LiquidLab</span>
              </a>
            </Link>
            <Link href="/builder">
              <Button variant="outline" size="sm">
                Build Your Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-[#1dd1a1]" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Verify Trading Platform</h1>
          <p className="text-gray-400 text-lg">
            Always verify a trading platform before connecting your wallet
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-[#0d0d0d] border-gray-800 mb-8">
          <form onSubmit={handleVerify} className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder="Enter Verification Code (e.g., A1B2C3D4)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                className="flex-1 bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500 font-mono text-lg focus:text-white focus:border-[#1dd1a1]"
                style={{ color: 'white' }}
                maxLength={8}
              />
              <Button 
                type="submit" 
                disabled={!verificationCode.trim() || isVerifying}
                className="bg-[#1dd1a1] hover:bg-[#19b894] text-black"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Platform
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter the 8-character verification code displayed on the trading platform
            </p>
          </form>
        </Card>

        {/* Results */}
        {(verificationError || verificationResult) && (
          <>
            {verificationError ? (
              <Alert className="bg-red-900/20 border-red-800">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Verification Failed</AlertTitle>
                <AlertDescription className="text-gray-300">
                  {verificationError}
                </AlertDescription>
              </Alert>
            ) : verificationResult ? (
              <Card className={`border-2 ${verificationResult.platform.isVerified ? 'bg-green-900/10 border-green-800' : 'bg-yellow-900/10 border-yellow-800'}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-[#fffcfc]">{verificationResult.platform.name}</h2>
                      <p className="text-gray-400">Platform ID: {verificationResult.platform.id}</p>
                    </div>
                    {verificationResult.platform.isVerified ? (
                      <Badge className="bg-green-900/30 text-green-400 border-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Platform Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0d0d0d] rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Created Date</p>
                        <p className="font-mono text-[#ffffff]">{new Date(verificationResult.platform.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Platform Status</p>
                        <p className="font-mono capitalize text-[#ffffff]">{verificationResult.platform.status || 'Active'}</p>
                      </div>
                      {verificationResult.platform.customDomain && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Custom Domain</p>
                          <p className="font-mono">{verificationResult.platform.customDomain}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Builder Code</p>
                        <p className="font-mono">LIQUIDLAB2025</p>
                      </div>
                    </div>

                    {/* Verification Status Alert */}
                    {verificationResult.platform.isVerified ? (
                      <Alert className="bg-green-900/20 border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-500">This platform is verified by LiquidLab</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Official LiquidLab trading platform</li>
                            <li>Non-custodial - your funds remain in your wallet</li>
                            <li>Revenue sharing active (70% platform owner / 30% LiquidLab)</li>
                            <li>Secure integration with Hyperliquid DEX</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-yellow-900/20 border-yellow-800">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <AlertTitle className="text-yellow-500">This platform is not yet verified</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Platform is pending verification by LiquidLab team</li>
                            <li>Exercise caution when connecting your wallet</li>
                            <li>Verify the platform owner's identity independently</li>
                            <li>Contact support@liquidlab.trade if you have concerns</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Security Tips */}
                    <div className="mt-6 p-4 bg-[#0d0d0d] rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-[#1dd1a1]" />
                        Security Tips
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                        <li>Always verify the platform ID matches what's shown on the trading interface</li>
                        <li>Check that the URL is correct (liquidlab.trade or verified custom domain)</li>
                        <li>Never share your private keys or seed phrases</li>
                        <li>LiquidLab platforms are non-custodial - we never hold your funds</li>
                        <li>Report suspicious platforms to security@liquidlab.trade</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </>
        )}

        {/* How to Find Verification Code */}
        {!verificationResult && !verificationError && (
          <Card className="bg-[#0d0d0d] border-gray-800">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">How to Find Verification Code</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-[#1dd1a1] text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <p className="text-gray-400">
                    Look for the verification code in the security bar at the top of any LiquidLab trading platform
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-[#1dd1a1] text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <p className="text-gray-400">
                    The code will be displayed as an 8-character alphanumeric string (e.g., A1B2C3D4)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-[#1dd1a1] text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <p className="text-gray-400">
                    Enter the verification code above to verify the platform's authenticity
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                <p className="text-sm text-gray-500">
                  <strong>Note:</strong> All legitimate LiquidLab platforms will have a verification badge. 
                  If a platform claims to be powered by LiquidLab but lacks this badge, it may be fraudulent.
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 LiquidLab. All rights reserved.</p>
            <p className="mt-2">
              Questions? Contact us at{" "}
              <a href="mailto:security@liquidlab.trade" className="text-[#1dd1a1] hover:underline">
                security@liquidlab.trade
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}