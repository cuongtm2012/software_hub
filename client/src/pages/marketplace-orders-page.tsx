import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  ShoppingBag,
  ThumbsUp,
  XCircle,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@shared/schema";

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
        icon: <ShoppingBag className="h-4 w-4" />
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

export default function MarketplaceOrdersPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Complete order mutation
  const completeOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest("PATCH", `/api/orders/${orderId}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order completed",
        description: "The order has been marked as completed.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/orders"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review product mutation
  const reviewProductMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder) return;
      
      return apiRequest("POST", `/api/products/${selectedOrder.product_id}/reviews`, {
        rating,
        content: reviewContent
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setReviewContent("");
      setSelectedOrder(null);
      
      // Refresh orders
      queryClient.invalidateQueries({
        queryKey: ["/api/orders"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCompleteOrder = (orderId: number) => {
    completeOrderMutation.mutate(orderId);
  };

  const handleOpenReview = (order: Order) => {
    setSelectedOrder(order);
    setReviewContent("");
    setRating(5);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      toast({
        title: "Review required",
        description: "Please enter a review",
        variant: "destructive",
      });
      return;
    }
    reviewProductMutation.mutate();
  };

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
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {isLoading ? (
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
          <div className="text-center py-12 border rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
            <p className="mt-1 text-gray-500">
              You haven't placed any orders yet.
            </p>
            <Link href="/marketplace">
              <Button className="mt-6">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => {
              const statusDetails = getOrderStatusDetails(order.status);
              
              return (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant="outline" className={`${statusDetails.color} flex items-center gap-1`}>
                          {statusDetails.icon}
                          {statusDetails.label}
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
                          Seller: {order.seller_name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-lg font-bold">${order.total_amount.toFixed(2)}</div>
                        <div className="flex gap-2 mt-2">
                          {(order.status === "delivered") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteOrder(order.id)}
                              disabled={completeOrderMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Confirm Receipt
                            </Button>
                          )}

                          {(order.status === "completed" && !order.has_review) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenReview(order)}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Write Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review {order.product_name}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmitReview}>
                                  <div className="py-4">
                                    <div className="mb-4">
                                      <div className="flex items-center mb-2">
                                        <span className="mr-2">Rating:</span>
                                        <div className="flex">
                                          {Array(5).fill(0).map((_, i) => (
                                            <Star 
                                              key={i}
                                              className={`h-6 w-6 cursor-pointer ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                              onClick={() => setRating(i + 1)}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-4">
                                      <Textarea
                                        placeholder="Share your thoughts about this product..."
                                        value={reviewContent}
                                        onChange={(e) => setReviewContent(e.target.value)}
                                        rows={5}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      type="submit"
                                      disabled={reviewProductMutation.isPending || !reviewContent.trim()}
                                    >
                                      {reviewProductMutation.isPending ? "Submitting..." : "Submit Review"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}

                          {order.has_review && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}