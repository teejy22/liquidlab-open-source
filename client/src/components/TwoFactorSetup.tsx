import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Shield, Copy, Check } from "lucide-react";

interface TwoFactorSetupProps {
  enabled: boolean;
  onStatusChange: () => void;
}

export default function TwoFactorSetup({ enabled, onStatusChange }: TwoFactorSetupProps) {
  const { toast } = useToast();
  const [setupData, setSetupData] = useState<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/auth/2fa/setup");
      const data = await response.json();
      console.log("2FA Setup Response:", data);
      
      if (!data || !data.qrCode || !data.secret || !data.backupCodes) {
        throw new Error("Invalid 2FA setup response");
      }
      
      setSetupData(data);
      setIsSetupDialogOpen(true);
    } catch (error: any) {
      console.error("2FA Setup Error:", error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to initialize 2FA setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/auth/2fa/enable", { totp: verificationCode });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled for your account.",
        });
        
        setIsSetupDialogOpen(false);
        setSetupData(null);
        setVerificationCode("");
        onStatusChange();
      } else {
        throw new Error(data.error || "Failed to enable 2FA");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/auth/2fa/disable", { password });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled for your account.",
        });
        
        setIsDisableDialogOpen(false);
        setPassword("");
        onStatusChange();
      } else {
        throw new Error(data.error || "Failed to disable 2FA");
      }
    } catch (error: any) {
      toast({
        title: "Disable Failed",
        description: error.message || "Invalid password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              enabled ? 'bg-green-50 dark:bg-green-950' : 'bg-gray-50 dark:bg-gray-900'
            }`}>
              <div>
                <p className="font-medium">
                  Status: <span className={enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Enable 2FA to secure your account'}
                </p>
              </div>
              <Button
                onClick={enabled ? () => setIsDisableDialogOpen(true) : handleSetup}
                variant={enabled ? "destructive" : "default"}
                disabled={loading}
              >
                {enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Follow these steps to enable 2FA on your account
            </DialogDescription>
          </DialogHeader>
          
          {setupData && (
            <div className="space-y-4 pb-4">
              <div>
                <h3 className="font-medium mb-1 text-sm">Step 1: Scan QR Code</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center mb-2">
                  {setupData.qrCode ? (
                    <img src={setupData.qrCode} alt="2FA QR Code" className="border rounded h-48 w-48" />
                  ) : (
                    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-gray-600">QR Code loading...</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  Can't scan? Enter manually: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">{setupData.secret}</code>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-sm">Step 2: Save Backup Codes</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Save these backup codes. Use them if you lose your authenticator.
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs max-h-32 overflow-y-auto">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-1 rounded">
                      <code className="text-xs">{code}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => copyBackupCode(code, index)}
                      >
                        {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-sm">Step 3: Verify Setup</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Enter the 6-digit code from your authenticator app
                </p>
                <div className="space-y-1">
                  <Label htmlFor="verification-code" className="text-xs">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="h-8"
                  />
                </div>
              </div>

              <Alert className="p-2">
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> You'll need a code from your authenticator app every time you log in.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsSetupDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEnable} disabled={!verificationCode || loading}>
              {loading ? "Enabling..." : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>Warning:</strong> Disabling 2FA will make your account more vulnerable to unauthorized access.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable} disabled={!password || loading}>
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}