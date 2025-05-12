import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ShoppingCart, 
  Tag, 
  Star, 
  Calendar, 
  User, 
  CheckCircle,
  XCircle,
  MessageSquare,
  Truck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product, ProductReview } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

// Define the shipping form schema
const shippingFormSchema = z.object({
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  postal_code: z.string().min(2, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" })
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);
  const [showShippingDialog, setShowShippingDialog] = useState(false);
  
  // Initialize shipping form
  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      address: "",
      city: "",
      postal_code: "",
      country: ""
    }
  });

  // Fetch product details
  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError 
  } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !isNaN(productId),
  });

  // Fetch product reviews
  const { 
    data: reviews = [], 
    isLoading: reviewsLoading 
  } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !isNaN(productId),
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (shippingData: ShippingFormValues) => {
      if (!product) return;
      
      return apiRequest("POST", "/api/orders", { 
        order: {
          total_amount: product.price,
          shipping_info: shippingData
        },
        items: [
          {
            product_id: productId,
            quantity: 1,
            price: product.price
          }
        ]
      });
    },
    onSuccess: () => {
      toast({
        title: "Order created",
        description: "Your order has been placed successfully! Please proceed to payment.",
      });
      setShowShippingDialog(false);
      shippingForm.reset();
      navigate("/marketplace/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Order creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/products/${productId}/reviews`, {
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
      // Refresh reviews
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${productId}/reviews`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${productId}`],
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

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase this product",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (user.role !== "buyer") {
      toast({
        title: "Role required",
        description: "You need to have a buyer role to purchase products",
        variant: "destructive",
      });
      return;
    }
    
    // Open shipping form dialog
    setShowShippingDialog(true);
  };
  
  const handleShippingSubmit = (data: ShippingFormValues) => {
    createOrderMutation.mutate(data);
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
    submitReviewMutation.mutate();
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <Skeleton className="h-20 w-20 rounded-md" />
                <Skeleton className="h-20 w-20 rounded-md" />
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-10 w-1/2 mb-4" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (productError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h1>
          <p className="mb-6">
            {productError ? (productError as Error).message : "Product not found"}
          </p>
          <Button onClick={() => navigate("/marketplace")}>
            Return to Marketplace
          </Button>
        </div>
      </Layout>
    );
  }

  const { name, description, price, category, seller_name, image_url } = product as Product;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden h-64 mb-4">
              {image_url ? (
                <img
                  src={image_url}
                  alt={name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <ShoppingCart className="h-16 w-16 text-gray-400" />
                  <p className="text-gray-500 mt-2">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{name}</h1>
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 mr-1 text-gray-500" />
              <Badge variant="outline">{category}</Badge>
            </div>
            <div className="flex items-center mb-6">
              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
              <span>
                {product.avg_rating ? (
                  <span>{product.avg_rating.toFixed(1)} ({product.review_count} reviews)</span>
                ) : (
                  <span>No reviews yet</span>
                )}
              </span>
            </div>
            <p className="text-gray-700 mb-6">{description}</p>
            <div className="flex items-center mb-6">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>Seller: {seller_name}</span>
            </div>
            <div className="text-2xl font-bold mb-6">${price.toFixed(2)}</div>
            <Button 
              size="lg" 
              onClick={handlePurchase}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <span className="mr-2">Processing</span>
                  <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Purchase Now
                </>
              )}
            </Button>
            
            {/* Shipping Info Dialog */}
            <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Shipping Information</DialogTitle>
                </DialogHeader>
                
                <Form {...shippingForm}>
                  <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={shippingForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shippingForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={shippingForm.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center p-4 border rounded-lg bg-blue-50">
                      <Truck className="h-5 w-5 mr-2 text-blue-500" />
                      <p className="text-sm text-blue-700">
                        Your order will be delivered within 3-5 business days
                      </p>
                    </div>
                    
                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowShippingDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="write-review" disabled={!user || user.role !== "buyer"}>
                Write a Review
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-6">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No reviews yet</h3>
                  <p className="mt-1 text-gray-500">Be the first to review this product</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: ProductReview) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-md font-medium">{review.buyer_name}</CardTitle>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="write-review" className="mt-6">
              {!user ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="mb-4">Please log in to write a review</p>
                      <Button onClick={() => navigate("/auth")}>Log In</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : user.role !== "buyer" ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="mb-4">Only buyers can write reviews</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Write Your Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview}>
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
                      <Button 
                        type="submit"
                        disabled={submitReviewMutation.isPending || !reviewContent.trim()}
                      >
                        {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}