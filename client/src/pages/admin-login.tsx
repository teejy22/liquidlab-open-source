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

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    totp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/login", formData);
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setRequires2FA(true);
        toast({
          title: "2FA Required",
          description: "Please enter your admin authentication code",
        });
        return;
      }
      
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      
      // Navigate to admin dashboard
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 500);
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full w-fit">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle>{requires2FA ? "Admin 2FA Verification" : "Admin Access"}</CardTitle>
          <CardDescription>
            {requires2FA 
              ? "Enter your admin authentication code"
              : "This area is restricted to LiquidLab administrators only"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!requires2FA ? (
              <>
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@liquidlab.trade"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Admin Password</Label>
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
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {requires2FA ? "Verifying..." : "Authenticating..."}
                </>
              ) : (
                requires2FA ? "Verify Code" : "Access Admin Dashboard"
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
              <Link href="/">
                <Button variant="link" className="text-sm">
                  Return to Main Site
                </Button>
              </Link>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}