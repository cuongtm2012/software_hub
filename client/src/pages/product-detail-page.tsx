import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  Eye, 
  Users,
  Clock,
  Shield,
  Package,
  ChevronRight,
  ChevronLeft,
  Check,
  CreditCard,
  Wallet,
  DollarSign,
  MessageCircle,
  Download,
  Play,
  Pause,
  Volume2,
  Monitor,
  Smartphone,
  Globe,
  Award,
  Zap,
  PhoneCall,
  RefreshCcw,
  Support,
  Mail,
  MessageSquare,
  HelpCircle,
  Gift,
  Copy,
  FileText,
  AlertCircle,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Send
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
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images?: string[];
  category: string;
  seller_id: number;
  stock_quantity: number;
  features?: string[];
  requirements?: string[];
  warranty_period?: string;
  refund_policy?: string;
  processing_time?: string;
  total_sales?: number;
  rating?: number;
  created_at?: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  features: string[];
  duration: string;
  popular?: boolean;
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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // Fetch product data
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    enabled: !!id
  });

  // Mock packages for display
  const packages: Package[] = [
    {
      id: "basic",
      name: "Basic License",
      price: 49.99,
      features: ["Single user license", "Basic support", "1-year updates"],
      duration: "1 Year"
    },
    {
      id: "standard", 
      name: "Standard License",
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      features: ["Up to 5 users", "Priority support", "2-year updates", "Source code included"],
      duration: "2 Years",
      popular: true
    },
    {
      id: "premium",
      name: "Premium License", 
      price: 149.99,
      originalPrice: 199.99,
      discount: 25,
      features: ["Unlimited users", "24/7 premium support", "Lifetime updates", "Full source code", "Commercial license"],
      duration: "Lifetime"
    }
  ];

  // Mock related products
  const relatedProducts = [
    { id: 1, name: "Web Development Toolkit", price: 79.99, rating: 4.8 },
    { id: 2, name: "Mobile App Builder", price: 129.99, originalPrice: 179.99, discount: 28, rating: 4.7 },
    { id: 3, name: "Database Manager Pro", price: 99.99, rating: 4.9 }
  ];

  // Mock review comments
  const reviewComments: ReviewComment[] = [
    {
      id: 1,
      user: "Sarah Johnson",
      avatar: "SJ",
      rating: 5,
      comment: "Excellent product! Easy to use and very effective. The customer support is outstanding.",
      date: "2 days ago",
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      user: "Mike Chen", 
      avatar: "MC",
      rating: 4,
      comment: "Good value for money. Some features could be improved but overall satisfied with the purchase.",
      date: "1 week ago", 
      helpful: 8,
      verified: true
    }
  ];

  const referralLink = `https://softwarehub.com/product/${id}?ref=${product?.seller_id}`;

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number; packageId?: string }) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Purchase failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Purchase successful!", description: "You will receive download instructions via email." });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: "Purchase failed", description: "Please try again or contact support.", variant: "destructive" });
    }
  });

  const displayProduct = useMemo(() => {
    if (!product) return null;
    
    return {
      ...product,
      images: product.images || [],
      features: product.features || ["Digital download", "Instant access", "24/7 support", "Money-back guarantee"],
      requirements: product.requirements || ["Windows 10 or later", "4GB RAM minimum", "1GB free storage"],
      warranty_period: product.warranty_period || "1 year",
      refund_policy: product.refund_policy || "30-day money-back guarantee",
      processing_time: product.processing_time || "Instant delivery",
      total_sales: product.total_sales || Math.floor(Math.random() * 500) + 100,
      rating: product.rating || (4.0 + Math.random() * 1.0)
    };
  }, [product]);

  const totalPrice = selectedPackage ? selectedPackage.price * quantity : (displayProduct?.price || 0) * quantity;

  const handlePurchase = () => {
    if (!displayProduct) return;
    
    purchaseMutation.mutate({
      productId: displayProduct.id,
      quantity,
      packageId: selectedPackage?.id
    });
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

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
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/marketplace")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace")}
          className="mb-6 text-[#004080] hover:text-[#003366] dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-[#004080] dark:hover:text-blue-400">Home</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button onClick={() => navigate("/marketplace")} className="hover:text-[#004080] dark:hover:text-blue-400">Marketplace</button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-gray-100">{displayProduct.title}</span>
        </nav>

        {/* Product Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={displayProduct.stock_quantity > 0 ? "default" : "destructive"} className="flex items-center gap-1">
                {displayProduct.stock_quantity > 0 ? (
                  <>
                    <Check className="w-3 h-3" />
                    In Stock ({displayProduct.stock_quantity} available)
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                SKU: SW-{displayProduct.id.toString().padStart(4, '0')}
              </Badge>
              <div className="flex items-center gap-1">
                {renderStars(displayProduct.rating)}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  ({displayProduct.rating.toFixed(1)})
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{(1000 + displayProduct.id * 100).toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{displayProduct.total_sales || 0} sold</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{displayProduct.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {displayProduct.processing_time}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {displayProduct.warranty_period} warranty
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              Digital delivery
            </span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                {/* Main Product Image */}
                <div className="relative group mb-6">
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
                    {displayProduct.images && displayProduct.images[selectedImageIndex] ? (
                      <img 
                        src={displayProduct.images[selectedImageIndex]} 
                        alt={displayProduct.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        onClick={() => window.open(displayProduct.images[selectedImageIndex], '_blank')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-24 h-24 text-blue-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Image Navigation */}
                  {displayProduct.images && displayProduct.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                        disabled={selectedImageIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedImageIndex(Math.min(displayProduct.images.length - 1, selectedImageIndex + 1))}
                        disabled={selectedImageIndex === displayProduct.images.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {displayProduct.images && displayProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {displayProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-[#004080] ring-2 ring-[#004080]/20' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`${displayProduct.title} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details & Purchase */}
          <div className="space-y-6">
            {/* Pricing Section */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl">Choose Your Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-[#004080] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    } ${pkg.popular ? 'relative' : ''}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-4 bg-[#004080] text-white">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border-2 rounded-full ${
                          selectedPackage?.id === pkg.id ? 'border-[#004080] bg-[#004080]' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedPackage?.id === pkg.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#004080] dark:text-blue-400">
                            {formatPrice(pkg.price)}
                          </span>
                          {pkg.originalPrice && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(pkg.originalPrice)}
                              </span>
                              {pkg.discount && (
                                <Badge variant="destructive" className="text-xs">
                                  -{pkg.discount}%
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{pkg.duration}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(displayProduct.stock_quantity, quantity + 1))}
                      disabled={quantity >= displayProduct.stock_quantity}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({displayProduct.stock_quantity} available)
                  </span>
                </div>

                {/* Purchase Button */}
                <div className="space-y-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#004080] dark:text-blue-400 mb-2">
                      Total: {formatPrice(totalPrice)}
                    </p>
                    {selectedPackage?.originalPrice && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You save {formatPrice((selectedPackage.originalPrice - selectedPackage.price) * quantity)}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handlePurchase}
                    disabled={purchaseMutation.isPending || displayProduct.stock_quantity === 0 || !selectedPackage}
                    className="w-full h-14 text-lg bg-[#004080] hover:bg-[#003366] dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {purchaseMutation.isPending ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Buy Now - {formatPrice(totalPrice)}
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-12">
                      <Heart className="w-5 h-5 mr-2" />
                      Add to Wishlist
                    </Button>
                    <Button variant="outline" className="h-12">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Seller
                    </Button>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                    <Shield className="w-5 h-5" />
                    Secure Purchase Guarantee
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Encrypted payments
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      {displayProduct.warranty_period} warranty
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Instant delivery
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Money-back guarantee
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Secure payment with:</p>
                  <div className="flex justify-center items-center gap-4 text-gray-400">
                    <CreditCard className="w-8 h-8" />
                    <Wallet className="w-8 h-8" />
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="activation">Activation</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#004080]" />
                    Product Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {displayProduct.description}
                  </p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">What's Included:</h3>
                    <ul className="space-y-2">
                      {displayProduct.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayProduct.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {feature}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            High-quality implementation with modern standards
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Reviews Summary */}
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#004080] dark:text-blue-400 mb-2">
                          {displayProduct.rating.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {renderStars(displayProduct.rating)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Based on {reviewComments.length} reviews
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 80 + 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8">
                              {Math.floor(Math.random() * 20)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* Individual Reviews */}
                    <div className="space-y-6">
                      {reviewComments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">{comment.avatar}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {comment.user}
                                </h4>
                                {comment.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(comment.rating)}</div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {comment.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="mt-3 text-gray-700 dark:text-gray-300">
                            {comment.comment}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Helpful ({comment.helpful})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Not helpful
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Write Review */}
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                              className="p-1"
                            >
                              <Star 
                                className={`w-6 h-6 ${
                                  star <= newReview.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300 dark:text-gray-600'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Review</label>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <Button className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Related Products</h2>
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              View All Products
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((related) => (
              <Card key={related.id} className="group hover:shadow-lg transition-all dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{related.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(related.rating)}</div>
                      <span className="text-xs text-gray-500">({related.rating})</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#004080] dark:text-blue-400">{formatPrice(related.price)}</span>
                        {related.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">{formatPrice(related.originalPrice)}</span>
                            <Badge className="text-xs bg-red-100 text-red-700">
                              -{related.discount}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/marketplace/product/${related.id}`)} 
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}