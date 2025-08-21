import { Switch, Route } from "wouter";
import { useState, lazy, Suspense, startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPageNew from "@/pages/auth-page-new";
import UserProfilePage from "@/pages/user-profile-page";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ShoppingCartSidebar } from "@/components/shopping-cart-sidebar";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { StarRating } from "@/components/ui/star-rating";
import {
  Loader2,
  Code,
  ArrowRight,
  Monitor,
  BookOpen,
  ShoppingCart,
  Smartphone
} from "lucide-react";

import ProjectsPage from "@/pages/projects-page";
import ProjectNewPage from "@/pages/project-new-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ProjectRequestPage from "@/pages/project-request-page";
import ProjectRequestSuccessPage from "@/pages/project-request-success-page";
import PortfolioPage from "@/pages/portfolio-page";
import PortfolioNewPage from "@/pages/portfolio-new-page";
import PortfolioDetailPage from "@/pages/portfolio-detail-page";
import ITServicesPage from "@/pages/it-services-page";

// Phase 3: Marketplace & Software
import MarketplacePage from "@/pages/marketplace-page";
import SoftwareListPage from "@/pages/software-list-page";
import CoursesListPage from "@/pages/courses-list-page";
import CourseDetailPage from "@/pages/course-detail-page";
import SoftwareCatalogPage from "@/pages/software-catalog-page";
import MarketplaceCategoryPage from "@/pages/marketplace-category-page";
import { ProductDetailEcommerce } from "@/pages/product-detail-ecommerce";
import OrderDetailsPage from "@/pages/order-details-page";
import MarketplaceSellerPage from "@/pages/marketplace-seller-page";

// Admin
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import SellerDashboardPage from "@/pages/seller-dashboard-page";
import BuyerDashboardPage from "@/pages/buyer-dashboard-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminUsersChatPage from "@/pages/admin/users-chat-page";
import AdminSoftwareManagementPage from "@/pages/admin/software-management-page";
import EmailTestPage from "@/pages/admin/email-test-page";
import PushNotificationTestPage from "@/pages/admin/push-notification-test-page";
import AdminProjectsPage from "@/pages/admin/projects-page";
import EndToEndTestPage from "@/pages/admin/end-to-end-test-page";
import { SellerApprovalPage } from "@/pages/admin/seller-approval-page";
import AdminExternalRequestsPage from "@/pages/admin/external-requests-page";
import MarketplaceSellerNewPage from "@/pages/marketplace-seller-new-page";
import MarketplaceSellerEditPage from "@/pages/marketplace-seller-edit-page";
import MarketplaceOrdersPage from "@/pages/marketplace-orders-page";
import DashboardPage from "@/pages/dashboard-page";
// import ChatPage from "@/pages/chat-page"; // Disabled - use floating chat widget

function Router() {
  return (
    <Switch>
      {/* Public Routes - Available to all users */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPageNew} />
      <Route path="/auth/set-password" component={() => {
        const SetPasswordPage = lazy(() => import("@/pages/set-password-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <SetPasswordPage />
          </Suspense>
        );
      }} />
      <Route path="/request-project" component={ProjectRequestPage} />
      <Route path="/request-project/success" component={ProjectRequestSuccessPage} />

      {/* Protected Routes - Available to logged-in users */}
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />

      {/* Role-Based Dashboards */}
      <ProtectedRoute path="/seller" component={SellerDashboardPage} roles={['seller']} />
      <ProtectedRoute path="/buyer" component={BuyerDashboardPage} roles={['buyer', 'user']} />
      {/* Chat page disabled - use floating chat widget instead */}
      {/* <ProtectedRoute path="/chat" component={ChatPage} /> */}

      {/* Admin Routes - Only accessible to admin users */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} roles={['admin']} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} roles={['admin']} />
      <ProtectedRoute path="/admin/users/chat" component={AdminUsersChatPage} roles={['admin']} />
      <ProtectedRoute path="/admin/software" component={AdminSoftwareManagementPage} roles={['admin']} />
      <ProtectedRoute path="/admin/projects" component={AdminProjectsPage} roles={['admin']} />
      <ProtectedRoute path="/admin/external-requests" component={AdminExternalRequestsPage} roles={['admin']} />
      <ProtectedRoute path="/admin/seller-approvals" component={SellerApprovalPage} roles={['admin']} />
      <ProtectedRoute path="/admin/email-tests" component={EmailTestPage} roles={['admin']} />
      <ProtectedRoute path="/admin/push-notifications" component={PushNotificationTestPage} roles={['admin']} />
      <ProtectedRoute path="/admin/end-to-end-tests" component={EndToEndTestPage} roles={['admin']} />



      {/* Phase 2: Code Service & Product Build Module */}
      <Route path="/it-services" component={ITServicesPage} />


      <ProtectedRoute path="/projects/new" roles={['client', 'admin']} component={ProjectNewPage} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetailPage} />
      <ProtectedRoute path="/portfolios" roles={['developer', 'admin']} component={PortfolioPage} />
      <ProtectedRoute path="/portfolios/new" roles={['developer', 'admin']} component={PortfolioNewPage} />
      <Route path="/portfolios/gallery" component={() => {
        const [page, setPage] = useState(1);
        const limit = 12;
        const [, navigate] = useLocation();
        const { data: portfolios, isLoading } = useQuery({
          queryKey: ['/api/portfolios', { page, limit }],
          queryFn: undefined,
        });

        const handlePageChange = (newPage: number) => {
          setPage(newPage);
        };

        return (
          <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
            <Header />
            <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Developer Portfolios</h1>
                  <p className="text-gray-500 mt-1">
                    Browse work samples from our skilled developers
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-[#004080] hover:bg-[#003366] text-white"
                >
                  Login to Hire Developers
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                </div>
              ) : portfolios && Array.isArray(portfolios) && portfolios.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(portfolios as any[]).map((portfolio: any) => (
                      <Card key={portfolio.id} className="bg-white hover:shadow-md transition-shadow">
                        <div className="relative pt-[60%] bg-gray-100">
                          {portfolio.images && portfolio.images[0] ? (
                            <img
                              src={portfolio.images[0]}
                              alt={portfolio.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Code className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                          <div className="flex items-center mt-1">
                            <StarRating
                              value={portfolio.reviews?.length
                                ? portfolio.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / portfolio.reviews.length
                                : 0
                              }
                              size="sm"
                            />
                            <span className="text-sm text-gray-500 ml-2">
                              ({portfolio.reviews?.length || 0} reviews)
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm text-gray-700 line-clamp-3">{portfolio.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#004080] hover:text-[#003366] w-full"
                            onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {(portfolios as any).total > limit && (
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil((portfolios as any).total / limit)}
                      onPageChange={handlePageChange}
                      className="mt-8"
                    />
                  )}
                </>
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                  <Code className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    There are currently no developer portfolios to display.
                  </p>
                  <Button
                    variant="outline"
                    className="text-[#004080] border-[#004080]"
                    onClick={() => navigate('/auth')}
                  >
                    Login as a Developer
                  </Button>
                </div>
              )}
            </main>
            <Footer />
          </div>
        );
      }} />
      <Route path="/portfolios/:id" component={PortfolioDetailPage} />

      {/* Software List */}
      <Route path="/software" component={SoftwareListPage} />
      <Route path="/courses" component={CoursesListPage} />
      <Route path="/courses/:id" component={CourseDetailPage} />

      {/* Phase 3: Marketplace */}
      <Route path="/marketplace" component={() => {
        const MarketplacePageNew = lazy(() => import("@/pages/marketplace-page-new"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MarketplacePageNew />
          </Suspense>
        );
      }} />

      {/* Seller Registration & Management */}
      <Route path="/seller/register" component={() => {
        const SellerRegistrationPage = lazy(() => import("@/pages/seller-registration-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <SellerRegistrationPage />
          </Suspense>
        );
      }} />
      <Route path="/seller/registration" component={() => {
        const SellerRegistrationPage = lazy(() => import("@/pages/seller-registration-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <SellerRegistrationPage />
          </Suspense>
        );
      }} />
      {/* Seller Dashboard Routes - Redirect to main dashboard which has integrated seller functionality */}
      <ProtectedRoute path="/seller" component={() => {
        const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <DashboardPage />
          </Suspense>
        );
      }} roles={['seller', 'admin']} />
      <ProtectedRoute path="/seller/dashboard" component={() => {
        const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <DashboardPage />
          </Suspense>
        );
      }} roles={['seller', 'admin']} />
      <ProtectedRoute path="/seller/products/new" component={() => {
        const SellerProductNewPage = lazy(() => import("@/pages/seller-product-new-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <SellerProductNewPage />
          </Suspense>
        );
      }} roles={['seller', 'admin']} />
      <ProtectedRoute path="/seller/products/:id/edit" component={() => {
        const MarketplaceSellerEditPage = lazy(() => import("@/pages/marketplace-seller-edit-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <MarketplaceSellerEditPage />
          </Suspense>
        );
      }} roles={['seller', 'admin']} />
      <Route path="/marketplace/category/:category" component={MarketplaceCategoryPage} />
      <Route path="/marketplace/product/:id" component={ProductDetailPage} />
      <Route path="/marketplace/checkout" component={() => {
        const CheckoutPageNew = lazy(() => import("@/pages/checkout-page-new"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <CheckoutPageNew />
          </Suspense>
        );
      }} />
      <Route path="/marketplace/:id" component={() => {
        const MarketplaceDetailPage = lazy(() => import("@/pages/marketplace-detail-page"));
        return (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
            <MarketplaceDetailPage />
          </Suspense>
        );
      }} />
      <Route path="/marketplace/order-success/:orderId" component={() => {
        const OrderSuccessPage = lazy(() => import("@/pages/order-success-page"));
        return (
          <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <OrderSuccessPage />
          </Suspense>
        );
      }} />
      <Route path="/order-details/:id" component={OrderDetailsPage} />
      <ProtectedRoute path="/marketplace/seller" roles={['seller', 'admin']} component={MarketplaceSellerPage} />
      <ProtectedRoute path="/seller/products" roles={['seller', 'admin']} component={MarketplaceSellerPage} />
      <ProtectedRoute path="/marketplace/seller/new" roles={['seller', 'admin']} component={MarketplaceSellerNewPage} />
      <ProtectedRoute path="/marketplace/seller/edit/:id" roles={['seller', 'admin']} component={MarketplaceSellerEditPage} />
      <ProtectedRoute path="/marketplace/orders" roles={['buyer', 'admin']} component={MarketplaceOrdersPage} />

      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} roles={['admin']} />

      {/* Test Login */}
      <Route path="/test-login" component={() => {
        const TestLoginPage = lazy(() => import("@/pages/test-login-page"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <TestLoginPage />
          </Suspense>
        );
      }} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <ShoppingCartSidebar />
            <FloatingChatButton />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
