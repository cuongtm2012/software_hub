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
import AuthPage from "@/pages/auth-page";
import UserProfilePage from "@/pages/user-profile-page";
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
import { 
  Loader2, 
  Code, 
  ArrowRight, 
  Monitor, 
  BookOpen, 
  ShoppingCart, 
  Smartphone
} from "lucide-react";

// Phase 2: Code Service & Product Build Module
import ProjectsPage from "@/pages/projects-page";
import ProjectNewPage from "@/pages/project-new-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ProjectRequestPage from "@/pages/project-request-page";
import PortfolioPage from "@/pages/portfolio-page";
import PortfolioNewPage from "@/pages/portfolio-new-page";
import PortfolioDetailPage from "@/pages/portfolio-detail-page";

// Phase 3: Marketplace & Software
import MarketplacePage from "@/pages/marketplace-page";
import SoftwareListPage from "@/pages/software-list-page";
import SoftwareCatalogPage from "@/pages/software-catalog-page";
import MarketplaceCategoryPage from "@/pages/marketplace-category-page";
import { ProductDetailEcommerce } from "@/pages/product-detail-ecommerce";
import OrderDetailsPage from "@/pages/order-details-page";
import MarketplaceSellerPage from "@/pages/marketplace-seller-page";

// Admin
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminUsersChatPage from "@/pages/admin/users-chat-page";
import AdminSoftwareManagementPage from "@/pages/admin/software-management-page";
import EmailTestPage from "@/pages/admin/email-test-page";
import PushNotificationTestPage from "@/pages/admin/push-notification-test-page";
import EndToEndTestPage from "@/pages/admin/end-to-end-test-page";
import { SellerApprovalPage } from "@/pages/admin/seller-approval-page";
import ProjectEditPage from "@/pages/admin/project-edit-page";
import MarketplaceSellerNewPage from "@/pages/marketplace-seller-new-page";
import MarketplaceSellerEditPage from "@/pages/marketplace-seller-edit-page";
import MarketplaceOrdersPage from "@/pages/marketplace-orders-page";
import DashboardPage from "@/pages/dashboard-page";
import ChatPage from "@/pages/chat-page";
import AddFundsPage from "@/pages/add-funds-page";

function Router() {
  return (
    <Switch>
      {/* Public Routes - Available to all users */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/request-project" component={ProjectRequestPage} />
      
      {/* Protected Routes - Available to logged-in users */}
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/add-funds" component={AddFundsPage} />
      
      {/* Admin Routes - Only accessible to admin users */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} roles={['admin']} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} roles={['admin']} />
      <ProtectedRoute path="/admin/users/chat" component={AdminUsersChatPage} roles={['admin']} />
      <ProtectedRoute path="/admin/software" component={AdminSoftwareManagementPage} roles={['admin']} />
      <ProtectedRoute path="/admin/seller-approvals" component={SellerApprovalPage} roles={['admin']} />
      <ProtectedRoute path="/admin/email-tests" component={EmailTestPage} roles={['admin']} />
      <ProtectedRoute path="/admin/push-notifications" component={PushNotificationTestPage} roles={['admin']} />
      <ProtectedRoute path="/admin/end-to-end-tests" component={EndToEndTestPage} roles={['admin']} />
      <ProtectedRoute path="/admin/projects/:id/edit" component={ProjectEditPage} roles={['admin']} />
      
      {/* Phase 2: Code Service & Product Build Module */}
      <Route path="/it-services" component={() => {
        const { user, isLoading } = useAuth();
        const [, navigate] = useLocation();
        
        if (isLoading) {
          return (
            <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
              <Header />
              <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                </div>
              </main>
            </div>
          );
        }
        
        return (
          <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
            <Header />
            <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">IT Services & Solutions</h1>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Connect with skilled developers for your custom software projects. Submit project requests, 
                  receive quotes, and collaborate securely through our platform.
                </p>
                
                {user ? (
                  <div className="space-y-6 max-w-lg mx-auto">
                    <div className="bg-[#f0f7ff] p-6 rounded-lg border border-[#004080]/20">
                      <h2 className="text-lg font-medium text-[#004080] mb-2">Welcome, {user.name}!</h2>
                      <p className="text-gray-600 mb-4">
                        You're logged in and ready to create a new project request. Our platform connects you 
                        with skilled developers who can bring your ideas to life.
                      </p>
                      <div className="flex gap-3 flex-wrap justify-center">
                        <Button 
                          onClick={() => navigate('/request-project')}
                          className="bg-[#004080] hover:bg-[#003366] text-white"
                        >
                          Create New Project
                        </Button>
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          className="border-[#004080] text-[#004080] hover:bg-[#f0f7ff]"
                        >
                          My Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-lg mx-auto">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-medium text-[#004080] mb-2">Ready to start your project?</h2>
                      <p className="text-gray-600 mb-4">Post your project requirements and connect with developers ready to build your custom solution.</p>
                      <div className="flex gap-3 flex-wrap justify-center">
                        <Button 
                          onClick={() => navigate('/auth')}
                          className="bg-[#004080] hover:bg-[#003366] text-white"
                        >
                          Login to Post a Project
                        </Button>
                        <Button 
                          onClick={() => navigate('/request-project')}
                          variant="outline"
                          className="border-[#004080] text-[#004080] hover:bg-[#f0f7ff]"
                        >
                          Submit Request as Guest
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
            
            {/* Successful Projects Section */}
            <div id="projects" className="py-16 bg-gray-50 scroll-mt-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-[#004080] mb-3">Successful Projects</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Browse our showcase of completed projects from top developers in our community
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      id: 1,
                      name: "Corporate Pulse",
                      description: "A modern responsive company introduction website with interactive elements and integrated CMS.",
                      technologies: ["React", "TypeScript", "Tailwind CSS", "Strapi CMS"],
                      outcome: "Increased client inquiries by 47% within 3 months of launch.",
                      icon: Monitor
                    },
                    {
                      id: 2,
                      name: "PageTurner Plus",
                      description: "Comprehensive bookstore management system with inventory tracking, sales analytics, and customer loyalty features.",
                      technologies: ["Node.js", "Express", "PostgreSQL", "Redis"],
                      outcome: "Reduced inventory management time by 65% for a chain with 12 locations.",
                      icon: BookOpen
                    },
                    {
                      id: 3,
                      name: "StyleStock",
                      description: "Clothing store management system with barcode integration, seasonal inventory planning, and staff scheduling.",
                      technologies: ["React", "Django", "PostgreSQL", "Docker"],
                      outcome: "Improved stock accuracy to 99.8% and reduced overstocking by 32%.",
                      icon: ShoppingCart
                    },
                    {
                      id: 4,
                      name: "QuickBite",
                      description: "Fast food delivery mobile app with real-time tracking, customizable orders, and loyalty program.",
                      technologies: ["React Native", "Firebase", "Google Maps API", "Stripe"],
                      outcome: "Processed over 15,000 orders in first month with 4.8/5 user rating.",
                      icon: Smartphone
                    },
                    {
                      id: 5,
                      name: "TaleScape",
                      description: "Interactive story reading mobile app with audio narration, animations, and parental controls.",
                      technologies: ["Flutter", "Firebase", "AWS Polly", "SVG Animation"],
                      outcome: "Featured in App Store's \"Apps We Love\" with 250,000+ downloads.",
                      icon: BookOpen
                    },
                    {
                      id: 6,
                      name: "CineFlix+",
                      description: "Online movie streaming platform with personalized recommendations and social sharing features.",
                      technologies: ["Next.js", "GraphQL", "MongoDB", "AWS S3"],
                      outcome: "Achieved 98.5% uptime with smooth playback for 50,000+ concurrent users.",
                      icon: Monitor
                    },
                    {
                      id: 7,
                      name: "SportsPulse",
                      description: "Real-time sports news and scores mobile app with personalized alerts and live commentary.",
                      technologies: ["React Native", "Socket.io", "Node.js", "MongoDB"],
                      outcome: "Retained 78% of users after 3 months with average 22 minutes daily use.",
                      icon: Smartphone
                    },
                    {
                      id: 8,
                      name: "VistaTour",
                      description: "Tourism marketplace connecting travelers with local guides and unique experiences.",
                      technologies: ["Vue.js", "Laravel", "MySQL", "Mapbox"],
                      outcome: "Facilitated 10,000+ bookings across 45 countries in first year.",
                      icon: Monitor
                    }
                  ].map((project) => {
                    const IconComponent = project.icon || Code;
                    return (
                      <Card key={project.id} className="bg-white hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <div className="relative pt-[60%] bg-gray-50">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IconComponent className="h-12 w-12 text-[#004080]/30" />
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-[#004080]">{project.name}</CardTitle>
                          <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                        </CardHeader>
                        <CardContent className="py-2 flex-grow">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.map((tech, index) => (
                              <span 
                                key={index} 
                                className="inline-block px-2 py-1 text-xs rounded-full bg-[#004080]/10 text-[#004080]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 border-l-2 border-[#ffcc00] pl-3 italic">
                            {project.outcome}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="link"
                            className="text-[#004080] hover:text-[#003366] p-0 h-auto flex items-center gap-1"
                            onClick={() => navigate('/request-project')}
                          >
                            Request Similar Project <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
                

              </div>
            </div>
            
            <Footer />
          </div>
        );
      }} />
      
      <Route path="/projects" component={() => {
        const { user, isLoading } = useAuth();
        const [, navigate] = useLocation();
        
        if (isLoading) {
          return (
            <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
              <Header />
              <main className="flex-grow container flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
              </main>
              <Footer />
            </div>
          );
        }
        
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
                      <div className="flex gap-3 flex-wrap justify-center">
                        <Button 
                          onClick={() => navigate('/auth')}
                          className="bg-[#004080] hover:bg-[#003366] text-white"
                        >
                          Login to Post a Project
                        </Button>
                        <Button 
                          onClick={() => navigate('/request-project')}
                          variant="outline"
                          className="border-[#004080] text-[#004080] hover:bg-[#f0f7ff]"
                        >
                          Submit Request as Guest
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              
              {/* Phase 2: Code Service & Product Build Module - Portfolio Showcase */}
              <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#004080] mb-3">Successful Projects</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Browse our showcase of completed projects from top developers in our community
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        id: 1,
                        name: "Corporate Pulse",
                        description: "A modern responsive company introduction website with interactive elements and integrated CMS.",
                        technologies: ["React", "TypeScript", "Tailwind CSS", "Strapi CMS"],
                        outcome: "Increased client inquiries by 47% within 3 months of launch.",
                        icon: Monitor
                      },
                      {
                        id: 2,
                        name: "PageTurner Plus",
                        description: "Comprehensive bookstore management system with inventory tracking, sales analytics, and customer loyalty features.",
                        technologies: ["Node.js", "Express", "PostgreSQL", "Redis"],
                        outcome: "Reduced inventory management time by 65% for a chain with 12 locations.",
                        icon: BookOpen
                      },
                      {
                        id: 3,
                        name: "StyleStock",
                        description: "Clothing store management system with barcode integration, seasonal inventory planning, and staff scheduling.",
                        technologies: ["React", "Django", "PostgreSQL", "Docker"],
                        outcome: "Improved stock accuracy to 99.8% and reduced overstocking by 32%.",
                        icon: ShoppingCart
                      },
                      {
                        id: 4,
                        name: "QuickBite",
                        description: "Fast food delivery mobile app with real-time tracking, customizable orders, and loyalty program.",
                        technologies: ["React Native", "Firebase", "Google Maps API", "Stripe"],
                        outcome: "Processed over 15,000 orders in first month with 4.8/5 user rating.",
                        icon: Smartphone
                      },
                      {
                        id: 5,
                        name: "TaleScape",
                        description: "Interactive story reading mobile app with audio narration, animations, and parental controls.",
                        technologies: ["Flutter", "Firebase", "AWS Polly", "SVG Animation"],
                        outcome: "Featured in App Store's \"Apps We Love\" with 250,000+ downloads.",
                        icon: BookOpen
                      },
                      {
                        id: 6,
                        name: "CineFlix+",
                        description: "Online movie streaming platform with personalized recommendations and social sharing features.",
                        technologies: ["Next.js", "GraphQL", "MongoDB", "AWS S3"],
                        outcome: "Achieved 98.5% uptime with smooth playback for 50,000+ concurrent users.",
                        icon: Monitor
                      },
                      {
                        id: 7,
                        name: "SportsPulse",
                        description: "Real-time sports news and scores mobile app with personalized alerts and live commentary.",
                        technologies: ["React Native", "Socket.io", "Node.js", "MongoDB"],
                        outcome: "Retained 78% of users after 3 months with average 22 minutes daily use.",
                        icon: Smartphone
                      },
                      {
                        id: 8,
                        name: "VistaTour",
                        description: "Tourism marketplace connecting travelers with local guides and unique experiences.",
                        technologies: ["Vue.js", "Laravel", "MySQL", "Mapbox"],
                        outcome: "Facilitated 10,000+ bookings across 45 countries in first year.",
                        icon: Monitor
                      }
                    ].map((project) => {
                      const IconComponent = project.icon || Code;
                      return (
                        <Card key={project.id} className="bg-white hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          <div className="relative pt-[60%] bg-gray-50">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <IconComponent className="h-12 w-12 text-[#004080]/30" />
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-[#004080]">{project.name}</CardTitle>
                            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                          </CardHeader>
                          <CardContent className="py-2 flex-grow">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map((tech, index) => (
                                <span 
                                  key={index} 
                                  className="inline-block px-2 py-1 text-xs rounded-full bg-[#004080]/10 text-[#004080]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-700 border-l-2 border-[#ffcc00] pl-3 italic">
                              {project.outcome}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="link"
                              className="text-[#004080] hover:text-[#003366] p-0 h-auto flex items-center gap-1"
                              onClick={() => navigate('/request-project')}
                            >
                              Request Similar Project <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <Button 
                      className="bg-[#004080] hover:bg-[#003366] text-white"
                      onClick={() => navigate('/request-project')}
                    >
                      Request Custom Project <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
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
      <Route path="/marketplace/product/:id" component={ProductDetailEcommerce} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
