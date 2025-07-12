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
import { Mail, User, Key } from "lucide-react";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

interface AuthModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function AuthModal({ children, onSuccess }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
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

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...signUpForm.register("password")}
                      placeholder="Enter your password"
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-liquid-green hover:bg-liquid-accent"
                    disabled={signUpMutation.isPending}
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

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      {...signInForm.register("password")}
                      placeholder="Enter your password"
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-liquid-green hover:bg-liquid-accent"
                    disabled={signInMutation.isPending}
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