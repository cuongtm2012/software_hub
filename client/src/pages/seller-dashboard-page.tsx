import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Store, 
  Plus, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Star, 
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Fetch seller profile and verification status
  const { data: sellerData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  // Fetch seller's products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/seller/products"],
    enabled: !!user && sellerData?.seller_profile?.verification_status === "verified",
  });

  // Fetch seller's orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/seller/orders"],
    enabled: !!user && sellerData?.seller_profile?.verification_status === "verified",
  });

  // Fetch sales analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/seller/analytics"],
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

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">Please log in to access your seller dashboard.</p>
              <Button onClick={() => navigate("/auth")}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // If user is not a seller, redirect to registration
  if (!sellerData?.seller_profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Become a Seller
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You haven't registered as a seller yet. Join our marketplace and start selling your digital products!
              </p>
              <Button onClick={() => navigate("/seller/register")} className="bg-[#004080] hover:bg-[#003366]">
                Register as Seller
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const sellerProfile = sellerData.seller_profile;
  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];
  const analytics = analyticsData || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">Welcome back, {sellerProfile.business_name || user.name}</p>
                {getStatusBadge(sellerProfile.verification_status)}
              </div>
            </div>
            {sellerProfile.verification_status === "verified" && (
              <Button onClick={() => navigate("/seller/products/new")} className="bg-[#004080] hover:bg-[#003366]">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          {/* Verification Status Alert */}
          {sellerProfile.verification_status === "pending" && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your seller account is being reviewed. This typically takes 1-2 business days. 
                You'll be able to list products once verified.
              </AlertDescription>
            </Alert>
          )}

          {sellerProfile.verification_status === "rejected" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your seller registration was rejected. Please contact support for more information and to resubmit your application.
              </AlertDescription>
            </Alert>
          )}

          {sellerProfile.verification_status === "verified" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(Number(sellerProfile.total_sales || 0))}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{products.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {products.filter(p => p.status === "approved").length} live products
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {orders.filter(o => o.status === "completed").length} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Seller Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {sellerProfile.rating ? Number(sellerProfile.rating).toFixed(1) : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sellerProfile.total_reviews || 0} reviews
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="products" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {productsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
                        </div>
                      ) : products.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                          <p className="text-gray-600 mb-4">Start by adding your first product to the marketplace.</p>
                          <Button onClick={() => navigate("/seller/products/new")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {products.map((product: any) => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="h-8 w-8 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{product.title}</h3>
                                  <p className="text-sm text-gray-600">${Number(product.price).toFixed(2)}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getProductStatusBadge(product.status)}
                                    <span className="text-sm text-gray-500">
                                      {product.total_sales || 0} sales
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteProductMutation.mutate(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Recent Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-600">Orders will appear here when customers purchase your products.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 10).map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium">Order #{order.id}</h3>
                                <p className="text-sm text-gray-600">
                                  ${Number(order.total_amount).toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {order.status}
                                </Badge>
                              </div>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sales Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                          <p className="text-gray-600">Detailed sales analytics and insights will be available here.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}