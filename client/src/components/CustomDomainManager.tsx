import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Copy, ExternalLink, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomDomainManagerProps {
  platformId: number;
}

interface Domain {
  id: number;
  domain: string;
  status: 'pending' | 'active';
  verificationToken: string;
  verifiedAt?: string;
}

export function CustomDomainManager({ platformId }: CustomDomainManagerProps) {
  const [domainInput, setDomainInput] = useState("");
  const [verificationInstructions, setVerificationInstructions] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing domains
  const { data: domains = [], isLoading } = useQuery<Domain[]>({
    queryKey: ['/api/platforms', platformId, 'domains'],
    queryFn: async () => {
      const response = await fetch(`/api/platforms/${platformId}/domains`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch domains');
      return response.json();
    }
  });

  // Add domain mutation
  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await fetch(`/api/platforms/${platformId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add domain');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationInstructions(data.instructions);
      queryClient.invalidateQueries({ queryKey: ['/api/platforms', platformId, 'domains'] });
      toast({
        title: "Domain added",
        description: "Please follow the verification instructions to complete setup."
      });
      setDomainInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await fetch(`/api/platforms/${platformId}/domains/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain })
      });
      if (!response.ok) throw new Error('Failed to verify domain');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        toast({
          title: "Domain verified",
          description: "Your custom domain is now active!"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/platforms', platformId, 'domains'] });
      } else {
        toast({
          title: "Verification pending",
          description: data.error || "DNS record not found yet. Please ensure the TXT record is added.",
          variant: "destructive"
        });
      }
    }
  });

  // Remove domain mutation
  const removeDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await fetch(`/api/platforms/${platformId}/domains/${domain}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to remove domain');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain removed",
        description: "The custom domain has been removed."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms', platformId, 'domains'] });
    }
  });

  const handleAddDomain = () => {
    if (!domainInput) return;
    
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domainInput)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name (e.g., example.com)",
        variant: "destructive"
      });
      return;
    }

    addDomainMutation.mutate(domainInput);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Value copied to clipboard"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Domain</CardTitle>
        <CardDescription>
          Use your own domain for your trading platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {domains.length === 0 ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="yourdomain.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={addDomainMutation.isPending}
              />
              <Button
                onClick={handleAddDomain}
                disabled={addDomainMutation.isPending || !domainInput}
              >
                {addDomainMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Domain
              </Button>
            </div>

            {verificationInstructions && (
              <Alert>
                <AlertTitle>Domain Verification Required</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>Add the following DNS record to verify ownership:</p>
                  <div className="bg-muted p-3 rounded-md space-y-1 font-mono text-sm">
                    <div className="flex justify-between items-center">
                      <span>Type: {verificationInstructions.recordType}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(verificationInstructions.recordType)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Name: {verificationInstructions.recordName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(verificationInstructions.recordName)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="break-all">Value: {verificationInstructions.recordValue}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(verificationInstructions.recordValue)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    After adding the record, wait a few minutes for DNS propagation, then click verify.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <div key={domain.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{domain.domain}</span>
                    <Badge variant={domain.status === 'active' ? 'default' : 'secondary'}>
                      {domain.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDomainMutation.mutate(domain.domain)}
                    disabled={removeDomainMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {domain.status === 'pending' && (
                  <div className="space-y-2">
                    <Alert>
                      <AlertDescription>
                        <p className="mb-2">Add this DNS record to verify:</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
                          <div>Type: TXT</div>
                          <div>Name: _liquidlab</div>
                          <div className="break-all">Value: {domain.verificationToken}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                    <Button
                      size="sm"
                      onClick={() => verifyDomainMutation.mutate(domain.domain)}
                      disabled={verifyDomainMutation.isPending}
                    >
                      {verifyDomainMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Verify Domain
                    </Button>
                  </div>
                )}

                {domain.status === 'active' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Domain verified and active</span>
                    {domain.verifiedAt && (
                      <span className="text-muted-foreground">
                        (verified {new Date(domain.verifiedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDomainInput("");
                  setVerificationInstructions(null);
                }}
                className="w-full"
              >
                Add Another Domain
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Add your custom domain above</li>
            <li>Add the TXT record to your DNS provider</li>
            <li>Click "Verify Domain" after DNS propagation (usually 5-10 minutes)</li>
            <li>Configure your domain to point to our servers (we'll provide instructions)</li>
            <li>Your platform will be accessible at your custom domain!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}