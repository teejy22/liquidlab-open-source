import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import templatePreview from "@assets/Trade_1752276632533.png";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { CustomDomainManager } from "@/components/CustomDomainManager";
import { 
  Eye,
  Save,
  Settings,
  Globe,
  Code,
  Palette,
  DollarSign,
  Monitor,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  Upload,
  Image,
  Plus
} from "lucide-react";

export default function Builder() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [platformName, setPlatformName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [savedChanges, setSavedChanges] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [payoutWallet, setPayoutWallet] = useState("");
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savedPlatformId, setSavedPlatformId] = useState<number | null>(null);

  // Builder wallet address (must have 100+ USDC in perps account)
  const BUILDER_WALLET_ADDRESS = import.meta.env.VITE_BUILDER_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";

  // Function to reset all form fields for a new platform
  const resetFormForNewPlatform = () => {
    setPlatformName("");
    setCustomDomain("");
    setLogoUrl("");
    setPayoutWallet("");
    setSavedPlatformId(null);
    setSavedChanges(false);
    setPreviewMode('desktop');
    toast({
      title: "Creating New Platform",
      description: "Form cleared. Enter details for your new platform.",
    });
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Load existing platforms
  const { data: platforms } = useQuery({
    queryKey: ['/api/platforms', { userId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/platforms?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch platforms');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Set the first platform as the saved platform if exists
  useEffect(() => {
    if (platforms && platforms.length > 0 && !savedPlatformId) {
      const latestPlatform = platforms[platforms.length - 1];
      setSavedPlatformId(latestPlatform.id);
      setPlatformName(latestPlatform.name || '');
      setLogoUrl(latestPlatform.logoUrl || '');
      setPayoutWallet(latestPlatform.payoutWallet || '');
      setSavedChanges(true);
    }
  }, [platforms]);

  const savePlatformMutation = useMutation({
    mutationFn: async (data: any) => {
      if (savedPlatformId) {
        // Update existing platform
        return apiRequest("PUT", `/api/platforms/${savedPlatformId}`, data);
      } else {
        // Create new platform
        return apiRequest("POST", "/api/platforms", data);
      }
    },
    onSuccess: (data) => {
      setSavedChanges(true);
      setSavedPlatformId(data.id);
      toast({
        title: "Platform Saved",
        description: "Your platform configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save platform. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = async () => {
    if (!platformName) {
      toast({
        title: "Platform Name Required",
        description: "Please enter a name for your trading platform.",
        variant: "destructive",
      });
      return;
    }

    if (!payoutWallet) {
      toast({
        title: "Wallet Address Required",
        description: "Please enter your wallet address to receive revenue payouts.",
        variant: "destructive",
      });
      return;
    }

    // Basic wallet validation (Ethereum address format)
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(payoutWallet)) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum wallet address.",
        variant: "destructive",
      });
      return;
    }

    setSavingPlatform(true);
    
    const platformData = {
      userId: user?.id || 1, // Default to userId 1 for demo
      name: platformName,
      customDomain: customDomain || null,
      payoutWallet: payoutWallet,
      logoUrl: logoUrl || null,
      config: {
        logo: logoUrl || null,
        template: "hyperliquid", // We only have one template now
        builderCode: BUILDER_WALLET_ADDRESS,
      },
      isPublished: false, // Save as draft initially
    };

    await savePlatformMutation.mutateAsync(platformData);
    setSavingPlatform(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      setLogoUrl(data.url);
      toast({
        title: "Logo Uploaded",
        description: "Your logo has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePublish = () => {
    if (!savedChanges) {
      toast({
        title: "Save Required",
        description: "Please save your platform before publishing.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Platform Published!",
      description: "Your trading platform is now live and accessible.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Builder</h1>
            <p className="text-gray-600">
              Create your trading platform based on the Hyperliquid template
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {savedPlatformId && (
              <Button 
                variant="outline" 
                onClick={resetFormForNewPlatform}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Platform
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={savingPlatform}
            >
              <Save className="w-4 h-4 mr-2" />
              {savingPlatform ? "Saving..." : "Save Platform"}
            </Button>
            <Button 
              className="bg-liquid-green text-white hover:bg-liquid-accent"
              onClick={handlePublish}
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="domain">Domain</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input
                        id="platform-name"
                        placeholder="My Trading Platform"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payout-wallet">Revenue Payout Wallet</Label>
                      <Input
                        id="payout-wallet"
                        placeholder="0x..."
                        value={payoutWallet}
                        onChange={(e) => setPayoutWallet(e.target.value)}
                        className="mt-1 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your Ethereum wallet address where you'll receive your 70% share of trading fees
                      </p>
                    </div>

                    <div>
                      <Label>Platform Logo</Label>
                      <div className="mt-1 space-y-2">
                        {logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img 
                              src={logoUrl} 
                              alt="Platform logo" 
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogoUrl("")}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <label 
                              htmlFor="logo-upload" 
                              className="flex flex-col items-center cursor-pointer"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium text-gray-700">
                                {uploadingLogo ? "Uploading..." : "Upload Logo"}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </span>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                disabled={uploadingLogo}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="font-medium mb-3">Included Features</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">TradingView Charts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Real-time Order Book</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Spot & Perpetual Trading</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Privy Wallet Integration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">MoonPay Fiat On-Ramp</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="revenue" className="space-y-4 mt-4">
                    <div>
                      <Label>Builder Wallet Address</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={BUILDER_WALLET_ADDRESS}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(BUILDER_WALLET_ADDRESS);
                            toast({
                              title: "Copied!",
                              description: "Builder wallet address copied to clipboard.",
                            });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Builder wallet must have 100+ USDC in perps account
                      </p>
                    </div>
                    
                    <div>
                      <Label>Builder Fee</Label>
                      <div className="p-3 bg-gray-100 rounded-md">
                        <p className="text-sm font-mono">0.1% (10 basis points)</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Users must approve your builder address before fees can be collected
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Revenue Share
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Spot Trading:</strong> 0.14% (of 0.2% fee)</p>
                        <p><strong>Perp Trading:</strong> 0.07% (of 0.1% fee)</p>
                        <p className="text-gray-600 text-xs mt-2">
                          You keep 70% of all builder fees
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="domain" className="space-y-4 mt-4">
                    {savedPlatformId ? (
                      <CustomDomainManager platformId={savedPlatformId} />
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-4">
                          Save your platform first to manage custom domains
                        </p>
                        <Button 
                          onClick={handleSave}
                          disabled={savingPlatform || !platformName}
                          size="sm"
                        >
                          Save Platform
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Template Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gray-100 rounded-b-lg overflow-hidden">
                  <div className="bg-white shadow-sm p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">Hyperliquid Template</Badge>
                        <span className="text-sm text-gray-600">
                          Professional trading interface with all features included
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open('/example', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Demo
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`p-8 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                    {/* Custom Platform Header Preview */}
                    {(platformName || logoUrl) && (
                      <div className="bg-white rounded-t-lg border border-b-0 p-4 mb-0">
                        <div className="flex items-center gap-3">
                          {logoUrl && (
                            <img 
                              src={logoUrl} 
                              alt="Platform logo" 
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <h3 className="font-semibold text-lg">
                            {platformName || "Your Platform Name"}
                          </h3>
                        </div>
                      </div>
                    )}
                    
                    <iframe
                      src="/example"
                      title="Trading Platform Preview"
                      className={`w-full shadow-xl ${(platformName || logoUrl) ? 'rounded-b-lg' : 'rounded-lg'}`}
                      style={{ 
                        height: previewMode === 'mobile' ? '600px' : '500px',
                        border: 'none'
                      }}
                    />
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Trading Features</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Spot & Perpetual</li>
                          <li>• Advanced Charts</li>
                          <li>• Real-time Data</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">User Experience</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Social Login</li>
                          <li>• Mobile Responsive</li>
                          <li>• Dark/Light Mode</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Built-in Tools</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• MoonPay On-Ramp</li>
                          <li>• Privy Wallets</li>
                          <li>• Analytics Dashboard</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
