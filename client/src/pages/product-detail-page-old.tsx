import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus,
  Star, 
  MessageCircle, 
  Shield, 
  Clock, 
  Check,
  Copy,
  Download,
  Package,
  Users,
  Eye,
  Heart,
  Share2,
  AlertCircle,
  PhoneCall,
  Mail,
  HelpCircle,
  Tag,
  Gift,
  Zap,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  RefreshCcw,
  Award,
  DollarSign,
  CreditCard,
  Wallet,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Support,
  FileText,
  Info,
  MessageSquare,
  StarHalf
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name?: string;
  title: string;
  description: string;
  price: string | number;
  originalPrice?: number;
  category: string;
  seller_id: number;
  seller_name?: string;
  status: "active" | "inactive" | "approved";
  stock_quantity: number;
  image_url?: string;
  images?: string[];
  features?: string[];
  warranty_period?: string;
  created_at: string;
  total_sales?: number;
  sku?: string;
  tags?: string[];
  processing_time?: string;
  refund_policy?: string;
  support_contact?: string;
  price_type?: string;
  featured?: boolean;
  avg_rating?: number;
}

interface Comment {
  id: number;
  user_name: string;
  comment: string;
  rating: number;
  created_at: string;
  is_buyer: boolean;
  support_reply?: string;
  support_reply_date?: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image_url?: string;
  rating: number;
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/marketplace/product/:id");
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [referralLink, setReferralLink] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const productId = params?.id;

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/marketplace/products", productId],
    enabled: !!productId,
  });

  // Fetch product comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/marketplace/products", productId, "reviews"],
    enabled: !!productId,
  });

  // Generate referral link
  useEffect(() => {
    if (user && productId) {
      setReferralLink(`${window.location.origin}/marketplace/product/${productId}?ref=${user.id}`);
    }
  }, [user, productId]);

  // Mock data for demonstration - updated to match marketplace
  const mockProduct: Product = {
    id: parseInt(productId || "4"),
    name: productId === "3" ? "Social Media Marketing Suite" : "Premium Gmail Accounts Package",
    title: productId === "3" ? 
      "Social Media Marketing Suite - Instagram, Facebook, TikTok Auto-posting" : 
      "Premium Gmail Accounts Package - Fresh & Phone Verified",
    description: productId === "3" ? 
      "Complete social media marketing automation suite for Instagram, Facebook, TikTok, and more. Auto-posting, engagement tracking, and analytics all in one powerful tool." :
      "Get access to premium Gmail accounts that are fresh, phone verified, and ready to use for your business needs. Each account comes with full access and warranty.",
    price: productId === "3" ? 89.99 : 25.99,
    originalPrice: productId === "3" ? 149.99 : 45.99,
    category: productId === "3" ? "Marketing Tools" : "Email Accounts",
    seller_id: 1,
    seller_name: productId === "3" ? "MarketingPro" : "TechStore Pro",
    status: "approved",
    stock_quantity: productId === "3" ? 12 : 50,
    image_url: "/api/placeholder/400/300",
    features: productId === "3" ? [
      "Instagram auto-posting and scheduling",
      "Facebook page management",
      "TikTok content automation",
      "Analytics and engagement tracking",
      "Multi-account management",
      "24/7 customer support"
    ] : [
      "Phone verified accounts",
      "Fresh creation (less than 24 hours)",
      "Full access with recovery info",
      "24/7 customer support",
      "Instant delivery",
      "30-day warranty"
    ],
    warranty_period: "30 days",
    created_at: "2024-01-15",
    total_sales: productId === "3" ? 89 : 156,
    sku: productId === "3" ? "SMM-SUITE-001" : "GMAIL-PREM-001",
    tags: productId === "3" ? 
      ["Instagram", "Facebook", "TikTok", "Auto-posting", "Marketing", "Analytics"] :
      ["Gmail", "Verified", "Fresh", "Business"],
    processing_time: "Instant delivery",
    refund_policy: "Full refund within 7 days if product doesn't work as described",
    support_contact: productId === "3" ? "support@marketingpro.com" : "support@techstore.com"
  };

  // Enhanced product data processing
  const displayProduct = product ? {
    ...product,
    name: product.title,
    image_url: product.images?.[0] || "/api/placeholder/400/300",
    images: product.images || ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"],
    seller_name: "Verified Seller",
    warranty_period: "30 days",
    processing_time: "Instant delivery",
    sku: `PROD-${String(product.id).padStart(3, '0')}`,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    originalPrice: typeof product.price === 'string' ? parseFloat(product.price) * 1.4 : (product.price || 0) * 1.4,
    features: [
      "✅ Premium quality guaranteed",
      "⚡ Instant delivery after payment", 
      "🔧 24/7 customer support",
      "🛡️ 30-day warranty included",
      "🔐 Full access provided",
      "💳 Secure payment processing"
    ],
    refund_policy: "Full refund within 7 days if product doesn't work as described",
    support_contact: "support@softwarehub.com",
    tags: product.tags || ["Digital Product", "Instant Access", "Verified"],
    avg_rating: 4.7
  } : mockProduct;

  // Package options with pricing
  const packageOptions = [
    {
      id: "basic",
      name: "Basic Package",
      price: displayProduct.price,
      originalPrice: displayProduct.originalPrice,
      description: "Essential features for getting started",
      features: ["Basic access", "Email support", "30-day warranty"],
      popular: false
    },
    {
      id: "premium",
      name: "Premium Package",
      price: displayProduct.price * 1.5,
      originalPrice: displayProduct.originalPrice ? displayProduct.originalPrice * 1.5 : displayProduct.price * 2,
      description: "Enhanced features with priority support",
      features: ["Full access", "Priority support", "60-day warranty", "Bonus materials"],
      popular: true,
      savings: "Save 25%"
    },
    {
      id: "enterprise",
      name: "Enterprise Package",
      price: displayProduct.price * 2.5,
      originalPrice: displayProduct.originalPrice ? displayProduct.originalPrice * 3 : displayProduct.price * 3.5,
      description: "Complete solution for businesses",
      features: ["Unlimited access", "24/7 dedicated support", "90-day warranty", "Custom integration", "Training included"],
      popular: false,
      savings: "Save 30%"
    }
  ];

  const currentPackage = packageOptions.find(pkg => pkg.id === selectedPackage) || packageOptions[0];
  const totalPrice = currentPackage.price * quantity;

  // Related products mock data
  const relatedProducts: RelatedProduct[] = [
    {
      id: 5,
      name: "Yahoo Mail Accounts",
      price: 19.99,
      originalPrice: 29.99,
      discount: 33,
      rating: 4.7
    },
    {
      id: 6,
      name: "Outlook Premium Bundle",
      price: 34.99,
      originalPrice: 49.99,
      discount: 30,
      rating: 4.8
    },
    {
      id: 7,
      name: "Social Media Combo",
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      rating: 4.9
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How quickly will I receive my accounts?",
      answer: "All accounts are delivered instantly after payment confirmation. You'll receive login details via email within 5 minutes."
    },
    {
      question: "Are these accounts safe to use?",
      answer: "Yes, all accounts are created using legitimate methods and are phone verified. They come with full recovery information."
    },
    {
      question: "What if an account stops working?",
      answer: "We offer a 30-day warranty. If any account stops working within this period, we'll replace it for free."
    },
    {
      question: "Can I use these for business purposes?",
      answer: "Absolutely! These accounts are perfect for business use, marketing campaigns, and professional communications."
    },
    {
      question: "Do you provide support after purchase?",
      answer: "Yes, we offer 24/7 customer support via email and live chat for all our customers."
    }
  ];

  // Subscription options
  const subscriptionOptions = [
    { id: "1-month", label: "1 Month", price: 25.99, popular: false },
    { id: "3-months", label: "3 Months", price: 69.99, popular: true, savings: "Save 10%" },
    { id: "6-months", label: "6 Months", price: 129.99, popular: false, savings: "Save 17%" },
    { id: "1-year", label: "1 Year", price: 199.99, popular: false, savings: "Save 35%" }
  ];

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const response = await fetch(`/api/marketplace/products/${data.productId}/purchase`, {
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
        title: "Purchase Successful!",
        description: "Your order has been placed successfully. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/products"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Comment submission mutation
  const commentMutation = useMutation({
    mutationFn: async (data: { productId: number; comment: string; rating: number }) => {
      const response = await fetch(`/api/marketplace/products/${data.productId}/reviews`, {
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
      setNewComment("");
      setNewRating(5);
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/products", productId, "reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase products.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!productId) return;

    purchaseMutation.mutate({
      productId: parseInt(productId),
      quantity,
    });
  };

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to leave a comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!productId) return;

    commentMutation.mutate({
      productId: parseInt(productId),
      comment: newComment.trim(),
      rating: newRating,
    });
  };

  const calculateDiscount = (original: number, current: number) => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
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
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Out of Stock
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="dark:border-gray-600">SKU: {displayProduct.sku}</Badge>
              <Badge variant="outline" className="dark:border-gray-600">{displayProduct.category}</Badge>
              {displayProduct.avg_rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {displayProduct.avg_rating}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="w-4 h-4" />
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

                  {/* Quality Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#004080] text-white">
                      ✨ Premium Quality
                    </Badge>
                  </div>
                  
                  {/* Zoom Hint */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/75 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Click to enlarge
                    </div>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {displayProduct.images && displayProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {displayProduct.images.slice(0, 4).map((img, index) => (
                      <div 
                        key={index} 
                        className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          selectedImageIndex === index 
                            ? 'border-[#004080] dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img 
                          src={img} 
                          alt={`${displayProduct.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Product Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {displayProduct.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Device Compatibility */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#004080] dark:text-blue-400">
                  <Monitor className="w-5 h-5" />
                  Device Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Monitor className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium dark:text-gray-300">Desktop</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Smartphone className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium dark:text-gray-300">Mobile</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Globe className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium dark:text-gray-300">Web Browser</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="space-y-6">
            {/* Product Information */}
            <Card className="dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{displayProduct.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{displayProduct.description}</p>

                {/* Features List */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#004080]" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {displayProduct.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Purchase */}
            <Card className="border-2 border-[#004080] dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-center text-[#004080] dark:text-blue-400">Choose Your Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Options */}
                <div className="space-y-3">
                  {packageOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPackage === option.id 
                          ? 'border-[#004080] bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${option.popular ? 'relative' : ''}`}
                      onClick={() => setSelectedPackage(option.id)}
                    >
                      {option.popular && (
                        <Badge className="absolute -top-2 left-4 bg-[#004080]">
                          ⭐ Most Popular
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{option.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                          {option.savings && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {option.savings}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#004080] dark:text-blue-400">
                            {formatPrice(option.price)}
                          </div>
                          {option.originalPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(option.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {option.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-900 dark:text-gray-100">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.min(displayProduct.stock_quantity, quantity + 1))}
                      disabled={quantity >= displayProduct.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-3xl font-bold text-[#004080] dark:text-blue-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentPackage.name} × {quantity}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePurchase}
                    disabled={displayProduct.stock_quantity === 0 || purchaseMutation.isPending}
                    className="w-full bg-[#004080] hover:bg-[#003366] dark:bg-blue-600 dark:hover:bg-blue-700 text-white h-12 text-lg"
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

            {/* Product Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#004080]" />
                  Why Choose This Product?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Delivery</h4>
                      <p className="text-sm text-gray-600">Get your product immediately after payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Guaranteed</h4>
                      <p className="text-sm text-gray-600">All products are tested and verified</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <PhoneCall className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Get help whenever you need it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <RefreshCcw className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Money Back Guarantee</h4>
                      <p className="text-sm text-gray-600">{displayProduct.refund_policy}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#004080]" />
                  Device Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Monitor className="w-8 h-8 text-gray-600" />
                    <span className="text-sm font-medium">Desktop</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Smartphone className="w-8 h-8 text-gray-600" />
                    <span className="text-sm font-medium">Mobile</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Globe className="w-8 h-8 text-gray-600" />
                    <span className="text-sm font-medium">Web Browser</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help Section */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#004080] dark:text-blue-400">
                  <Support className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="h-12 text-sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
                <Button variant="outline" className="w-full h-12 text-sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  View FAQ
                </Button>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>Response time: <span className="font-semibold text-green-600">{"< 2 hours"}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#004080] dark:text-blue-400">
                  <Gift className="w-5 h-5" />
                  Share & Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share this product and earn 5% commission on each sale!
                </p>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(referralLink);
                      toast({ title: "Link copied to clipboard!" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
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
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Important Notes:</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <ul className="space-y-2 text-sm">
                        <li>• Processing time: {displayProduct.processing_time}</li>
                        <li>• Warranty period: {displayProduct.warranty_period}</li>
                        <li>• Support contact: {displayProduct.support_contact}</li>
                        <li>• Refund policy: {displayProduct.refund_policy}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#004080]" />
                    Key Features & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayProduct.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="bg-[#004080] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{feature}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            High-quality feature ensuring the best user experience.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activation" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#004080]" />
                    Activation Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                      <div>
                        <h3 className="font-semibold">Download & Setup</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">After purchase, download the product files and follow the setup guide.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                      <div>
                        <h3 className="font-semibold">Activation</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Use the provided license key to activate your product.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                      <div>
                        <h3 className="font-semibold">Support</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contact our support team if you need assistance with activation.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warranty" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#004080]" />
                    Warranty & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Warranty Coverage</h3>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{displayProduct.warranty_period} full warranty coverage</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Free replacement if product stops working</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>24/7 customer support included</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Money-back guarantee within 7 days</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Support Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 border dark:border-gray-600 rounded-lg">
                          <Mail className="w-8 h-8 text-[#004080]" />
                          <div>
                            <p className="font-medium">Email Support</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{displayProduct.support_contact}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border dark:border-gray-600 rounded-lg">
                          <MessageSquare className="w-8 h-8 text-[#004080]" />
                          <div>
                            <p className="font-medium">Live Chat</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faqs" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#004080]" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b dark:border-gray-600 pb-4 last:border-b-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.question}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#004080]" />
                    Customer Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Review Summary */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#004080]">{displayProduct.avg_rating}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(displayProduct.avg_rating || 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comments.length} reviews</div>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="text-sm w-8">{rating}★</span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${Math.random() * 80 + 20}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Form */}
                  {user && (
                    <div className="mb-6 p-4 border dark:border-gray-600 rounded-lg">
                      <h3 className="font-semibold mb-3">Write a Review</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Rating:</label>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <button
                                key={i}
                                onClick={() => setNewRating(i + 1)}
                                className="text-2xl"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    i < newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="Write your review here..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={handleSubmitComment}
                          disabled={commentMutation.isPending || !newComment.trim()}
                        >
                          {commentMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="border-b dark:border-gray-600 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{comment.user_name}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {renderStars(comment.rating)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{comment.comment}</p>
                          {comment.support_reply && (
                            <div className="mt-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-400">Seller Response:</div>
                              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">{comment.support_reply}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#004080]" />
                Related Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <div key={product.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                        <span className="text-xs text-gray-500">({product.rating})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#004080]">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                            {product.discount && (
                              <Badge className="text-xs bg-red-100 text-red-700">
                                -{product.discount}%
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/marketplace/product/${product.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
