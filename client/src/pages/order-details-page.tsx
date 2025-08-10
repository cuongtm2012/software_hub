import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Star, Package, Clock, Shield, MessageSquare, Plus, Minus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  seller_id: number;
  seller_name?: string;
  status: string;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("6-month");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const productId = params?.id;

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/products", productId, "reviews"],
    enabled: !!productId,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const response = await fetch(`/api/products/${data.productId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: data.quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to purchase product");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "Your order has been placed successfully! You will receive an email with activation instructions.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          product_id: data.productId, 
          quantity: data.quantity 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: { productId: number; comment: string; rating: number }) => {
      const response = await fetch(`/api/products/${data.productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: data.comment, rating: data.rating }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Your review has been posted successfully.",
      });
      setNewReview("");
      setNewRating(5);
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = () => {
    if (!product) return;
    purchaseMutation.mutate({ productId: product.id, quantity });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({ productId: product.id, quantity });
  };

  const handleReviewSubmit = () => {
    if (!product || !newReview.trim()) return;
    reviewMutation.mutate({ 
      productId: product.id, 
      comment: newReview, 
      rating: newRating 
    });
  };

  const variants = [
    { id: "6-month", name: "6 Tháng", price: 99000 },
    { id: "12-month", name: "12 Tháng", price: 179000 },
    { id: "tv-6-month", name: "TV 6 tháng", price: 99000 },
    { id: "tv-12-month", name: "TV 12 tháng", price: 179000 },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
            <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
            <Link to="/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const originalPrice = product.price * 1.5;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 4.5;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/marketplace">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="text-8xl text-gray-400">📦</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={product.status === "approved" ? "default" : "secondary"}>
                  {product.stock_quantity > 0 ? "🟢 In Stock" : "🔴 Out of Stock"}
                </Badge>
                <span className="text-sm text-gray-500">Product Code: {product.id}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating) 
                        ? "text-yellow-500 fill-current" 
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#004080]">
                  ${product.price}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <Badge className="bg-red-100 text-red-800">
                  -{discount}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Category: {product.category}</p>
            </div>

            {/* Variants */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose Duration</Label>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                  max={product.stock_quantity}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {product.stock_quantity} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0 || purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  • You will receive email instructions after purchase
                </p>
                <p className="text-sm text-gray-600">
                  • Processing time: 10-15 minutes
                </p>
                <p className="text-sm text-gray-600">
                  • No refunds for digital products
                </p>
                <p className="text-sm text-gray-600">
                  • Contact support if you need assistance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{product.description}</p>
                    
                    <h4 className="text-md font-semibold mt-6 mb-3">Features Include:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Premium service activation</li>
                      <li>Instant email delivery</li>
                      <li>24/7 customer support</li>
                      <li>Easy activation process</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Product ID</Label>
                      <p className="text-gray-700">{product.id}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Category</Label>
                      <p className="text-gray-700">{product.category}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Stock</Label>
                      <p className="text-gray-700">{product.stock_quantity} units</p>
                    </div>
                    <div>
                      <Label className="font-medium">Seller</Label>
                      <p className="text-gray-700">{product.seller_name || "Store"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warranty" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Warranty Policy</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Duration: 6 months</h4>
                      <p className="text-gray-700 text-sm">
                        Product replacement or refund based on unused time:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mt-2">
                        <li>Under 15 days: 100% refund</li>
                        <li>After 15 days: Refund based on unused time</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Contact Support</h4>
                      <p className="text-gray-700 text-sm">
                        For warranty claims or support, please contact our customer service team.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Add Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 cursor-pointer ${
                              i < newRating 
                                ? "text-yellow-500 fill-current" 
                                : "text-gray-300"
                            }`}
                            onClick={() => setNewRating(i + 1)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Review</Label>
                      <Textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={!newReview.trim() || reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{review.user_name}</span>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating 
                                          ? "text-yellow-500 fill-current" 
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}