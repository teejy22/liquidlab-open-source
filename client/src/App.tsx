import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Builder from "@/pages/builder";

import Analytics from "@/pages/analytics";
import Pricing from "@/pages/pricing";
import Education from "@/pages/education";
import ChartDemo from "@/pages/chart-demo";
import Example from "@/pages/example";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Security from "@/pages/security";
import Verify from "@/pages/verify";
import Enterprise from "@/pages/enterprise";
import { useEffect, useState } from "react";

// Check if we're on a platform subdomain
function isPlatformDomain() {
  const hostname = window.location.hostname;
  // Check if it's a subdomain of liquidlab.trade or app.liquidlab.trade
  // But not the main liquidlab.trade domain
  return (hostname.endsWith('.liquidlab.trade') || hostname.endsWith('.app.liquidlab.trade')) && 
         hostname !== 'liquidlab.trade' && 
         hostname !== 'app.liquidlab.trade' &&
         hostname !== 'www.liquidlab.trade';
}

function Router() {
  const [isPlatform, setIsPlatform] = useState(false);

  useEffect(() => {
    // Check if we're on a platform subdomain
    setIsPlatform(isPlatformDomain());
  }, []);

  // If we're on a platform subdomain, show the trading interface
  if (isPlatform) {
    return <Example />;
  }

  // Otherwise show the main LiquidLab routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/builder" component={Builder} />

      <Route path="/analytics" component={Analytics} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/education" component={Education} />
      <Route path="/chart-demo" component={ChartDemo} />
      <Route path="/example" component={Example} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/security" component={Security} />
      <Route path="/verify" component={Verify} />
      <Route path="/enterprise" component={Enterprise} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const hideHeaderFooter = location === '/example' || location === '/login' || location === '/signup' || location.startsWith('/admin');

  // Fetch CSRF token on app load
  useEffect(() => {
    fetch('/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // The token is stored in the cookie automatically by the server
        console.log('CSRF token fetched');
      })
      .catch(err => {
        console.error('Failed to fetch CSRF token:', err);
      });
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        {!hideHeaderFooter && <Header />}
        <main className="flex-1">
          <Router />
        </main>
        {!hideHeaderFooter && <Footer />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
