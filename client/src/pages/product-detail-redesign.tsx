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
  CheckCircle
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

  // Parameter validation
  React.useEffect(() => {
    if (!id) {
      toast({
        title: "Sản phẩm không hợp lệ",
        description: "Không tìm thấy ID sản phẩm. Đang chuyển về trang marketplace...",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }

    const productId = parseInt(id);
    if (isNaN(productId) || productId <= 0) {
      toast({
        title: "ID sản phẩm không hợp lệ",
        description: "ID sản phẩm phải là số hợp lệ. Đang chuyển về trang marketplace...",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }
  }, [id, navigate, toast]);

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

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
      title: productData.title || "Perplexity Pro 1 năm - Tài khoản",
      images: productData.images?.length ? productData.images : [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
      ],
      price: productData.price || 995000,
      description: productData.description || `Perplexity Pro là một công cụ AI tìm kiếm thông tin cực kỳ mạnh mẽ và hữu ích. Với gói Pro, bạn sẽ có được:

• Truy cập không giới hạn vào mô hình AI tiên tiến
• Tìm kiếm thông tin chính xác và cập nhật
• Phân tích dữ liệu chuyên sâu
• Hỗ trợ đa ngôn ngữ
• Không có giới hạn về số lượng truy vấn

Tài khoản được cung cấp đầy đủ thông tin đăng nhập và hướng dẫn sử dụng chi tiết.`,
      features: productData.features || [
        "Tài khoản Perplexity Pro chính hãng 1 năm",
        "Truy cập không giới hạn tất cả tính năng Pro",
        "Hỗ trợ đa ngôn ngữ bao gồm tiếng Việt",
        "Tốc độ phản hồi nhanh chóng",
        "Không giới hạn số lượng câu hỏi",
        "Hỗ trợ 24/7 qua chat và email"
      ],
      warranty_period: productData.warranty_period || "12 tháng",
      processing_time: productData.processing_time || "1-5 phút",
      total_sales: productData.total_sales || 1247,
      rating: productData.rating || 4.9,
      view_count: productData.view_count || 15847,
      stock_quantity: productData.stock_quantity || 50
    };
  }, [product]);

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Purchase failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Đặt hàng thành công!", description: "Bạn sẽ nhận được hướng dẫn qua email." });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: "Đặt hàng thất bại", description: "Vui lòng thử lại hoặc liên hệ hỗ trợ.", variant: "destructive" });
    }
  });

  // Handle purchase
  const handlePurchase = () => {
    if (!displayProduct) return;
    
    purchaseMutation.mutate({
      productId: displayProduct.id,
      quantity
    });
  };

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      console.error('Product fetch error:', error);
      if (error?.message?.includes('404')) {
        toast({
          title: "Không tìm thấy sản phẩm",
          description: "Sản phẩm có thể đã bị xóa hoặc không còn khả dụng.",
          variant: "destructive",
        });
        navigate("/marketplace");
      }
    }
  }, [error, toast, navigate]);

  // Handle add to cart
  const handleAddToCart = () => {
    toast({ 
      title: "Đã thêm vào giỏ hàng", 
      description: `${quantity} sản phẩm đã được thêm vào giỏ hàng.` 
    });
  };

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
              <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin sản phẩm...</p>
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
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/marketplace")} variant="default">
                Về trang chủ
              </Button>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
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
              Trang chủ
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate("/marketplace")} className="hover:text-blue-600">
              Sản phẩm
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
                    {displayProduct.view_count.toLocaleString()} lượt xem
                  </div>
                  <div className="text-sm text-gray-500">
                    Đã bán {displayProduct.total_sales}
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
                      Còn hàng
                    </Badge>
                    <span className="text-gray-600">
                      Kho: {displayProduct.stock_quantity} sản phẩm
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Thông tin chính:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Bảo hành: {displayProduct.warranty_period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Giao hàng: {displayProduct.processing_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Tài khoản chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-medium">Số lượng:</span>
                  <div className="flex items-center border rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(displayProduct.stock_quantity, quantity + 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={quantity >= displayProduct.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({displayProduct.stock_quantity} có sẵn)
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handlePurchase}
                    disabled={purchaseMutation.isPending || displayProduct.stock_quantity === 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                    size="lg"
                  >
                    {purchaseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Mua ngay
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 py-3"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>

              {/* Contact and Share */}
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat ngay
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Gọi điện
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Yêu thích
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
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
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger 
                  value="features"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Tính năng
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  Đánh giá
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {displayProduct.description}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tính năng nổi bật</h3>
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
                  <h3 className="text-lg font-semibold mb-4">Đánh giá khách hàng</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-yellow-600">
                      {displayProduct.rating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(displayProduct.rating)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Dựa trên {displayProduct.total_sales} đánh giá
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        N
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Nguyễn Văn A</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã mua hàng
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(5)}
                          <span className="text-sm text-gray-600 ml-2">2 ngày trước</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Sản phẩm rất tốt, tài khoản hoạt động ổn định. Seller hỗ trợ nhiệt tình. Recommend!
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            Hữu ích (12)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        M
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Mai Thị B</span>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã mua hàng
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(4)}
                          <span className="text-sm text-gray-600 ml-2">1 tuần trước</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Chất lượng tốt, giá hợp lý. Giao hàng nhanh. Sẽ mua tiếp ở shop.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            Hữu ích (8)
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
            Sản phẩm liên quan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-155${i}650975-87deedd944c3?w=200&h=200&fit=crop`}
                      alt={`Sản phẩm ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                    ChatGPT Plus {i} năm
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

      <Footer />
    </div>
  );
}