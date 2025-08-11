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
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  seller_id: number;
  seller_name: string;
  status: "active" | "inactive" | "approved";
  stock_quantity: number;
  image_url?: string;
  features?: string[];
  warranty_period?: string;
  created_at: string;
  total_sales?: number;
  sku?: string;
  tags?: string[];
  processing_time?: string;
  refund_policy?: string;
  support_contact?: string;
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
  const [selectedDuration, setSelectedDuration] = useState("1-month");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [referralLink, setReferralLink] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);

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

  // Use mock data if API doesn't return product
  const displayProduct = product || mockProduct;

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

  const calculateDiscount = () => {
    if (!product?.originalPrice || !product?.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace")}
          className="mb-6 text-[#004080] hover:text-[#003366]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-[#004080]">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate("/marketplace")} className="hover:text-[#004080]">Marketplace</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{displayProduct.name}</span>
        </nav>

        {/* Product Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant={displayProduct.stock_quantity > 0 ? "default" : "destructive"} className="flex items-center gap-1">
                {displayProduct.stock_quantity > 0 ? (
                  <>
                    <Check className="w-3 h-3" />
                    In Stock
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Out of Stock
                  </>
                )}
              </Badge>
              <Badge variant="outline">SKU: {displayProduct.sku}</Badge>
              <Badge variant="outline">{displayProduct.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{1000 + displayProduct.id * 100} views</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayProduct.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {displayProduct.total_sales || 0} sold
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {displayProduct.processing_time}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {displayProduct.warranty_period} warranty
            </span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Product Image & Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  {displayProduct.image_url ? (
                    <img 
                      src={displayProduct.image_url} 
                      alt={displayProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-blue-400" />
                  )}
                </div>
                
                {/* Product Tags */}
                <div className="flex flex-wrap gap-2">
                  {displayProduct.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
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
          </div>

          {/* Purchase Panel */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="border-2 border-[#004080]">
              <CardHeader>
                <CardTitle className="text-center">Choose Your Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subscription Options */}
                <div className="space-y-3">
                  {subscriptionOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedDuration === option.id 
                          ? 'border-[#004080] bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${option.popular ? 'relative' : ''}`}
                      onClick={() => setSelectedDuration(option.id)}
                    >
                      {option.popular && (
                        <Badge className="absolute -top-2 left-4 bg-[#004080]">
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{option.label}</div>
                          {option.savings && (
                            <div className="text-sm text-green-600">{option.savings}</div>
                          )}
                        </div>
                        <div className="text-xl font-bold text-[#004080]">
                          ${option.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={displayProduct.stock_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(displayProduct.stock_quantity, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.min(displayProduct.stock_quantity, quantity + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-2xl font-bold text-[#004080]">
                      ${(subscriptionOptions.find(o => o.id === selectedDuration)?.price || displayProduct.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePurchase}
                    disabled={displayProduct.stock_quantity === 0 || purchaseMutation.isPending}
                    className="w-full bg-[#004080] hover:bg-[#003366] text-white h-12 text-lg"
                  >
                    {purchaseMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Buy Now - ${(subscriptionOptions.find(o => o.id === selectedDuration)?.price || displayProduct.price * quantity).toFixed(2)}
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="w-full h-12">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* Payment Methods */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Secure payment with:</p>
                  <div className="flex justify-center gap-2">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                    <Wallet className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#004080]" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Share this product and earn 10% commission on each sale!
                </p>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(referralLink);
                      toast({ title: "Link copied!", description: "Referral link copied to clipboard" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <strong>Processing Time:</strong> {displayProduct.processing_time}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <strong>Warranty:</strong> {displayProduct.warranty_period}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCcw className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <strong>Refund Policy:</strong> {displayProduct.refund_policy}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <strong>Support:</strong> 
                    <a href={`mailto:${displayProduct.support_contact}`} className="text-[#004080] hover:underline ml-1">
                      {displayProduct.support_contact}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-[#004080]" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="w-full">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="activation">Activation</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">{displayProduct.description}</p>
                  <h3 className="text-lg font-semibold mb-2">What You Get:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {displayProduct.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayProduct.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#004080]" />
                  Step-by-Step Activation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Purchase Confirmation</h4>
                      <p className="text-gray-600">After successful payment, you'll receive an email confirmation with your order details.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Receive Activation Details</h4>
                      <p className="text-gray-600">Within 5 minutes, you'll get another email with login credentials and activation instructions.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Follow Instructions</h4>
                      <p className="text-gray-600">Use the provided credentials to access your account(s) following the detailed guide.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-[#004080] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Support Available</h4>
                      <p className="text-gray-600">If you encounter any issues, our 24/7 support team is ready to help.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warranty" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#004080]" />
                  Warranty & Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Warranty Coverage</h3>
                    <p className="text-gray-700 mb-4">
                      This product comes with a {displayProduct.warranty_period} warranty from the date of purchase. 
                      We guarantee that the product will work as described.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Free replacement if product stops working</li>
                      <li>Technical support included</li>
                      <li>No questions asked within warranty period</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Refund Policy</h3>
                    <p className="text-gray-700 mb-4">{displayProduct.refund_policy}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800">Refund Conditions</h4>
                          <p className="text-amber-700 text-sm">
                            Refunds are processed within 2-3 business days. Digital products must be reported 
                            as non-functional within the refund period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#004080]" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                        <span className="bg-[#004080] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                          Q
                        </span>
                        {faq.question}
                      </h4>
                      <p className="text-gray-700 ml-7">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#004080]" />
                    Customer Reviews ({comments.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(4.8)}</div>
                    <span className="text-sm text-gray-600">4.8 out of 5</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                {user && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Leave a Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setNewRating(i + 1)}
                              className="p-1"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  i < newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Share your experience with this product..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={commentMutation.isPending || !newComment.trim()}
                        className="bg-[#004080] hover:bg-[#003366]"
                      >
                        {commentMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{comment.user_name}</span>
                                {comment.is_buyer && (
                                  <Badge variant="outline" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified Buyer
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(comment.rating)}</div>
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.comment}</p>
                        
                        {/* Support Reply */}
                        {comment.support_reply && (
                          <div className="bg-blue-50 border-l-4 border-[#004080] p-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#004080] text-white text-xs">
                                Support Team
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {comment.support_reply_date && new Date(comment.support_reply_date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.support_reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2">No reviews yet</h3>
                      <p className="text-gray-500">Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              View All Products
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((related) => (
              <Card key={related.id} className="group hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{related.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(related.rating)}</div>
                      <span className="text-sm text-gray-500">({related.rating})</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {related.originalPrice && related.originalPrice > related.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${related.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="font-bold text-[#004080]">
                          ${related.price.toFixed(2)}
                        </span>
                      </div>
                      {related.discount && (
                        <Badge variant="destructive" className="text-xs">
                          -{related.discount}%
                        </Badge>
                      )}
                    </div>
                    <Button 
                      onClick={() => navigate(`/marketplace/product/${related.id}`)} 
                      className="w-full bg-[#004080] hover:bg-[#003366]"
                      size="sm"
                    >
                      View Product
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