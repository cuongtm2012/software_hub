import { Switch, Route } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
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
import { Loader2, Code } from "lucide-react";

// Phase 2: Code Service & Product Build Module
import ProjectsPage from "@/pages/projects-page";
import ProjectNewPage from "@/pages/project-new-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import PortfolioPage from "@/pages/portfolio-page";
import PortfolioNewPage from "@/pages/portfolio-new-page";
import PortfolioDetailPage from "@/pages/portfolio-detail-page";

// Phase 3: Marketplace
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
      
      {/* Phase 2: Code Service & Product Build Module */}
      <Route path="/projects" component={() => {
        const { user } = useAuth();
        const [, navigate] = useLocation();
        
        if (!user) {
          return (
            <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
              <Header />
              <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Collaboration Platform</h1>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Connect with skilled developers for your custom software projects. Submit project requests, 
                    receive quotes, and collaborate securely through our platform.
                  </p>
                  <div className="space-y-6 max-w-lg mx-auto">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-medium text-[#004080] mb-2">For Clients</h2>
                      <p className="text-gray-600 mb-4">Post your project requirements and connect with developers ready to build your custom solution.</p>
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="bg-[#004080] hover:bg-[#003366] text-white"
                      >
                        Login to Post a Project
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-medium text-[#004080] mb-2">For Developers</h2>
                      <p className="text-gray-600 mb-4">Find projects to work on, submit quotes, and grow your client base.</p>
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="bg-[#004080] hover:bg-[#003366] text-white"
                      >
                        Login to View Projects
                      </Button>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/portfolios/gallery')}
                      className="text-[#004080] border-[#004080]"
                    >
                      Browse Developer Portfolios
                    </Button>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
          );
        }
        return <ProjectsPage />;
      }} />
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
              ) : portfolios?.portfolios?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.portfolios.map((portfolio: any) => (
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
                            <StarRating rating={
                              portfolio.reviews?.length 
                                ? portfolio.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / portfolio.reviews.length 
                                : 0
                            } size="sm" />
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
                  
                  {portfolios.total > limit && (
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil(portfolios.total / limit)}
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
