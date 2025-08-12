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

interface Product {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: string;
  stock_quantity: number;
  features: string[];
  total_sales: number;
  rating: number;
  view_count: number;
  warranty_period?: string;
  processing_time?: string;
  created_at: string;
  updated_at: string;
}

export function ProductDetailEcommerce() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const id = params.id;

  // Validate product ID on mount
  React.useEffect(() => {
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
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
  const [quantity, setQuantity] = useState(1);
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

  // Enhanced product data
  const displayProduct = useMemo(() => {
    if (!product) return null;
    
    const productData = product as Product;
    
    return {
      ...productData,
      title: productData.title || "Perplexity Pro 1 năm - Tài khoản Premium",
      images: productData.images?.length ? productData.images : [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
      ],
      price: productData.price || 995000,
      description: productData.description || `Perplexity Pro là công cụ tìm kiếm AI cực kỳ mạnh mẽ và hữu ích. Với gói Pro, bạn sẽ có:

• Truy cập không giới hạn vào các mô hình AI tiên tiến
• Tìm kiếm thông tin chính xác và cập nhật
• Khả năng phân tích dữ liệu sâu
• Hỗ trợ đa ngôn ngữ
• Không giới hạn số lượng truy vấn

Tài khoản đi kèm với thông tin đăng nhập đầy đủ và hướng dẫn sử dụng chi tiết.`,
      features: productData.features || [
        "Tài khoản Perplexity Pro chính hãng 1 năm",
        "Truy cập không giới hạn tất cả tính năng Pro",
        "Hỗ trợ đa ngôn ngữ bao gồm tiếng Việt",
        "Thời gian phản hồi nhanh",
        "Không giới hạn truy vấn",
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

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > (displayProduct?.stock_quantity || 1)) {
      setQuantity(displayProduct?.stock_quantity || 1);
    } else {
      setQuantity(newQuantity);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Đăng nhập để mua hàng",
        description: "Vui lòng đăng nhập để mua sản phẩm này.",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }
    setIsCheckoutOpen(true);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Đăng nhập để thêm vào giỏ",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }

    if (!displayProduct || displayProduct.stock_quantity < 1) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này hiện tại đã hết hàng.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/cart/add", {
        product_id: displayProduct.id,
        quantity
      });
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${quantity} x ${displayProduct.title} ${data.action === "updated" ? "đã cập nhật trong" : "đã được thêm vào"} giỏ hàng.`,
      });

      // Reset quantity to 1 after successful add
      setQuantity(1);
    } catch (error: any) {
      toast({
        title: "Lỗi thêm vào giỏ hàng",
        description: error.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      });
    }
  };

  // Payment methods
  const paymentMethods = [
    { id: "vnpay_qr", name: "VNPay QR", description: "Quét mã QR để thanh toán", icon: QrCode, color: "bg-blue-600" },
    { id: "qr_banking", name: "QR Banking", description: "Chuyển khoản qua QR", icon: Banknote, color: "bg-green-600" },
    { id: "momo", name: "MoMo", description: "Ví điện tử MoMo", icon: Smartphone, color: "bg-pink-600" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !displayProduct) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sản phẩm bạn tìm kiếm có thể đã được gỡ bỏ hoặc không tồn tại.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => refetch()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </Button>
              <Button 
                onClick={() => navigate("/marketplace")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Về Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = displayProduct.price * quantity;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <button 
              onClick={() => navigate("/")}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Trang chủ
            </button>
            <span>/</span>
            <button 
              onClick={() => navigate("/marketplace")}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Thương hiệu
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">
              {displayProduct?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border">
                <img
                  src={displayProduct.images[selectedImageIndex]}
                  alt={displayProduct.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-2">
                {displayProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 border-2 rounded-md overflow-hidden transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
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

              {/* Social Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Yêu thích
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </Button>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{displayProduct.view_count} lượt xem</span>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {displayProduct.title}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(displayProduct.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {displayProduct.rating}/5 ({displayProduct.total_sales} đánh giá)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Đã bán {displayProduct.total_sales}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {formatPrice(displayProduct.price)}
                </div>
                <div className="text-sm text-gray-500">
                  Giá đã bao gồm VAT
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {displayProduct.stock_quantity > 0 ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Còn {displayProduct.stock_quantity} sản phẩm
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Hết hàng
                  </Badge>
                )}
              </div>

              {/* Quantity Selector */}
              {displayProduct.stock_quantity > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Số lượng</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0 rounded-r-none"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={displayProduct.stock_quantity}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-20 h-10 text-center border-0 rounded-none focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= displayProduct.stock_quantity}
                        className="h-10 w-10 p-0 rounded-l-none"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {displayProduct.stock_quantity} sản phẩm có sẵn
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={displayProduct.stock_quantity === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={displayProduct.stock_quantity === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                  size="lg"
                >
                  Mua ngay
                </Button>
              </div>

              {/* Shipping & Service Info */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Miễn phí vận chuyển</div>
                    <div className="text-sm text-gray-500">Đơn hàng từ 500.000đ</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Bảo hành {displayProduct.warranty_period}</div>
                    <div className="text-sm text-gray-500">Đổi trả trong 30 ngày</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Giao hàng nhanh</div>
                    <div className="text-sm text-gray-500">Trong {displayProduct.processing_time}</div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Seller chuyên nghiệp</div>
                    <div className="text-sm text-gray-500">Online 2 giờ trước</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat ngay
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi điện
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <TabsTrigger value="description" className="px-6 py-3">
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger value="features" className="px-6 py-3">
                  Thông số kỹ thuật
                </TabsTrigger>
                <TabsTrigger value="reviews" className="px-6 py-3">
                  Đánh giá ({displayProduct.total_sales})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold mb-4">Mô tả chi tiết</h3>
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {displayProduct.description}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Tính năng nổi bật</h3>
                  <div className="grid gap-3">
                    {displayProduct.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Đánh giá từ khách hàng</h3>
                  
                  {/* Rating Summary */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-600 mb-2">
                          {displayProduct.rating}/5
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {renderStars(displayProduct.rating)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {displayProduct.total_sales} đánh giá
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          N
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">Nguyễn Văn A</span>
                            <div className="flex items-center">
                              {renderStars(5)}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            Sản phẩm tuyệt vời! Account hoạt động tốt và seller hỗ trợ rất nhiệt tình. Giao hàng nhanh và đúng như mô tả.
                          </p>
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
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Sản phẩm liên quan</h3>
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
                      Sản phẩm tương tự {i}
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
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Thanh toán đơn hàng</DialogTitle>
            <DialogDescription>
              Xem lại đơn hàng và chọn phương thức thanh toán
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
                      Số lượng: {quantity}
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
              <h4 className="font-medium">Tóm tắt đơn hàng</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h4 className="font-medium">Chọn phương thức thanh toán</h4>
              
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="space-y-3">
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Đặt hàng thành công",
                    description: "Đơn hàng của bạn đang được xử lý. Bạn sẽ nhận được email xác nhận sớm.",
                  });
                  setIsCheckoutOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Đặt hàng • {formatPrice(totalAmount)}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
}