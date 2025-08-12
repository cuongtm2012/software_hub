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
import { useToast } from "@/hooks/use-toast";
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

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column - Product Images */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 lg:sticky lg:top-8">
              <div className="p-4 lg:p-6">
                {/* Main Image */}
                <div className="mb-4 lg:mb-6">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative group">
                    <img
                      src={displayProduct.images[selectedImageIndex]}
                      alt={displayProduct.title}
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                      onClick={() => window.open(displayProduct.images[selectedImageIndex], '_blank')}
                    />
                    
                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-2 transition-all duration-300">
                        <Eye className="w-6 h-6 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    
                    {/* Image counter */}
                    {displayProduct.images.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        {selectedImageIndex + 1} / {displayProduct.images.length}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Images */}
                {displayProduct.images.length > 1 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Product Gallery
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {displayProduct.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 lg:p-6 xl:p-8">
                
                {/* Product Title and Category */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium px-3 py-1">
                      {displayProduct.category || 'Software'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Premium
                    </Badge>
                  </div>
                  
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                    {displayProduct.title}
                  </h1>
                  
                  {/* Rating and Stats */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(displayProduct.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {displayProduct.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({displayProduct.total_sales} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{displayProduct.view_count.toLocaleString()} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{displayProduct.total_sales} sold</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 lg:p-6 mb-6 border border-red-100 dark:border-red-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 mb-1">
                          {formatPrice(displayProduct.price)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Best price guaranteed
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <Badge 
                          variant="secondary" 
                          className={`${displayProduct.stock_quantity > 0 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                          } px-3 py-1`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {displayProduct.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {displayProduct.stock_quantity} available
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Key Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  What's Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Warranty</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {displayProduct.warranty_period || '1 year'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Delivery</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {displayProduct.processing_time || 'Instant delivery'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Product Type</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Genuine account
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Support</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        24/7 customer support
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="mb-6 lg:mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 lg:p-6 border">
                  <div className="space-y-4">
                    {/* Action Buttons Row - Horizontal Layout */}
                    <div className="flex gap-3">
                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => {
                          if (!user) {
                            toast({
                              title: "Login required",
                              description: "Please log in to add items to your cart.",
                              variant: "destructive",
                            });
                            window.location.href = "/auth";
                            return;
                          }
                          if (displayProduct.stock_quantity < 1) {
                            toast({
                              title: "Out of stock",
                              description: "This product is currently out of stock.",
                              variant: "destructive",
                            });
                            return;
                          }
                          // Add to cart with quantity 1
                          const addToCartMutation = {
                            mutate: async ({ product_id, quantity }: { product_id: number; quantity: number }) => {
                              try {
                                const response = await apiRequest("POST", "/api/cart/add", { product_id, quantity });
                                const data = await response.json();
                                queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
                                toast({
                                  title: "Added to cart",
                                  description: `${quantity} x ${displayProduct.title} ${data.action === "updated" ? "updated in" : "added to"} your cart.`,
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Failed to add to cart",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }
                          };
                          addToCartMutation.mutate({ product_id: displayProduct.id, quantity: 1 });
                        }}
                        disabled={displayProduct.stock_quantity === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                        size="default"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      
                      {/* Buy Now Button */}
                      <Button 
                        onClick={handleBuyNow}
                        disabled={displayProduct.stock_quantity === 0}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        size="default"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now - {formatPrice(displayProduct.price)}
                      </Button>
                    </div>
                    
                    {/* Stock Status and Quantity Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {displayProduct.stock_quantity > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {displayProduct.stock_quantity} in stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Out of stock
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Free shipping • 30-day returns
                      </div>
                    </div>
                    
                    {/* Security Features */}
                    <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 pt-4 text-xs text-gray-600 dark:text-gray-400 border-t">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>Free Shipping</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        <span>30-Day Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact and Share */}
              <div className="border-t pt-4 lg:pt-6">
                <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                    <MessageCircle className="w-4 h-4" />
                    Chat with Seller
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                    <Phone className="w-4 h-4" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                    <Heart className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
                
                {/* Seller Info */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        Professional Seller
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Verified • 98% positive feedback • Fast response
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Product Details Tabs */}
        <div className="mt-8 lg:mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0 rounded-t-xl">
                <TabsTrigger 
                  value="description" 
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 font-medium transition-all duration-200"
                >
                  Product Description
                </TabsTrigger>
                <TabsTrigger 
                  value="features"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 font-medium transition-all duration-200"
                >
                  Features & Specs
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 font-medium transition-all duration-200"
                >
                  Reviews ({displayProduct.total_sales})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-8">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Product Overview
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                    <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                      {displayProduct.description}
                    </div>
                  </div>
                  
                  {/* Additional Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Product Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Category:</span>
                          <span className="font-medium">{displayProduct.category || 'Software'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                          <span className="font-medium">#{displayProduct.id.toString().padStart(6, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                          <span className={`font-medium ${displayProduct.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {displayProduct.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Delivery & Support</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                          <span className="font-medium">{displayProduct.processing_time || 'Instant'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Warranty:</span>
                          <span className="font-medium">{displayProduct.warranty_period || '1 year'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Support:</span>
                          <span className="font-medium">24/7 Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                      Features & Specifications
                    </h3>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {displayProduct.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Technical Specifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Technical Specifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Version:</span>
                          <span className="font-medium">Latest</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                          <span className="font-medium">Cross-platform</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Language:</span>
                          <span className="font-medium">Multi-language</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">License:</span>
                          <span className="font-medium">Commercial</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Updates:</span>
                          <span className="font-medium">Free for 1 year</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Support:</span>
                          <span className="font-medium">24/7 Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-8">
                <div className="space-y-8">
                  {/* Reviews Header */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                      Customer Reviews & Ratings
                    </h3>
                    
                    {/* Rating Summary */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                            {displayProduct.rating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {renderStars(displayProduct.rating)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Based on {displayProduct.total_sales} reviews
                          </div>
                        </div>
                        
                        {/* Rating Breakdown */}
                        <div className="flex-1">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-sm w-8">{star} ★</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full" 
                                    style={{ width: `${Math.max(20, (6 - star) * 20)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                                  {Math.floor(Math.random() * 50 + 10)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Recent Reviews</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            J
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">John Smith</span>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                              <span className="text-xs text-gray-500">2 days ago</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              {renderStars(5)}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excellent</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                              Excellent product! Account works perfectly and seller provides great support. The delivery was instant and everything works exactly as described. Highly recommended for anyone looking for this type of software!
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful (12)</span>
                              </button>
                              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            S
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">Sarah Johnson</span>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                              <span className="text-xs text-gray-500">1 week ago</span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              {renderStars(4)}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Good</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                              Good quality product with reasonable pricing. Fast delivery and responsive customer support. Will consider buying again from this seller in the future.
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful (8)</span>
                              </button>
                              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Load More Reviews */}
                    <div className="text-center pt-4">
                      <Button variant="outline" className="px-8">
                        Load More Reviews
                      </Button>
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