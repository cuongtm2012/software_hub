import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  Eye,
  Users
} from "lucide-react";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Fetch products from API
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/api/marketplace/products", selectedCategory, searchQuery, sortBy],
    select: (data) => data?.products || [],
  });

  // Mock marketplace data for demonstration with Vietnamese pricing
  const products = productsData || [
    {
      id: 1,
      name: "Gmail Accounts (Fresh & Verified)",
      seller: "TechStore Pro",
      seller_verified: true,
      price_min: 150000,
      price_max: 3500000,
      category: "Software",
      rating: 4.8,
      reviews: 24,
      sales: 156,
      image: "/api/placeholder/250/200",
      tags: ["Gmail", "Verified", "Fresh", "Phone Verified"],
      stock: 50,
      views: 1240
    },
    {
      id: 2,
      name: "Advanced Captcha Solver",
      seller: "CaptchaMaster",
      seller_verified: true,
      price_min: 500000,
      price_max: 2000000,
      category: "Captcha Solvers",
      rating: 4.9,
      reviews: 89,
      sales: 234,
      image: "/api/placeholder/250/200",
      tags: ["reCAPTCHA", "hCaptcha", "AI-Powered", "99% Success"],
      stock: 25,
      views: 890
    },
    {
      id: 3,
      name: "Social Media Marketing Suite",
      seller: "MarketingPro",
      seller_verified: true,
      price_min: 1200000,
      price_max: 5000000,
      category: "Marketing Tools",
      rating: 4.7,
      reviews: 156,
      sales: 89,
      image: "/api/placeholder/250/200",
      tags: ["Instagram", "Facebook", "TikTok", "Auto-posting"],
      stock: 12,
      views: 567
    },
    {
      id: 4,
      name: "Crypto Trading Bot Premium",
      seller: "CryptoGuru",
      seller_verified: true,
      price_min: 8000000,
      price_max: 15000000,
      category: "Crypto Tools",
      rating: 4.9,
      reviews: 67,
      sales: 45,
      image: "/api/placeholder/250/200",
      tags: ["Binance", "Bybit", "AI Trading", "24/7 Support"],
      stock: 5,
      views: 1100
    },
    {
      id: 5,
      name: "Premium VPN Accounts",
      seller: "SecureNet",
      seller_verified: false,
      price_min: 200000,
      price_max: 800000,
      category: "Software",
      rating: 4.5,
      reviews: 234,
      sales: 567,
      image: "/api/placeholder/250/200",
      tags: ["NordVPN", "ExpressVPN", "1 Year", "Multi-Device"],
      stock: 100,
      views: 2100
    },
    {
      id: 6,
      name: "YouTube Views & Subscribers",
      seller: "ViewBoost",
      seller_verified: true,
      price_min: 100000,
      price_max: 2500000,
      category: "Marketing Tools",
      rating: 4.3,
      reviews: 445,
      sales: 1200,
      image: "/api/placeholder/250/200",
      tags: ["Real Views", "Safe", "Fast Delivery", "Retention"],
      stock: 999,
      views: 3400
    }
  ];

  const categories = [
    { id: "all", name: "All Products", count: 1250 },
    { id: "software", name: "Software", count: 340 },
    { id: "crypto", name: "Crypto Tools", count: 128 },
    { id: "marketing", name: "Marketing Tools", count: 256 },
    { id: "captcha", name: "Captcha Solvers", count: 89 },
    { id: "others", name: "Others", count: 270 }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const minPrice = priceRange.min ? parseInt(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseInt(priceRange.max) : Infinity;
    const matchesPrice = product.price_min <= maxPrice && product.price_max >= minPrice;
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price_min - b.price_min;
      case "price-high":
        return b.price_max - a.price_max;
      case "newest":
        return b.id - a.id; // Assuming higher ID = newer
      case "popular":
      default:
        return b.views - a.views;
    }
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Marketplace</h1>
            <p className="text-gray-600">Discover premium digital products and services</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-80 space-y-6">
              {/* Search Box */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Categories:</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedCategory === category.id
                            ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>- {category.name}</span>
                          <span className="text-xs text-gray-500">({category.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Price Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Min (VND)"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        placeholder="Max (VND)"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setPriceRange({ min: "", max: "" })}
                    >
                      Clear Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Products:</span>
                      <span className="font-medium">{products.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified Sellers:</span>
                      <span className="font-medium">{products.filter(p => p.seller_verified).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Showing:</span>
                      <span className="font-medium">{sortedProducts.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Tabs */}
              <div className="mb-6">
                <Tabs value={sortBy} onValueChange={setSortBy} className="w-fit">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="popular" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Popular
                    </TabsTrigger>
                    <TabsTrigger value="price-low" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price ↑
                    </TabsTrigger>
                    <TabsTrigger value="price-high" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price ↓
                    </TabsTrigger>
                    <TabsTrigger value="newest" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                        <Package className="h-16 w-16 text-blue-400" />
                      </div>
                      
                      <div className="absolute top-3 right-3 flex gap-1">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.views}
                        </div>
                      </div>
                      
                      {product.seller_verified && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Product Name */}
                        <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Seller Info */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Seller:</span>
                          <span className="text-sm font-medium text-gray-900">{product.seller}</span>
                          {product.seller_verified && (
                            <Shield className="h-3 w-3 text-green-500" />
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-red-600">
                              {formatPrice(product.price_min)} - {formatPrice(product.price_max)}
                            </div>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="text-sm text-gray-600">
                          Stock: <span className="font-medium text-gray-900">{product.stock} units</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {product.rating}★ ({product.reviews} reviews)
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs py-0">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{product.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Buy Button */}
                        <Button className="w-full bg-[#004080] hover:bg-[#003366] text-white">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2">
                <Button variant="outline" size="sm">
                  «
                </Button>
                
                <div className="flex gap-1">
                  {[1, 2, 3, "...", 10].map((page, index) => (
                    <Button
                      key={index}
                      variant={page === 1 ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button variant="outline" size="sm">
                  »
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}