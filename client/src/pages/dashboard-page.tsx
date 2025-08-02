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
  Users, BarChart3
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
}

interface Quote {
  id: number;
  project_id: number;
  developer_id?: number;
  amount: number;
  status: string;
  description?: string;
  project?: { title: string };
  developer?: { name: string };
}

interface Payment {
  id: number;
  project_id: number;
  amount: number;
  status: string;
  createdAt: string;
  project?: { title: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  // Fetch quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  // Fetch payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  // Fetch seller profile and data
  const { data: sellerData, isLoading: sellerLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const { data: sellerProductsData, isLoading: sellerProductsLoading } = useQuery({
    queryKey: ["/api/seller/products"],
    enabled: !!user && sellerData?.seller_profile?.verification_status === "verified",
  });

  const { data: sellerOrdersData, isLoading: sellerOrdersLoading } = useQuery({
    queryKey: ["/api/seller/orders"],
    enabled: !!user && sellerData?.seller_profile?.verification_status === "verified",
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest(`/api/seller/products/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingProjects || isLoadingQuotes || isLoadingPayments || sellerLoading;

  // Helper functions for seller functionality
  const sellerProfile = sellerData?.seller_profile;
  const sellerProducts = sellerProductsData?.products || [];
  const sellerOrders = sellerOrdersData?.orders || [];

  // Seller-specific render functions
  const renderSellerOverview = () => {
    if (sellerLoading) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(sellerProfile?.total_sales || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellerProducts.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(sellerProfile?.rating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">({sellerProfile?.total_reviews || 0} reviews)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellerOrders.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSellerProducts = () => {
    if (sellerProductsLoading) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!sellerProducts.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center">No products yet</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start selling by adding your first product
            </p>
            <Button onClick={() => navigate("/seller/products/new")} className="bg-[#004080] hover:bg-[#003366]">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellerProducts.map((product: any) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                  {getProductStatusBadge(product.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#004080]">${Number(product.price).toFixed(2)}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/marketplace/product/${product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSellerOrders = () => {
    if (sellerOrdersLoading) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Orders from your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No orders yet</p>
            <p className="text-sm">Orders will appear here when customers purchase your products</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderProjects = () => {
    if (isLoadingProjects) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center mb-1">No projects found</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              You haven't created any projects yet
            </p>
            <Button 
              onClick={() => navigate('/request-project')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              Create New Project
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                Pending
              </CardTitle>
              <CardDescription>Projects awaiting action</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.filter(p => p.status === 'pending')?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Active
              </CardTitle>
              <CardDescription>Projects in progress</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.filter(p => p.status === 'active')?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Total
              </CardTitle>
              <CardDescription>All projects</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Project List</CardTitle>
            <CardDescription>Manage your projects</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Project Name</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-left font-medium">Deadline</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects?.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{project.title}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2">{new Date(project.deadline).toLocaleDateString()}</td>
                      <td className="py-2 px-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/quotes/${project.id}`)}
                        >
                          View Quotes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuotes = () => {
    if (isLoadingQuotes) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!quotes?.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center">No quotes found</p>
            <p className="text-sm text-muted-foreground text-center">
              You haven't received any quotes yet
            </p>
          </CardContent>
        </Card>
      );
    }

    const pendingQuotes = quotes?.filter(q => q.status === 'pending') || [];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Pending Quotes</CardTitle>
            <CardDescription>Review and respond to pending quotes</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            {pendingQuotes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending quotes at this time
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left font-medium">Project</th>
                      <th className="py-2 px-2 text-left font-medium">Contractor</th>
                      <th className="py-2 px-2 text-left font-medium">Amount</th>
                      <th className="py-2 px-2 text-left font-medium">Status</th>
                      <th className="py-2 px-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQuotes.map((quote) => (
                      <tr key={quote.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{quote.project?.title || 'Unknown Project'}</td>
                        <td className="py-2 px-2">{quote.developer?.name || 'Unknown Developer'}</td>
                        <td className="py-2 px-2">${quote.amount}</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>All Quotes</CardTitle>
            <CardDescription>View all quotes for your projects</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Project</th>
                    <th className="py-2 px-2 text-left font-medium">Contractor</th>
                    <th className="py-2 px-2 text-left font-medium">Amount</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes?.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{quote.project?.title || 'Unknown Project'}</td>
                      <td className="py-2 px-2">{quote.developer?.name || 'Unknown Developer'}</td>
                      <td className="py-2 px-2">${quote.amount}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          quote.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : quote.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/quotes/${quote.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPayments = () => {
    if (isLoadingPayments) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!payments?.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center">No payments found</p>
            <p className="text-sm text-muted-foreground text-center">
              You haven't made any payments yet
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View and manage your payments</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Date</th>
                    <th className="py-2 px-2 text-left font-medium">Project</th>
                    <th className="py-2 px-2 text-left font-medium">Amount</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{payment.project?.title || 'Unknown Project'}</td>
                      <td className="py-2 px-2">${payment.amount}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          payment.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'failed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {payment.status === 'pending' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-[#004080] hover:bg-[#003366] text-white"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            Pay
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'User Dashboard' : 'Dashboard'}
              {user?.role === 'admin' && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Admin Access
                </span>
              )}
            </h1>
            {sellerProfile && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-600">Welcome back, {sellerProfile.business_name || user?.name}</p>
                {getStatusBadge(sellerProfile.verification_status)}
              </div>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Button 
              onClick={() => navigate('/request-project')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              New Project
            </Button>
            {sellerProfile?.verification_status === "verified" && (
              <Button onClick={() => navigate("/seller/products/new")} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Seller verification alerts */}
        {sellerProfile?.verification_status === "pending" && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your seller account is being reviewed. This typically takes 1-2 business days. 
              You'll be able to list products once verified.
            </AlertDescription>
          </Alert>
        )}

        {sellerProfile?.verification_status === "rejected" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your seller registration was rejected. Please contact support for more information and to resubmit your application.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className={`grid w-full max-w-none mb-4 ${sellerProfile ? 'grid-cols-6' : 'grid-cols-3'}`}>
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <MessagesSquare className="h-4 w-4 mr-2" />
                Quotes
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              {sellerProfile && (
                <>
                  <TabsTrigger value="seller" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                    <Store className="h-4 w-4 mr-2" />
                    Seller Overview
                  </TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                    <Package className="h-4 w-4 mr-2" />
                    My Products
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Orders
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              {renderProjects()}
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-4">
              {renderQuotes()}
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              {renderPayments()}
            </TabsContent>

            {sellerProfile && (
              <>
                <TabsContent value="seller" className="space-y-4">
                  {renderSellerOverview()}
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  {renderSellerProducts()}
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  {renderSellerOrders()}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}