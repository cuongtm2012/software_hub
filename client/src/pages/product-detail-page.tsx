import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, ShoppingCart, Heart, Share2, Check, ChevronLeft, ChevronRight,
  Shield, Zap, RotateCcw, Package, CreditCard, Key, CheckCircle2,
  ThumbsUp, MessageCircle, ChevronDown, User, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const [, params] = useRoute("/marketplace/product/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Review form states
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${params?.id}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
    enabled: !!params?.id
  });

  // Fetch product reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['/api/products', params?.id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${params?.id}/reviews`);
      if (!response.ok) return { reviews: [], stats: null };
      return response.json();
    },
    enabled: !!params?.id
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['/api/products', 'related', product?.category],
    queryFn: async () => {
      const response = await fetch(`/api/products?category=${product?.category}&limit=4`);
      if (!response.ok) return { products: [] };
      const data = await response.json();
      return data.products.filter((p: any) => p.id !== product?.id).slice(0, 4);
    },
    enabled: !!product?.category
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await fetch(`/api/products/${params?.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', params?.id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', params?.id] });
      toast({ title: "Review Submitted!", description: "Thank you for your feedback" });
      setReviewName("");
      setReviewRating(5);
      setReviewContent("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to submit a review", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!reviewContent.trim() || reviewContent.length < 10) {
      toast({ title: "Review Required", description: "Please write at least 10 characters", variant: "destructive" });
      return;
    }
    
    submitReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewContent,
      reviewer_name: reviewName.trim() || user.name
    });
  };

  // Parse product data
  const images = product?.images || [];
  const features = product?.features || [];
  const specs = product?.specifications || {};
  const reviews = reviewsData?.reviews || [];
  const reviewStats = reviewsData?.stats || { averageRating: 0, totalReviews: 0 };

  // Parse packages from JSON
  const packages = product?.pricing_tiers ? 
    (typeof product.pricing_tiers === 'string' ? JSON.parse(product.pricing_tiers) : product.pricing_tiers) :
    [
      { id: "standard", name: "Standard License", price: product?.price || 99.99 }
    ];

  const selectedPackageData = packages.find((p: any) => p.id === selectedPackage) || packages[0];

  const handlePurchase = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to purchase this product", variant: "destructive" });
      navigate("/auth");
      return;
    }
    toast({ title: "Processing Purchase", description: "Redirecting to secure checkout..." });
    // Navigate to checkout page
    navigate(`/marketplace/checkout?product=${params?.id}&package=${selectedPackage}`);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`${sizeClasses[size]} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/marketplace")}>Back to Marketplace</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const faqs = [
    {
      question: "How quickly will I receive my license after purchase?",
      answer: "License keys are delivered instantly to your email after payment confirmation."
    },
    {
      question: "Can I upgrade my license later?",
      answer: "Yes! You can upgrade from Basic to Standard or Premium at any time."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for orders over $500."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/marketplace")} className="hover:text-blue-600">Software</button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {product.status === 'approved' && (
                <Badge className="bg-red-500 text-white mb-3">AVAILABLE</Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewStats.averageRating || 0} size="md" />
                  <span className="text-lg font-semibold">{(reviewStats.averageRating || 0).toFixed(1)}</span>
                  <span className="text-gray-600">({reviewStats.totalReviews || 0} reviews)</span>
                </div>
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon"><Heart className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon"><Share2 className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden group">
                  {images.length > 0 ? (
                    <>
                      <img src={images[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
                      {images.length > 1 && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}>
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.slice(0, 3).map((img: string, idx: number) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Purchase */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How to Purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: Package, title: "Select Package", desc: "Choose your package" },
                    { icon: CreditCard, title: "Secure Payment", desc: "Complete payment" },
                    { icon: Key, title: "Receive License", desc: "Get license key" },
                    { icon: CheckCircle2, title: "Activate", desc: "Start using" }
                  ].map((step, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <step.icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">{idx + 1}</div>
                      <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Details Tabs */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {[
                      { id: "description", label: "Description", icon: "📄" },
                      { id: "features", label: "Features", icon: "✨" },
                      { id: "support", label: "Warranty & Support", icon: "🛡️" }
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-2">
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </span>
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "description" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                        <p className="text-[#333] leading-relaxed text-[15px] mb-6">{product.description}</p>
                      </div>
                      {Object.keys(specs).length > 0 && (
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 mb-4">Specifications</h4>
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="divide-y divide-gray-200">
                              {Object.entries(specs).map(([key, value]: [string, any], idx) => (
                                <div key={key} className={`flex justify-between items-center px-5 py-3.5 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                  <span className="text-[#555] text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span className="text-[#222] text-sm font-semibold">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "features" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                      {features.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          {features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[#333] text-sm leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No features listed yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "support" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Warranty & Support Information</h3>
                      <div className="space-y-5">
                        {[
                          { icon: Shield, title: "30-Day Money-Back Guarantee", description: "If you're not completely satisfied with your purchase, we offer a full refund within 30 days." },
                          { icon: Zap, title: "Instant Digital Delivery", description: "Receive your license key via email within minutes of purchase." },
                          { icon: RotateCcw, title: "Free Lifetime Updates", description: "Get all future updates and new features at no additional cost." }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <item.icon className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#222] mb-2">{item.title}</h4>
                              <p className="text-[#555] text-sm leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-blue-600">${selectedPackageData?.price?.toFixed(2)}</span>
                    {selectedPackageData?.discount && (
                      <>
                        <span className="text-xl text-gray-400 line-through">${(selectedPackageData.price / (1 - selectedPackageData.discount / 100)).toFixed(2)}</span>
                        <Badge className="bg-green-500">Save {selectedPackageData.discount}%</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">One-time payment • Instant access</p>
                </div>

                {packages.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3">Select Package</label>
                    <div className="space-y-2">
                      {packages.map((pkg: any) => (
                        <div key={pkg.id} onClick={() => setSelectedPackage(pkg.id)} className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPackage === pkg.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          {pkg.popular && <Badge className="absolute -top-2 left-4 bg-blue-600">Most Popular</Badge>}
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{pkg.name}</span>
                            <div className="text-right">
                              <div className="font-bold text-lg">${pkg.price}</div>
                              {pkg.discount && <Badge variant="outline" className="text-xs">Save {pkg.discount}%</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Email for License Key (Optional)</label>
                  <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
                  <p className="text-xs text-gray-500 mt-1">If left blank, we'll send it to your account email</p>
                </div>

                <div className="space-y-3">
                  <Button onClick={handlePurchase} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold">
                    Buy Now - ${selectedPackageData?.price?.toFixed(2)}
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  {[
                    { icon: Shield, text: "Secure payment" },
                    { icon: Zap, text: "Instant digital delivery" },
                    { icon: RotateCcw, text: "30-day money-back guarantee" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                      <item.icon className="w-5 h-5 text-green-600" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Reviews */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-200 py-4">
            <CardTitle className="text-xl font-bold">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* ...existing review form code... */}
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Write a Review
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">Share your experience</p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input type="text" placeholder="Enter your name" value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full bg-white h-9 text-sm" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button" 
                            onClick={() => setReviewRating(star)} 
                            onMouseEnter={() => setHoverRating(star)} 
                            onMouseLeave={() => setHoverRating(0)} 
                            className="transition-transform hover:scale-110"
                          >
                            <Star className={`w-6 h-6 ${star <= (hoverRating || reviewRating) ? "fill-[#FFC107] text-[#FFC107]" : "text-gray-300"}`} />
                          </button>
                        ))}
                        <span className="ml-1 text-xs font-medium text-gray-700">{reviewRating} {reviewRating === 1 ? 'star' : 'stars'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Review <span className="text-red-500">*</span>
                      </label>
                      <Textarea placeholder="Tell us about your experience..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} rows={3} className="w-full bg-white resize-none text-sm" />
                      <p className="text-xs text-gray-500 mt-1">Min 10 characters ({reviewContent.length}/10)</p>
                    </div>

                    <Button onClick={handleSubmitReview} disabled={!reviewContent.trim() || reviewContent.length < 10 || submitReviewMutation.isPending} className="w-full bg-[#0052cc] hover:bg-[#0041a3] text-white h-9 text-sm font-semibold rounded-md">
                      {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* ...existing review stats code... */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Overall Rating</h3>
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{(reviewStats.averageRating || 0).toFixed(1)}</div>
                    <StarRating rating={Math.round(reviewStats.averageRating || 0)} size="md" />
                    <p className="text-xs text-gray-600 mt-1">Based on {reviewStats.totalReviews || 0} reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(review.reviewer_name || 'U').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-gray-900">{review.reviewer_name || 'Anonymous'}</span>
                            {review.verified_purchase && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-700 px-1 py-0">
                                <Check className="w-2.5 h-2.5 mr-0.5" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-8 border border-gray-200 shadow-md">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-900">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <button onClick={() => toggleFAQ(idx)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <span className="font-semibold text-[#222] text-[15px] pr-4 leading-relaxed">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFAQ === idx ? 'transform rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedFAQ === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-5 pt-2 bg-[#f9f9f9]">
                      <p className="text-[#555] text-[14px] leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Related Products</h2>
              <Button variant="link" className="text-sm h-auto p-0" onClick={() => navigate("/marketplace")}>View All →</Button>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item: any) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/marketplace/product/${item.id}`)}>
                  <CardContent className="p-3">
                    {item.status === 'approved' && (
                      <Badge className="bg-green-500 text-white mb-2 text-xs px-2 py-0.5">Available</Badge>
                    )}
                    <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">{item.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-blue-600">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <Button className="w-full h-8 text-xs">View Product</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
