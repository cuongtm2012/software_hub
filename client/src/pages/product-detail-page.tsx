import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  Shield,
  Clock,
  Users,
  ShoppingCart,
  CreditCard,
  Eye,
  Tag,
  Download,
  Heart
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/marketplace/products/${id}`],
    enabled: !!id,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/products/${id}/purchase`, {
        quantity, 
        payment_method: "credit_card"
      });
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Purchase Successful!",
        description: `Your order has been completed. Total: ${formatPrice(response.total_amount)}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/products/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase products.",
        variant: "destructive",
      });
      return;
    }
    
    purchaseMutation.mutate();
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Added to Cart",
      description: `${product?.title} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
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
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/marketplace")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/marketplace")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Left Column - Product Image (40%) */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Download className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">{product.title}</p>
                    <p className="text-sm text-gray-500">Digital Product</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Info (60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.9 (494 Reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  Sold: {product.total_sales || 0} units
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Seller:</span>
                <Badge variant="outline" className="text-blue-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Seller
                </Badge>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Online 2 hours ago
                </span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatPrice(parseInt(product.price))}
              </div>
              <div className="text-sm text-gray-600">
                Stock: <span className="font-medium text-green-600">{product.stock_quantity || 1} units</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!user ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">Please log in to purchase this product</p>
                  <Button onClick={() => setLocation("/test-login")} className="w-full">
                    Login / Register
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleAddToCart}
                    variant="outline" 
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={purchaseMutation.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {purchaseMutation.isPending ? "Processing..." : "Buy Now"}
                  </Button>
                </>
              )}
            </div>

            {/* Product Tags */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Product Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {['Digital Product', 'Instant Download', 'Software'].map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Warranty & Support */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Warranty & Support
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• First login warranty: 3 days</li>
                  <li>• 24/7 customer support</li>
                  <li>• Money-back guarantee</li>
                  <li>• Contact shop for support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabbed Content */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews (494)</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsContent value="description" className="mt-0">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {product.description || "High-quality digital product with instant download availability."}
                  </p>
                  <h4 className="font-semibold mb-2">Product Features:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>High-quality digital content</li>
                    <li>Instant download after purchase</li>
                    <li>24/7 customer support</li>
                    <li>Regular updates included</li>
                    <li>Money-back guarantee</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <Button variant="outline" size="sm">Write a Review</Button>
                  </div>
                  
                  {/* Sample Reviews */}
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">U{i}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">User {i}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Great product! Works exactly as described. Highly recommended.</p>
                          <span className="text-xs text-gray-400">2 days ago</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="documentation" className="mt-0">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Product Documentation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Installation Instructions:</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-600">
                      <li>Download the product files after purchase</li>
                      <li>Extract the files to your desired location</li>
                      <li>Follow the included setup guide</li>
                      <li>Contact support if you need assistance</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <Download className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">Related Product {i}</h4>
                    <p className="text-blue-600 font-medium">{formatPrice(50000 * i)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}