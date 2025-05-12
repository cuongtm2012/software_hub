import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import MarketplacePage from "@/pages/marketplace-page";
import MarketplaceCategoryPage from "@/pages/marketplace-category-page";
import ProductDetailPage from "@/pages/product-detail-page";
import MarketplaceSellerPage from "@/pages/marketplace-seller-page";
import MarketplaceSellerNewPage from "@/pages/marketplace-seller-new-page";
import MarketplaceSellerEditPage from "@/pages/marketplace-seller-edit-page";
import MarketplaceOrdersPage from "@/pages/marketplace-orders-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Phase 2: Code Service & Product Build Module - Placeholder routes */}
      <ProtectedRoute path="/projects" component={() => <div>Projects Page (Coming Soon)</div>} />
      <ProtectedRoute path="/projects/client" roles={['client', 'admin']} component={() => <div>Client Projects Page (Coming Soon)</div>} />
      <ProtectedRoute path="/projects/developer" roles={['developer', 'admin']} component={() => <div>Developer Projects Page (Coming Soon)</div>} />
      <ProtectedRoute path="/projects/:id" component={() => <div>Project Details Page (Coming Soon)</div>} />
      <ProtectedRoute path="/portfolio" roles={['developer', 'admin']} component={() => <div>Portfolio Page (Coming Soon)</div>} />
      <Route path="/portfolio/:id" component={() => <div>Portfolio Details Page (Coming Soon)</div>} />
      
      {/* Phase 3: Marketplace */}
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/marketplace/category/:category" component={MarketplaceCategoryPage} />
      <Route path="/marketplace/product/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/marketplace/seller" roles={['seller', 'admin']} component={MarketplaceSellerPage} />
      <ProtectedRoute path="/marketplace/seller/new" roles={['seller', 'admin']} component={MarketplaceSellerNewPage} />
      <ProtectedRoute path="/marketplace/seller/edit/:id" roles={['seller', 'admin']} component={MarketplaceSellerEditPage} />
      <ProtectedRoute path="/marketplace/orders" roles={['buyer', 'admin']} component={MarketplaceOrdersPage} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={() => <div>Admin Dashboard (Coming Soon)</div>} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
