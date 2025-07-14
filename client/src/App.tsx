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
import Templates from "@/pages/templates";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/:templateId" component={Builder} />
      <Route path="/templates" component={Templates} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/education" component={Education} />
      <Route path="/chart-demo" component={ChartDemo} />
      <Route path="/example" component={Example} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const hideHeaderFooter = location === '/example' || location === '/login' || location === '/signup' || location.startsWith('/admin');

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
