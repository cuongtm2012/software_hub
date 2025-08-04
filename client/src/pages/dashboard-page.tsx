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
  Users, BarChart3, Briefcase, Code, Target
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

  // Fetch seller profile and products (for sellers)
  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery<any>({
    queryKey: ["/api/seller/profile"],
    enabled: !!user && user.role === 'seller',
  });

  const { data: sellerProducts, isLoading: isLoadingProducts } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/seller/products"],
    enabled: !!user && user.role === 'seller',
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

  // Fetch external requests for users who are not admin/client/developer
  const { data: externalRequests, isLoading: isLoadingExternalRequests } = useQuery<ExternalRequest[]>({
    queryKey: ['/api/my-external-requests'],
    enabled: !!user && user.role !== 'admin' && user.role !== 'client' && user.role !== 'developer',
  });

  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    enabled: !!user,
  });

  // Fetch all available projects for browsing
  const { data: availableProjects, isLoading: isLoadingAvailableProjects } = useQuery<Project[]>({
    queryKey: ['/api/available-projects', { status: selectedProjectStatus }],
    enabled: !!user,
  });

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

  const products = sellerProducts?.products || [];
  const orders = sellerOrders?.orders || [];
  const isSeller = user.role === 'seller';

  // Calculate product statistics
  const productStats = {
    total: products.length,
    active: products.filter(p => p.status === 'approved').length,
    pending: products.filter(p => p.status === 'pending').length,
    totalSales: products.reduce((sum, p) => sum + p.total_sales, 0),
    avgRating: products.length > 0 
      ? products.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / products.length
      : 0,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0)
  };

  // Calculate project statistics
  const allProjects = projects || [];
  const allExternalRequests = externalRequests || [];
  
  const projectStats = {
    total: allProjects.length + allExternalRequests.length,
    active: allProjects.filter(p => p.status === 'in_progress').length + allExternalRequests.filter(r => r.status === 'in_progress').length,
    completed: allProjects.filter(p => p.status === 'completed').length + allExternalRequests.filter(r => r.status === 'completed').length,
    pending: allProjects.filter(p => p.status === 'pending').length + allExternalRequests.filter(r => r.status === 'pending').length,
    quotes: quotes?.length || 0,
    acceptedQuotes: quotes?.filter(q => q.status === 'accepted').length || 0
  };

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
                  {/* Add Product Button */}
                  <div className="flex justify-start">
                    <Button
                      onClick={() => navigate('/seller/products/new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                      size="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
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
                          {products.slice(0, 3).map((product) => (
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
                                          await apiRequest(`/api/seller/products/${product.id}`, {
                                            method: 'DELETE'
                                          });
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
                          {products.length > 3 && (
                            <div className="text-center pt-4">
                              <Button variant="outline" onClick={() => navigate('/marketplace/seller')}>
                                View All Products ({products.length})
                              </Button>
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
                {/* New Project Button */}
                <div className="flex justify-start">
                  <Button
                    onClick={() => navigate('/request-project')}
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    size="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
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
                    ) : allProjects.length === 0 && allExternalRequests.length === 0 ? (
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
                        {/* Show regular projects */}
                        {allProjects.slice(0, 2).map((project) => (
                          <div key={`project-${project.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{project.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{project.description?.substring(0, 100)}...</p>
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
                        
                        {/* Show external requests */}
                        {allExternalRequests.slice(0, 3 - allProjects.length).map((request) => (
                          <div key={`request-${request.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">Project Request #{request.id}</h4>
                              <p className="text-sm text-gray-600 mb-2">{request.project_description?.substring(0, 100)}...</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                                  {request.status}
                                </Badge>
                                <span className="text-gray-500">
                                  Submitted: {new Date(request.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => navigate(`/request-project`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {(allProjects.length + allExternalRequests.length) > 3 && (
                          <div className="text-center pt-4">
                            <Button variant="outline" onClick={() => navigate('/projects')}>
                              View All Projects ({allProjects.length + allExternalRequests.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Available Projects Browser */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Available Projects
                    </CardTitle>
                    <CardDescription>
                      Browse and discover projects available for collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Project Status Filter Tabs */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 border-b">
                        {[
                          { key: 'all', label: 'All Projects' },
                          { key: 'pending', label: 'Pending' },
                          { key: 'in-progress', label: 'In Progress' },
                          { key: 'completed', label: 'Completed' },
                          { key: 'cancelled', label: 'Cancelled' }
                        ].map((tab) => (
                          <Button
                            key={tab.key}
                            variant={selectedProjectStatus === tab.key ? 'default' : 'ghost'}
                            size="sm"
                            className="px-3 py-1 text-xs sm:text-sm"
                            onClick={() => setSelectedProjectStatus(tab.key)}
                          >
                            {tab.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Projects List */}
                    {isLoadingAvailableProjects ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : !availableProjects || availableProjects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-semibold text-gray-900 mb-2">No projects found</h3>
                        <p className="text-sm text-gray-600 mb-4">There are no available projects that match your criteria.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableProjects.slice(0, 5).map((project) => (
                          <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{project.title}</h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description?.substring(0, 80)}...</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                  {project.status}
                                </Badge>
                                {project.budget && (
                                  <span className="text-green-600 font-medium">${parseFloat(project.budget).toFixed(2)}</span>
                                )}
                                {project.deadline && (
                                  <span className="text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                        {availableProjects.length > 5 && (
                          <div className="text-center pt-3">
                            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                              View All Projects ({availableProjects.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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