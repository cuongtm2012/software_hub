import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Loader2, AlertCircle, CheckCircle2, Clock, FileText, DollarSign, MessagesSquare,
  Store, Plus, Package, TrendingUp, ShoppingCart, Star, Eye, Edit, Trash2,
  Users, BarChart3, Briefcase, Code, Target, XCircle, ChevronDown, ChevronUp, 
  ChevronLeft, ChevronRight, Edit3, CalendarDays, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define types for the dashboard data
interface Project {
  id: number;
  title: string;
  status: string;
  deadline: string;
  description?: string;
  client_id?: number;
  budget?: string;
}

interface ExternalRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  project_description: string;
  status: string;
  created_at: string;
}

interface Quote {
  id: number;
  project_id: number;
  developer_id?: number;
  price: string;
  status: string;
  message?: string;
  project?: { title: string };
  developer?: { name: string };
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  status: string;
  category: string;
  stock_quantity: number;
  total_sales: number;
  avg_rating: number | null;
  featured: boolean;
  created_at: string;
}

interface Order {
  id: number;
  buyer_id: number;
  total_amount: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>('all');
  
  // Product list expansion state
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);
  const productsPerPage = 10;
  
  // Project list expansion state
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [isLoadingProjectPagination, setIsLoadingProjectPagination] = useState(false);
  const projectsPerPage = 10;

  // Fetch seller profile and products (for sellers)
  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery<any>({
    queryKey: ["/api/seller/profile"],
    enabled: !!user && user.role === 'seller',
  });

  const { data: sellerProducts, isLoading: isLoadingProducts } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/seller/products", { page: showAllProducts ? currentPage : 1, limit: showAllProducts ? productsPerPage : 50 }],
    enabled: !!user && user.role === 'seller',
  });

  // Fetch paginated products when expanded
  const { data: paginatedProducts, isLoading: isLoadingPaginated } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/seller/products", { page: currentPage, limit: productsPerPage }],
    enabled: !!user && user.role === 'seller' && showAllProducts,
  });

  const { data: sellerOrders, isLoading: isLoadingOrders } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/seller/orders"],
    enabled: !!user && user.role === 'seller',
  });

  // Fetch projects and quotes (general dashboard)
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!user && (user.role === 'admin' || user.role === 'client' || user.role === 'developer'),
  });

  // Fetch user's own external requests (for "My Projects" section)
  const { data: externalRequestsData, isLoading: isLoadingExternalRequests } = useQuery<{ requests: ExternalRequest[]; total: number }>({
    queryKey: ['/api/my-external-requests', { page: 1, limit: 5, status: selectedProjectStatus }],
    enabled: !!user,
  });

  // Fetch paginated combined projects when expanded (includes both external requests and available projects)
  const { data: paginatedProjectsData, isLoading: isLoadingPaginatedProjects } = useQuery<{ projects: (Project | ExternalRequest)[]; total: number }>({
    queryKey: ['/api/my-combined-projects', { page: currentProjectPage, limit: projectsPerPage, status: selectedProjectStatus }],
    enabled: !!user && showAllProjects,
  });

  // Fetch available projects for the tabs - use the same source as combined projects for consistency
  const { data: availableProjectsData, isLoading: isLoadingAvailableProjects } = useQuery<{ projects: Project[]; total: number }>({
    queryKey: ['/api/my-combined-projects', { status: selectedProjectStatus !== 'all' ? selectedProjectStatus : undefined, limit: 100 }],
    enabled: !!user,
  });

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    enabled: !!user,
  });

  // Redirect admin users to admin dashboard
  React.useEffect(() => {
    if (user && user.role === 'admin') {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        navigate('/admin');
      }, 0);
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Login Required</h2>
                <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
                <Button onClick={() => navigate("/test-login")}>Login</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect admins to admin dashboard
  if (user.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const products = sellerProducts?.products || [];
  const orders = sellerOrders?.orders || [];
  const totalProducts = sellerProducts?.total || 0;
  const displayProducts = showAllProducts ? (paginatedProducts?.products || products) : products;
  const totalPages = showAllProducts ? Math.ceil(totalProducts / productsPerPage) : 1;
  const isSeller = user.role === 'seller';

  // Calculate product statistics
  const productStats = {
    total: totalProducts || products.length,
    active: products.filter(p => p.status === 'approved').length,
    pending: products.filter(p => p.status === 'pending').length,
    totalSales: products.reduce((sum, p) => sum + p.total_sales, 0),
    avgRating: products.length > 0 
      ? products.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / products.length
      : 0,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0)
  };

  // Use unified data source - all sections should show the same projects from combined endpoint
  const allCombinedProjects = availableProjectsData?.projects || [];
  const totalCombinedProjectsCount = availableProjectsData?.total || allCombinedProjects.length;
  
  // For expanded view, use paginated combined data; for compact view, show first 3 from combined data
  const displayedProjects = showAllProjects 
    ? (paginatedProjectsData?.projects || [])
    : allCombinedProjects.slice(0, 3); // Show only first 3 for compact view
  
  const totalCombinedProjects = showAllProjects ? (paginatedProjectsData?.total || 0) : totalCombinedProjectsCount;
  const totalProjectPages = showAllProjects ? Math.ceil(totalCombinedProjects / projectsPerPage) : 1;
  
  // Use unified combined projects for statistics
  const projectStats = {
    total: totalCombinedProjectsCount,
    active: allCombinedProjects.filter((r: any) => r.status === 'in_progress').length,
    completed: allCombinedProjects.filter((r: any) => r.status === 'completed').length,
    pending: allCombinedProjects.filter((r: any) => r.status === 'pending').length,
    quotes: quotes?.length || 0,
    acceptedQuotes: quotes?.filter(q => q.status === 'accepted').length || 0
  };

  // Both sections now use the same data source for consistency
  const displayAvailableProjects = allCombinedProjects;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-8 max-w-full overflow-x-hidden">
          {/* Welcome Header */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-8 p-3 sm:p-4 lg:p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Manage your {isSeller ? 'products and projects' : 'projects'} from your dashboard
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue={isSeller ? "products" : "projects"} className="w-full">
            <div className="bg-white rounded-lg shadow-sm border">
              <TabsList className={`grid w-full h-10 sm:h-12 bg-gray-50 m-1 ${isSeller ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {isSeller && (
                  <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white text-xs sm:text-sm lg:text-base px-2 sm:px-4">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Products</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white text-xs sm:text-sm lg:text-base px-2 sm:px-4">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Projects</span>
                </TabsTrigger>
              </TabsList>

              {/* PRODUCTS TAB */}
              {isSeller && (
                <TabsContent value="products" className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Add Product & Chat Buttons */}
                  <div className="flex flex-wrap gap-2 justify-start">
                    <Button
                      onClick={() => navigate('/seller/products/new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                      size="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/chat')}
                      className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Messages
                    </Button>
                  </div>

                  {/* Product Statistics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-2 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-600">Total Products</p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-900">{productStats.total}</p>
                          </div>
                          <Package className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-2 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-green-600">Active Products</p>
                            <p className="text-lg sm:text-2xl font-bold text-green-900">{productStats.active}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-2 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-purple-600">Avg Rating</p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-900">
                              {productStats.avgRating.toFixed(1)}
                            </p>
                          </div>
                          <Star className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-2 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-orange-600">Total Sales</p>
                            <p className="text-lg sm:text-2xl font-bold text-orange-900">{productStats.totalSales}</p>
                          </div>
                          <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Products List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Your Products
                      </CardTitle>
                      <CardDescription>
                        Manage and track your marketplace products
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="mb-4">No products yet. Start by adding your first product!</p>
                          <Button
                            onClick={() => navigate('/seller/products/new')}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Product
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayProducts.slice(0, showAllProducts ? displayProducts.length : 3).map((product) => (
                            <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{product.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                                  <span className="text-green-600 font-medium">${parseFloat(product.price).toFixed(2)}</span>
                                  <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                                    {product.status}
                                  </Badge>
                                  <span className="text-gray-500">Stock: {product.stock_quantity}</span>
                                  {product.avg_rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span>{product.avg_rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none"
                                  onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                      // Add delete mutation here
                                      const deleteProduct = async () => {
                                        try {
                                          await apiRequest('DELETE', `/api/seller/products/${product.id}`);
                                          queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
                                          toast({
                                            title: "Success",
                                            description: "Product deleted successfully"
                                          });
                                        } catch (error: any) {
                                          toast({
                                            title: "Error", 
                                            description: error.message || "Failed to delete product",
                                            variant: "destructive"
                                          });
                                        }
                                      };
                                      deleteProduct();
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                          {/* Expand/Collapse Button and Pagination */}
                          {totalProducts > 3 && (
                            <div className="space-y-4">
                              <div className="text-center pt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setShowAllProducts(!showAllProducts);
                                    setCurrentPage(1);
                                  }}
                                  disabled={isLoadingPaginated}
                                >
                                  {isLoadingPaginated ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : showAllProducts ? (
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                  )}
                                  {showAllProducts ? 'Show Less' : `View All Products (${totalProducts})`}
                                </Button>
                              </div>
                              
                              {/* Pagination Controls */}
                              {showAllProducts && totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages} ({totalProducts} products)
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentPage(currentPage - 1);
                                        setIsLoadingPagination(true);
                                      }}
                                      disabled={currentPage === 1 || isLoadingPaginated}
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                      Previous
                                    </Button>
                                    
                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                      const pageNum = i + 1;
                                      return (
                                        <Button
                                          key={pageNum}
                                          variant={currentPage === pageNum ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => {
                                            setCurrentPage(pageNum);
                                            setIsLoadingPagination(true);
                                          }}
                                          disabled={isLoadingPaginated}
                                        >
                                          {pageNum}
                                        </Button>
                                      );
                                    })}
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentPage(currentPage + 1);
                                        setIsLoadingPagination(true);
                                      }}
                                      disabled={currentPage === totalPages || isLoadingPaginated}
                                    >
                                      Next
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Loading indicator for pagination */}
                              {showAllProducts && isLoadingPaginated && (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                  <span className="ml-2 text-sm text-gray-600">Loading products...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* PROJECTS TAB */}
              <TabsContent value="projects" className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                {/* New Project & Chat Buttons */}
                <div className="flex flex-wrap gap-2 justify-start">
                  <Button
                    onClick={() => navigate('/request-project')}
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    size="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/chat')}
                    className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Messages
                  </Button>
                </div>

                {/* Project Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-2 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-green-600">Total Projects</p>
                          <p className="text-lg sm:text-2xl font-bold text-green-900">{projectStats.total}</p>
                        </div>
                        <Briefcase className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-2 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-blue-600">Active Projects</p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-900">{projectStats.active}</p>
                        </div>
                        <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-2 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-yellow-600">Total Quotes</p>
                          <p className="text-lg sm:text-2xl font-bold text-yellow-900">{projectStats.quotes}</p>
                        </div>
                        <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projects List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Recent Projects
                    </CardTitle>
                    <CardDescription>
                      Track your ongoing and completed projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(isLoadingProjects || isLoadingExternalRequests) ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                      </div>
                    ) : displayedProjects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">No projects yet. Start your first project!</p>
                        <Button
                          onClick={() => navigate('/request-project')}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Show unified projects (external requests + available projects) */}
                        {displayedProjects.map((project: any, index) => (
                          <div key={`recent-project-${project.id}-${index}-${project.type || 'unknown'}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {project.title || `Project Request #${project.id}`}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {(project.description || project.project_description)?.substring(0, 100)}...
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                                  {project.status}
                                </Badge>
                                {project.budget && (
                                  <span className="text-green-600 font-medium">${parseFloat(project.budget).toFixed(2)}</span>
                                )}
                                {project.deadline && (
                                  <span className="text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                )}
                                {project.created_at && !project.deadline && (
                                  <span className="text-gray-500">
                                    Submitted: {new Date(project.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                        

                        
                        {/* Expand/Collapse Button and Pagination for Projects */}
                        {totalCombinedProjects > 3 && (
                          <div className="space-y-4">
                            <div className="text-center pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowAllProjects(!showAllProjects);
                                  setCurrentProjectPage(1);
                                }}
                                disabled={isLoadingPaginatedProjects}
                              >
                                {isLoadingPaginatedProjects ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : showAllProjects ? (
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                )}
                                {showAllProjects ? 'Show Less' : `View All Projects (${totalCombinedProjects})`}
                              </Button>
                            </div>
                            
                            {/* Pagination Controls for Projects */}
                            {showAllProjects && totalProjectPages > 1 && (
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                  Page {currentProjectPage} of {totalProjectPages} ({totalCombinedProjects} projects)
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentProjectPage(currentProjectPage - 1);
                                      setIsLoadingProjectPagination(true);
                                    }}
                                    disabled={currentProjectPage === 1 || isLoadingPaginatedProjects}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                  </Button>
                                  
                                  {/* Page numbers */}
                                  {Array.from({ length: Math.min(totalProjectPages, 5) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={currentProjectPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          setCurrentProjectPage(pageNum);
                                          setIsLoadingProjectPagination(true);
                                        }}
                                        disabled={isLoadingPaginatedProjects}
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  })}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentProjectPage(currentProjectPage + 1);
                                      setIsLoadingProjectPagination(true);
                                    }}
                                    disabled={currentProjectPage === totalProjectPages || isLoadingPaginatedProjects}
                                  >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Loading indicator for pagination */}
                            {showAllProjects && isLoadingPaginatedProjects && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                <span className="ml-2 text-sm text-gray-600">Loading projects...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* View All Available Projects Section */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-green-50/30 to-green-100/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Code className="h-6 w-6 text-green-600" />
                      </div>
                      View All Available Projects
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Browse and filter projects by status with enhanced visual details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced Project Filter Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-5 h-12 bg-gradient-to-r from-gray-100 to-gray-50 p-1 rounded-xl shadow-inner">
                        <TabsTrigger 
                          value="all" 
                          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 transition-all duration-200 rounded-lg"
                        >
                          <div className="h-2 w-2 rounded-full bg-gray-400 data-[state=active]:bg-green-500"></div>
                          All
                        </TabsTrigger>
                        <TabsTrigger 
                          value="pending" 
                          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 transition-all duration-200 rounded-lg"
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                          Pending
                        </TabsTrigger>
                        <TabsTrigger 
                          value="in_progress" 
                          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-700 transition-all duration-200 rounded-lg"
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                          In Progress
                        </TabsTrigger>
                        <TabsTrigger 
                          value="completed" 
                          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 transition-all duration-200 rounded-lg"
                        >
                          <div className="h-2 w-2 rounded-full bg-green-400"></div>
                          Completed
                        </TabsTrigger>
                        <TabsTrigger 
                          value="cancelled" 
                          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-700 transition-all duration-200 rounded-lg"
                        >
                          <div className="h-2 w-2 rounded-full bg-red-400"></div>
                          Cancelled
                        </TabsTrigger>
                      </TabsList>

                      {/* All Projects Tab */}
                      <TabsContent value="all" className="space-y-4">
                        {isLoadingAvailableProjects ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                          </div>
                        ) : !displayAvailableProjects || displayAvailableProjects.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no available projects at the moment. Check back later or try a different status filter.</p>
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => navigate('/request-project')}
                            >
                              Submit New Project Request
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {displayAvailableProjects.map((project: any, index) => {
                              const getStatusConfig = (status: string) => {
                                switch (status) {
                                  case 'pending':
                                    return { 
                                      color: 'bg-blue-100 text-blue-800 border-blue-200', 
                                      icon: '🔄',
                                      dotColor: 'bg-blue-500'
                                    };
                                  case 'in_progress':
                                    return { 
                                      color: 'bg-orange-100 text-orange-800 border-orange-200', 
                                      icon: '⚡',
                                      dotColor: 'bg-orange-500'
                                    };
                                  case 'completed':
                                    return { 
                                      color: 'bg-green-100 text-green-800 border-green-200', 
                                      icon: '✅',
                                      dotColor: 'bg-green-500'
                                    };
                                  case 'cancelled':
                                    return { 
                                      color: 'bg-red-100 text-red-800 border-red-200', 
                                      icon: '❌',
                                      dotColor: 'bg-red-500'
                                    };
                                  default:
                                    return { 
                                      color: 'bg-gray-100 text-gray-800 border-gray-200', 
                                      icon: '📋',
                                      dotColor: 'bg-gray-500'
                                    };
                                }
                              };
                              
                              const statusConfig = getStatusConfig(project.status);
                              
                              return (
                                <div 
                                  key={`all-tab-${project.id}-${index}-${project.type || 'project'}`} 
                                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                  onClick={() => navigate(`/project/${project.id}`)}
                                >
                                  <div className="flex flex-col gap-4">
                                    {/* Project Info */}
                                    <div className="flex-1 space-y-3">
                                      {/* Header Row */}
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                            {project.title || project.name || 'Untitled Project'}
                                          </h4>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {project.email && `Contact: ${project.email}`}
                                          </p>
                                        </div>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                          <span>{statusConfig.icon}</span>
                                          <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Description */}
                                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                        {project.project_description || project.description || 'No description available for this project.'}
                                      </p>
                                      
                                      {/* Metadata Row */}
                                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <CalendarDays className="h-4 w-4" />
                                          <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                          })}</span>
                                        </div>
                                        {project.budget && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Budget: ${project.budget}</span>
                                          </div>
                                        )}
                                        {project.deadline && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    

                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Pending Projects Tab */}
                      <TabsContent value="pending" className="space-y-4 mt-6">
                        <div className="grid gap-4">
                          {displayAvailableProjects?.filter((p: any) => p.status === 'pending').map((project: any, index) => {
                            const statusConfig = { 
                              color: 'bg-blue-100 text-blue-800 border-blue-200', 
                              icon: '🔄',
                              dotColor: 'bg-blue-500'
                            };
                            
                            return (
                              <div 
                                key={`pending-${project.id}-${index}-${project.type || 'project'}`} 
                                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                          {project.title || project.name || 'Untitled Project'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {project.email && `Contact: ${project.email}`}
                                        </p>
                                      </div>
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                        <span>{statusConfig.icon}</span>
                                        <span className="capitalize">Pending</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                      {project.project_description || project.description || 'No description available for this project.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric' 
                                        })}</span>
                                      </div>
                                      {project.budget && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          <span>Budget: ${project.budget}</span>
                                        </div>
                                      )}
                                      {project.deadline && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }) || []}
                          {(!displayAvailableProjects?.filter((p: any) => p.status === 'pending').length) && (
                            <div className="text-center py-12 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200">
                              <Clock className="h-16 w-16 mx-auto mb-4 text-blue-300" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending projects</h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no pending projects at the moment.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* In Progress Projects Tab */}
                      <TabsContent value="in_progress" className="space-y-4 mt-6">
                        <div className="grid gap-4">
                          {displayAvailableProjects?.filter((p: any) => p.status === 'in_progress' || p.status === 'in-progress').map((project: any, index) => {
                            const statusConfig = { 
                              color: 'bg-orange-100 text-orange-800 border-orange-200', 
                              icon: '⚡',
                              dotColor: 'bg-orange-500'
                            };
                            
                            return (
                              <div 
                                key={`progress-${project.id}-${index}-${project.type || 'project'}`} 
                                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                                          {project.title || project.name || 'Untitled Project'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {project.email && `Contact: ${project.email}`}
                                        </p>
                                      </div>
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                        <span>{statusConfig.icon}</span>
                                        <span className="capitalize">In Progress</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                      {project.project_description || project.description || 'No description available for this project.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric' 
                                        })}</span>
                                      </div>
                                      {project.budget && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          <span>Budget: ${project.budget}</span>
                                        </div>
                                      )}
                                      {project.deadline && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }) || []}
                          {(!displayAvailableProjects?.filter((p: any) => p.status === 'in_progress' || p.status === 'in-progress').length) && (
                            <div className="text-center py-12 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200">
                              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-orange-300" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects in progress</h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no active projects at the moment.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Completed Projects Tab */}
                      <TabsContent value="completed" className="space-y-4 mt-6">
                        <div className="grid gap-4">
                          {displayAvailableProjects?.filter((p: any) => p.status === 'completed').map((project: any, index) => {
                            const statusConfig = { 
                              color: 'bg-green-100 text-green-800 border-green-200', 
                              icon: '✅',
                              dotColor: 'bg-green-500'
                            };
                            
                            return (
                              <div 
                                key={`completed-${project.id}-${index}-${project.type || 'project'}`} 
                                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                          {project.title || project.name || 'Untitled Project'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {project.email && `Contact: ${project.email}`}
                                        </p>
                                      </div>
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                        <span>{statusConfig.icon}</span>
                                        <span className="capitalize">Completed</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                      {project.project_description || project.description || 'No description available for this project.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric' 
                                        })}</span>
                                      </div>
                                      {project.budget && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          <span>Budget: ${project.budget}</span>
                                        </div>
                                      )}
                                      {project.deadline && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }) || []}
                          {(!displayAvailableProjects?.filter((p: any) => p.status === 'completed').length) && (
                            <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-dashed border-green-200">
                              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-300" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed projects</h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no completed projects at the moment.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Cancelled Projects Tab */}
                      <TabsContent value="cancelled" className="space-y-4 mt-6">
                        <div className="grid gap-4">
                          {displayAvailableProjects?.filter((p: any) => p.status === 'cancelled').map((project: any, index) => {
                            const statusConfig = { 
                              color: 'bg-red-100 text-red-800 border-red-200', 
                              icon: '❌',
                              dotColor: 'bg-red-500'
                            };
                            
                            return (
                              <div 
                                key={`cancelled-${project.id}-${index}-${project.type || 'project'}`} 
                                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                          {project.title || project.name || 'Untitled Project'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {project.email && `Contact: ${project.email}`}
                                        </p>
                                      </div>
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                        <span>{statusConfig.icon}</span>
                                        <span className="capitalize">Cancelled</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                      {project.project_description || project.description || 'No description available for this project.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric' 
                                        })}</span>
                                      </div>
                                      {project.budget && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          <span>Budget: ${project.budget}</span>
                                        </div>
                                      )}
                                      {project.deadline && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }) || []}
                          {(!displayAvailableProjects?.filter((p: any) => p.status === 'cancelled').length) && (
                            <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-dashed border-red-200">
                              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-300" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cancelled projects</h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no cancelled projects at the moment.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}