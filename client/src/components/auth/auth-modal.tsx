import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { walletService } from "@/lib/wallet";
import { Wallet, Mail, User, Key } from "lucide-react";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(1, "Wallet address is required"),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(1, "Wallet address is required"),
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

interface AuthModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function AuthModal({ children, onSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      address: walletAddress,
    },
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      address: walletAddress,
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      return await apiRequest("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to LiquidLab. You can now start building trading platforms.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      return await apiRequest("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to LiquidLab.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = async () => {
    try {
      setIsConnectingWallet(true);
      const walletState = await walletService.connectWallet();
      
      if (walletState.address) {
        setWalletAddress(walletState.address);
        signUpForm.setValue("address", walletState.address);
        signInForm.setValue("address", walletState.address);
        
        toast({
          title: "Wallet connected",
          description: `Connected to ${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Wallet connection failed",
        description: "Please try connecting your wallet again",
        variant: "destructive",
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const onSignUp = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  const onSignIn = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join LiquidLab</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Start building professional trading platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Connection */}
                <div className="space-y-2">
                  <Label>Wallet Connection</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet || !!walletAddress}
                    className="w-full"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnectingWallet ? "Connecting..." : 
                     walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                     "Connect Wallet"}
                  </Button>
                </div>

                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...signUpForm.register("username")}
                      placeholder="Enter your username"
                    />
                    {signUpForm.formState.errors.username && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...signUpForm.register("email")}
                      placeholder="Enter your email"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-liquid-green hover:bg-liquid-accent"
                    disabled={signUpMutation.isPending || !walletAddress}
                  >
                    {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Welcome back to LiquidLab
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Connection */}
                <div className="space-y-2">
                  <Label>Wallet Connection</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet || !!walletAddress}
                    className="w-full"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnectingWallet ? "Connecting..." : 
                     walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                     "Connect Wallet"}
                  </Button>
                </div>

                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      {...signInForm.register("email")}
                      placeholder="Enter your email"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-liquid-green hover:bg-liquid-accent"
                    disabled={signInMutation.isPending || !walletAddress}
                  >
                    {signInMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}