import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Shield } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    totp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/signin", formData);
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setRequires2FA(true);
        setUserId(response.userId);
        toast({
          title: "2FA Required",
          description: "Please enter your authentication code",
        });
        return;
      }
      
      // Invalidate and wait for auth query to refresh
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in. Redirecting...",
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {requires2FA && <Shield className="h-5 w-5" />}
            {requires2FA ? "Two-Factor Authentication" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {requires2FA 
              ? "Enter the 6-digit code from your authenticator app" 
              : "Log in to manage your trading platforms"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!requires2FA ? (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="totp">Authentication Code</Label>
                <Input
                  id="totp"
                  type="text"
                  placeholder="123456"
                  value={formData.totp}
                  onChange={(e) => setFormData({ ...formData, totp: e.target.value })}
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-sm text-gray-600 mt-2">
                  Can't access your authenticator? Use a backup code instead.
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {requires2FA ? "Verifying..." : "Logging in..."}
                </>
              ) : (
                requires2FA ? "Verify" : "Log In"
              )}
            </Button>
            
            {requires2FA ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setRequires2FA(false);
                  setFormData({ ...formData, totp: "" });
                }}
              >
                Back to Login
              </Button>
            ) : (
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}