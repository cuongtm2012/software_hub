import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, ShoppingCart, Heart, Share2, Check, ChevronLeft, ChevronRight,
  Shield, Zap, RotateCcw, Package, CreditCard, Key, CheckCircle2,
  ThumbsUp, MessageCircle, ChevronDown, User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const [, params] = useRoute("/marketplace/product/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const product = {
    id: 1,
    title: "Premium Software Solution",
    rating: 4.9,
    reviewCount: 2847,
    description: "Our Premium Software Solution delivers cutting-edge functionality with an intuitive interface designed for professionals. Whether you're managing complex projects or streamlining daily tasks, this software provides everything you need to boost productivity and efficiency.",
    images: [
      "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2021/09/gmail-e1682331561418.jpg",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    ],
    originalPrice: 149.99,
    currentPrice: 99.99,
    discount: 33,
    
    packages: [
      { id: "basic", name: "Basic License", price: 49.99 },
      { id: "standard", name: "Standard License", price: 99.99, discount: 20, popular: true },
      { id: "premium", name: "Premium License", price: 199.99, discount: 25 }
    ],

    specifications: {
      version: "6.2.1",
      releaseDate: "December 2024",
      fileSize: "450 MB",
      licenseType: "Commercial",
      platforms: "Windows, macOS, Linux",
      language: "Multi-language"
    },

    features: [
      "Advanced Analytics Dashboard",
      "Real-time Data Synchronization", 
      "Cloud Storage Integration",
      "Multi-platform Support",
      "Advanced Security Features",
      "Automated Backup System",
      "24/7 Technical Support",
      "Regular Updates & Patches"
    ],

    warrantySupport: {
      title: "Warranty & Support Information",
      items: [
        {
          icon: Shield,
          title: "30-Day Money-Back Guarantee",
          description: "If you're not completely satisfied with your purchase, we offer a full refund within 30 days."
        },
        {
          icon: Zap,
          title: "Instant Digital Delivery",
          description: "Receive your license key via email within minutes of purchase."
        },
        {
          icon: RotateCcw,
          title: "Free Lifetime Updates",
          description: "Get all future updates and new features at no additional cost."
        }
      ]
    },

    reviews: [
      {
        id: 1,
        userName: "Sarah Johnson",
        badge: "Verified Purchase",
        date: "December 15, 2024",
        rating: 5,
        title: "Exceeded my expectations!",
        content: "This software has completely transformed how I manage my business. The interface is intuitive, features are powerful, and customer support is excellent.",
        helpful: 145
      },
      {
        id: 2,
        userName: "Michael Chen",
        badge: "Verified Purchase", 
        date: "December 12, 2024",
        rating: 5,
        title: "Worth every penny!",
        content: "We switched from a competitor and couldn't be happier. The onboarding was smooth, and we saw productivity increase by 40%.",
        helpful: 89
      },
      {
        id: 3,
        userName: "Emily Rodriguez",
        badge: "Verified Purchase",
        date: "December 8, 2024", 
        rating: 4,
        title: "Excellent Software!",
        content: "Overall very satisfied with the purchase. The features are excellent and it does everything advertised.",
        helpful: 56
      }
    ],

    faqs: [
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
    ],

    relatedProducts: [
      {
        id: 2,
        name: "Advanced Analytics Module",
        rating: 4.9,
        reviews: 1243,
        originalPrice: 179.99,
        currentPrice: 79.99,
        discount: 55,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
      },
      {
        id: 3,
        name: "Professional Dashboard Suite",
        rating: 4.8,
        reviews: 891,
        originalPrice: 199.99,
        currentPrice: 129.99,
        discount: 35,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
      }
    ]
  };

  const selectedPackageData = product.packages.find(p => p.id === selectedPackage);

  const handlePurchase = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to purchase this product", variant: "destructive" });
      navigate("/auth");
      return;
    }
    toast({ title: "Processing Purchase", description: "Redirecting to secure checkout..." });
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSubmitReview = () => {
    if (!reviewName.trim()) {
      toast({ title: "Name Required", description: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!reviewContent.trim() || reviewContent.length < 10) {
      toast({ title: "Review Required", description: "Please write at least 10 characters", variant: "destructive" });
      return;
    }
    toast({ title: "Review Submitted!", description: "Thank you for your feedback" });
    setReviewName("");
    setReviewRating(5);
    setReviewContent("");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/marketplace")} className="hover:text-blue-600">Software</button>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Badge className="bg-red-500 text-white mb-3">BEST SELLER</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-lg font-semibold">{product.rating}</span>
                  <span className="text-gray-600">({product.reviewCount.toLocaleString()} reviews)</span>
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden group">
                  <img src={product.images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {product.images.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Specifications</h4>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="divide-y divide-gray-200">
                            {Object.entries(product.specifications).map(([key, value], idx) => (
                              <div key={key} className={`flex justify-between items-center px-5 py-3.5 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <span className="text-[#555] text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="text-[#222] text-sm font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "features" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-[#333] text-sm leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "support" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{product.warrantySupport.title}</h3>
                      <div className="space-y-5">
                        {product.warrantySupport.items.map((item, idx) => (
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

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-blue-600">${selectedPackageData?.price.toFixed(2)}</span>
                    <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    <Badge className="bg-green-500">Save {product.discount}%</Badge>
                  </div>
                  <p className="text-sm text-gray-600">One-time payment • Instant access</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Select Package</label>
                  <div className="space-y-2">
                    {product.packages.map((pkg) => (
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

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Email for License Key (Optional)</label>
                  <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
                  <p className="text-xs text-gray-500 mt-1">If left blank, we'll send it to your account email</p>
                </div>

                <div className="space-y-3">
                  <Button onClick={handlePurchase} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold">
                    Buy Now - ${selectedPackageData?.price.toFixed(2)}
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Badge className="bg-orange-500 mb-2">Special Promotion</Badge>
                  <p className="text-sm font-semibold mb-1">Use code: <span className="text-orange-600 font-mono">SAVE20</span></p>
                  <p className="text-xs text-gray-600">for an extra 20% off • Ends in 2 days</p>
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

        {/* Customer Reviews - 2 Column Layout - Optimized Size */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-200 py-4">
            <CardTitle className="text-xl font-bold">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Write Review Form - Compact */}
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
                          <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110">
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

                    <Button onClick={handleSubmitReview} disabled={!reviewName.trim() || !reviewContent.trim() || reviewContent.length < 10} className="w-full bg-[#0052cc] hover:bg-[#0041a3] text-white h-9 text-sm font-semibold rounded-md">
                      Submit Review
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Rating Statistics - Compact */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Overall Rating</h3>
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{product.rating}</div>
                    <StarRating rating={product.rating} size="md" />
                    <p className="text-xs text-gray-600 mt-1">Based on {product.reviewCount.toLocaleString()} reviews</p>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = star === 5 ? 2425 : star === 4 ? 285 : star === 3 ? 85 : star === 2 ? 28 : 24;
                      const percentage = star === 5 ? 85 : star === 4 ? 10 : star === 3 ? 3 : star === 2 ? 1 : 1;
                      
                      return (
                        <div key={star} className="flex items-center gap-2 group">
                          <span className="text-xs font-medium text-gray-700 w-10 flex items-center gap-0.5">
                            {star} <Star className="w-2.5 h-2.5 fill-[#FFC107] text-[#FFC107]" />
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#FFC107] to-[#FFD54F] transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 w-10 text-right">({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Review Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xl font-bold text-green-700">95%</div>
                      <div className="text-xs text-gray-600 mt-0.5">Recommend</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xl font-bold text-blue-700">4.9</div>
                      <div className="text-xs text-gray-600 mt-0.5">Quality</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List - Compact */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.userName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{review.userName}</span>
                          <Badge variant="outline" className="text-xs border-green-500 text-green-700 px-1 py-0">
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                            {review.badge}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.content}</p>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-gray-600 hover:text-blue-600">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-gray-600 hover:text-blue-600">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              {product.faqs.map((faq, idx) => (
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
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Button variant="link" onClick={() => navigate("/marketplace")}>View All →</Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {product.relatedProducts.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <Badge className="bg-red-500 mb-2">-{item.discount}% OFF</Badge>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={item.rating} />
                    <span className="text-sm text-gray-600">({item.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                      <span className="text-xl font-bold text-blue-600">${item.currentPrice}</span>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/marketplace/product/${item.id}`)} className="w-full">View Product</Button>
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
