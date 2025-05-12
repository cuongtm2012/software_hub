import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Box,
  DollarSign,
  ShoppingCart,
  Star,
  Tag,
  BarChart3,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stepper } from "@/components/stepper";
import { Product, Order } from "@shared/schema";

// Helper to format order status
const getOrderStatusDetails = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "Payment Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-4 w-4" />
      };
    case "processing":
      return {
        label: "Processing",
        color: "bg-blue-100 text-blue-800",
        icon: <ShoppingCart className="h-4 w-4" />
      };
    case "shipped":
      return {
        label: "Shipped",
        color: "bg-purple-100 text-purple-800",
        icon: <Truck className="h-4 w-4" />
      };
    case "delivered":
      return {
        label: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <Package className="h-4 w-4" />
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="h-4 w-4" />
      };
  }
};

// Order status steps for the stepper component
const orderSteps = [
  {
    title: "Order Placed",
    description: "Order has been received",
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    title: "Payment",
    description: "Payment secured in escrow",
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    title: "Processing",
    description: "Preparing the order",
    icon: <Package className="w-5 h-5" />
  },
  {
    title: "Shipped",
    description: "Order is on the way",
    icon: <Truck className="w-5 h-5" />
  },
  {
    title: "Delivered",
    description: "Order has arrived",
    icon: <Package className="w-5 h-5" />
  },
  {
    title: "Completed",
    description: "Payment released to seller",
    icon: <CheckCircle className="w-5 h-5" />
  }
];

// Helper to get current step index based on order status
const getCurrentStepIndex = (status: string, hasPayment: boolean) => {
  switch (status) {
    case "pending":
      return hasPayment ? 1 : 0;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    case "completed":
      return 5;
    case "cancelled":
      return -1; // Special case for cancelled orders
    default:
      return 0;
  }
};

// Allowed next statuses based on current status
const getNextStatuses = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case "pending":
      return ["processing"];
    case "processing":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered", "cancelled"];
    case "delivered":
      return ["completed"];
    default:
      return [];
  }
};

export default function MarketplaceSellerPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch seller's products
  const { 
    data: products = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ["/api/products/seller"],
  });

  // Fetch seller's orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ["/api/orders/seller"],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/products/${productId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Your product has been successfully removed.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["/api/products/seller"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/orders/seller"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (productId: number) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteProductMutation.mutate(deleteProductId);
    }
  };

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Calculate dashboard stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter((order: Order) => 
    ["pending", "processing", "shipped"].includes(order.status)
  ).length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Marketplace
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Box className="h-5 w-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">
                  {productsLoading ? <Skeleton className="h-8 w-16" /> : totalProducts}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">
                  {ordersLoading ? <Skeleton className="h-8 w-16" /> : totalOrders}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">
                  {ordersLoading ? <Skeleton className="h-8 w-16" /> : pendingOrders}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">
                  {ordersLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `$${totalRevenue.toFixed(2)}`
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Products and Orders */}
        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Products</h2>
              <Link href="/marketplace/seller/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
            </div>
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardHeader className="p-4 pb-0">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <Box className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No products yet</h3>
                <p className="mt-1 text-gray-500">
                  You haven't added any products to your store.
                </p>
                <Link href="/marketplace/seller/new">
                  <Button className="mt-6">Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <Tag className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">
                            {product.avg_rating ? product.avg_rating.toFixed(1) : "New"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/marketplace/seller/edit/${product.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Orders</h2>
            </div>
            
            {ordersLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-0">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <Skeleton className="h-24 w-24 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <Skeleton className="h-8 w-20 mb-2" />
                          <Skeleton className="h-10 w-28" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
                <p className="mt-1 text-gray-500">
                  You haven't received any orders yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <Badge variant="outline" className={
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "processing" ? "bg-blue-100 text-blue-800" :
                            order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                            order.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Ordered on {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <div className="h-24 w-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {order.product_image ? (
                            <img
                              src={order.product_image}
                              alt={order.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/marketplace/product/${order.product_id}`}>
                            <h3 className="font-medium text-lg hover:text-primary">
                              {order.product_name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {order.quantity}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Buyer: {order.buyer_name}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <div className="text-lg font-bold">${order.total_amount.toFixed(2)}</div>
                          
                          {/* Order Actions - only show status updates for specific statuses */}
                          <div className="flex gap-2 mt-2">
                            {order.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "processing")}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                Mark as Processing
                              </Button>
                            )}
                            
                            {order.status === "processing" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "shipped")}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                Mark as Shipped
                              </Button>
                            )}
                            
                            {order.status === "shipped" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "delivered")}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                Mark as Delivered
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}