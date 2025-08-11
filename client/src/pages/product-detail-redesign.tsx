import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  Eye, 
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  ThumbsUp,
  Gift,
  User,
  Calendar,
  Award,
  CheckCircle,
  CreditCard,
  Smartphone,
  QrCode,
  Banknote,
  X
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { AddToCart } from "@/components/add-to-cart";

interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  seller_id: number;
  stock_quantity: number;
  features?: string[];
  warranty_period?: string;
  processing_time?: string;
  total_sales?: number;
  rating?: number;
  view_count?: number;
  status?: string;
  created_at?: string;
}

interface ReviewComment {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export default function ProductDetailRedesign() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Parameter validation
  React.useEffect(() => {
    if (!id) {
      toast({
        title: "Invalid Product",
        description: "Product ID not found. Redirecting to marketplace...",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }

    const productId = parseInt(id);
    if (isNaN(productId) || productId <= 0) {
      toast({
        title: "Invalid Product ID",
        description: "Product ID must be a valid number. Redirecting to marketplace...",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }
  }, [id, navigate, toast]);

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("vnpay_qr");

  // Fetch product data
  const { data: product, isLoading, error, refetch } = useQuery<Product>({
    queryKey: [`/api/marketplace/products/${id}`],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`/api/marketplace/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id && !isNaN(parseInt(id || "")) && parseInt(id || "") > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: Error) => {
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 3;
    },

  });

  // Enhanced product data with Vietnamese content
  const displayProduct = useMemo(() => {
    if (!product) return null;
    
    const productData = product as Product;
    
    return {
      ...productData,
      title: productData.title || "Perplexity Pro 1 Year - Premium Account",
      images: productData.images?.length ? productData.images : [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
      ],
      price: productData.price || 995000,
      description: productData.description || `Perplexity Pro is an incredibly powerful and useful AI-powered search tool. With the Pro plan, you get:

• Unlimited access to advanced AI models
• Accurate and up-to-date information search
• Deep data analysis capabilities
• Multi-language support
• No limits on query count

Account comes with complete login credentials and detailed usage instructions.`,
      features: productData.features || [
        "Genuine Perplexity Pro account for 1 year",
        "Unlimited access to all Pro features",
        "Multi-language support including Vietnamese",
        "Fast response time",
        "No query limits",
        "24/7 support via chat and email"
      ],
      warranty_period: productData.warranty_period || "12 months",
      processing_time: productData.processing_time || "1-5 minutes",
      total_sales: productData.total_sales || 1247,
      rating: productData.rating || 4.9,
      view_count: productData.view_count || 15847,
      stock_quantity: productData.stock_quantity || 50
    };
  }, [product]);

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number; paymentMethod: string }) => {
      const response = await fetch(`/api/products/${data.productId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: data.quantity,
          payment_method: data.paymentMethod
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Purchase failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Order successful!", 
        description: `Order #${data.id} created successfully. You will receive instructions via email.` 
      });
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/products/${id}`] });
      setIsCheckoutOpen(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Order failed", 
        description: error.message || "Please try again or contact support.", 
        variant: "destructive" 
      });
    }
  });

  // Handle purchase
  const handlePurchase = () => {
    if (!displayProduct) return;
    
    purchaseMutation.mutate({
      productId: displayProduct.id,
      quantity: 1,
      paymentMethod: selectedPaymentMethod
    });
  };

  // Handle Buy Now - Open checkout modal
  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  // Calculate total amount (default to 1 for Buy Now)
  const totalAmount = useMemo(() => {
    if (!displayProduct) return 0;
    return displayProduct.price * 1;
  }, [displayProduct]);

  // Payment method options
  const paymentMethods = [
    {
      id: "vnpay_qr",
      name: "VNPay QR Code",
      description: "Pay with VNPay QR",
      icon: QrCode,
      color: "bg-blue-600"
    },
    {
      id: "qr_banking",
      name: "QR Banking",
      description: "Pay with Bank QR",
      icon: CreditCard,
      color: "bg-blue-700"
    },
    {
      id: "momo",
      name: "MoMo Wallet",
      description: "Pay with MoMo",
      icon: Smartphone,
      color: "bg-pink-600"
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer",
      icon: Banknote,
      color: "bg-green-600"
    }
  ];

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      console.error('Product fetch error:', error);
      if (error?.message?.includes('404')) {
        toast({
          title: "Product not found",
          description: "This product may have been removed or is no longer available.",
          variant: "destructive",
        });
        navigate("/marketplace");
      }
    }
  }, [error, toast, navigate]);



  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading product information...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !displayProduct) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/marketplace")} variant="default">
                Back to Marketplace
              </Button>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <button onClick={() => navigate("/")} className="hover:text-blue-600">
              Home
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate("/marketplace")} className="hover:text-blue-600">
              Products
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {displayProduct.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Product Images */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              {/* Main Image */}
              <div className="mb-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={displayProduct.images[selectedImageIndex]}
                    alt={displayProduct.title}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => window.open(displayProduct.images[selectedImageIndex], '_blank')}
                  />
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {displayProduct.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {displayProduct.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index 
                          ? 'border-blue-500' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${displayProduct.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              
              {/* Product Title and Rating */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {displayProduct.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(displayProduct.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      ({displayProduct.rating.toFixed(1)})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Eye className="w-4 h-4 inline mr-1" />
                    {displayProduct.view_count.toLocaleString()} views
                  </div>
                  <div className="text-sm text-gray-500">
                    {displayProduct.total_sales} sold
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl lg:text-4xl font-bold text-red-600 mb-2">
                    {formatPrice(displayProduct.price)}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                    <span className="text-gray-600">
                      Stock: {displayProduct.stock_quantity} available
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Key Information:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Warranty: {displayProduct.warranty_period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Delivery: {displayProduct.processing_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Genuine account</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="mb-8 space-y-4">
                {/* Buy Now Button */}
                <Button 
                  onClick={handleBuyNow}
                  disabled={displayProduct.stock_quantity === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
                
                {/* Add to Cart Component */}
                <AddToCart
                  productId={displayProduct.id}
                  productName={displayProduct.title}
                  price={displayProduct.price}
                  stockQuantity={displayProduct.stock_quantity}
                  variant="default"
                />
              </div>

              {/* Contact and Share */}
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat Now
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Favorite
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="description" 
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Product Description
                </TabsTrigger>
                <TabsTrigger 
                  value="features"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {displayProduct.description}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayProduct.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-yellow-600">
                      {displayProduct.rating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(displayProduct.rating)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {displayProduct.total_sales} reviews
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        J
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">John Smith</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(5)}
                          <span className="text-sm text-gray-600 ml-2">2 days ago</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Excellent product! Account works perfectly and seller provides great support. Highly recommended!
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful (12)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        S
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Sarah Johnson</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(4)}
                          <span className="text-sm text-gray-600 ml-2">1 week ago</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Good quality, reasonable price. Fast delivery. Will buy again from this seller.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful (8)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Related Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-155${i}650975-87deedd944c3?w=200&h=200&fit=crop`}
                      alt={`Product ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                    ChatGPT Plus {i} Year
                  </h4>
                  <div className="text-red-600 font-bold text-lg">
                    {formatPrice(500000 + i * 100000)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(4 + Math.random())}
                    <span className="text-xs text-gray-600 ml-1">
                      ({(100 + i * 50)})
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Checkout - Order Summary
            </DialogTitle>
            <DialogDescription>
              Review your order and select payment method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Summary */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img
                    src={displayProduct?.images[0]}
                    alt={displayProduct?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {displayProduct?.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: 1
                    </div>
                    <div className="font-medium text-red-600">
                      {formatPrice(displayProduct?.price || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Order Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing fee</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Select Payment Method</h4>
              
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={method.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label 
                          htmlFor={method.id} 
                          className="flex items-center gap-3 flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{method.description}</div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 dark:text-blue-100">Secure Payment</div>
                  <div className="text-blue-700 dark:text-blue-200 mt-1">
                    Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsCheckoutOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {purchaseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Purchase {formatPrice(totalAmount)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}