import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, CreditCard, Wallet, Building2, FileText,
  ArrowLeft, Shield, Package, Mail, Trash2, Plus, Minus,
  ArrowRight
} from "lucide-react";

type PaymentMethod = "momo" | "vnpay" | "bank" | "card";

interface CartItem {
  productId: string;
  packageId: string;
  quantity: number;
  product?: any;
  selectedPackage?: any;
}

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items: cartItems, clearCart } = useCart();

  // Parse URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("product");
  const packageId = searchParams.get("package");
  const stepParam = searchParams.get("step");

  // States
  const [currentStep, setCurrentStep] = useState(parseInt(stepParam || "1"));
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize cart from URL params
  useEffect(() => {
    if (productId && packageId && localCartItems.length === 0) {
      setLocalCartItems([{
        productId,
        packageId,
        quantity: 1
      }]);
    }
  }, [productId, packageId]);

  // Fetch product details for cart items
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/batch', localCartItems.map(item => item.productId)],
    queryFn: async () => {
      const productPromises = localCartItems.map(item =>
        fetch(`/api/products/${item.productId}`).then(res => res.json())
      );
      return Promise.all(productPromises);
    },
    enabled: localCartItems.length > 0
  });

  // Helper function to safely format price
  const formatPrice = (price: any): number => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return (!isNaN(numPrice) && numPrice !== null && numPrice !== undefined) ? numPrice : 0;
  };

  // Get enriched cart items with product data
  const enrichedCartItems = localCartItems.map((item, index) => {
    const product = products?.[index];
    if (!product) return { ...item, product: null, selectedPackage: null };

    const packages = product?.pricing_tiers ? 
      (typeof product.pricing_tiers === 'string' ? JSON.parse(product.pricing_tiers) : product.pricing_tiers) :
      [{ id: "standard", name: "Standard License", price: product?.price || 99.99 }];

    const selectedPackage = packages.find((p: any) => p.id === item.packageId) || packages[0];

    return {
      ...item,
      product,
      selectedPackage
    };
  });

  // Calculate totals
  const subtotal = enrichedCartItems.reduce((sum, item) => {
    if (!item.selectedPackage) return sum;
    return sum + (formatPrice(item.selectedPackage.price) * item.quantity);
  }, 0);

  const momoDiscount = selectedPayment === "momo" ? subtotal * 0.05 : 0;
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const totalDiscount = momoDiscount + couponDiscount;
  const finalPrice = subtotal - totalDiscount;

  // Cart actions
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newCart = [...localCartItems];
    newCart[index].quantity = newQuantity;
    setLocalCartItems(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = localCartItems.filter((_, i) => i !== index);
    setLocalCartItems(newCart);
    if (newCart.length === 0) {
      toast({ title: "Giỏ hàng trống", description: "Vui lòng thêm sản phẩm vào giỏ hàng" });
      navigate("/marketplace");
    }
  };

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      if (code.toUpperCase() === "SAVE5") {
        return { code: "SAVE5", discount: 5, description: "5% discount" };
      }
      throw new Error("Invalid coupon code");
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      toast({ title: "Mã giảm giá đã được áp dụng!", description: `Giảm ${data.discount}%` });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Mã giảm giá không hợp lệ", variant: "destructive" });
    }
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Payment failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Thanh toán thành công!", 
        description: "Đơn hàng của bạn đã được xác nhận"
      });
      clearCart();
      navigate(`/marketplace/order-success/${data.orderId}`);
    },
    onError: () => {
      toast({ 
        title: "Thanh toán thất bại", 
        description: "Vui lòng thử lại hoặc chọn phương thức khác", 
        variant: "destructive" 
      });
      setIsProcessing(false);
    }
  });

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCouponMutation.mutate(couponCode);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate cart
      if (localCartItems.length === 0) {
        toast({ title: "Giỏ hàng trống", description: "Vui lòng thêm sản phẩm", variant: "destructive" });
        return;
      }
      setCurrentStep(2);
      navigate(`/marketplace/checkout?step=2`);
    } else if (currentStep === 2) {
      // Validate email
      if (!email.trim()) {
        toast({ title: "Vui lòng nhập email để nhận License Key", variant: "destructive" });
        return;
      }
      setCurrentStep(3);
      navigate(`/marketplace/checkout?step=3`);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      navigate(`/marketplace/checkout?step=${currentStep - 1}`);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      toast({ title: "Vui lòng chọn phương thức thanh toán", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Vui lòng đồng ý với điều khoản dịch vụ", variant: "destructive" });
      return;
    }

    if (!email.trim()) {
      toast({ title: "Vui lòng nhập email để nhận License Key", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    processPaymentMutation.mutate({
      items: enrichedCartItems.map(item => ({
        productId: item.productId,
        packageId: item.packageId,
        quantity: item.quantity
      })),
      paymentMethod: selectedPayment,
      email: email,
      couponCode: appliedCoupon?.code,
      totalAmount: finalPrice
    });
  };

  const paymentMethods = [
    { 
      id: "momo" as PaymentMethod, 
      name: "Ví MoMo", 
      icon: Wallet, 
      discount: "Giảm thêm 5%",
      color: "text-pink-600"
    },
    { 
      id: "vnpay" as PaymentMethod, 
      name: "VNPay", 
      icon: Wallet,
      color: "text-blue-600"
    },
    { 
      id: "bank" as PaymentMethod, 
      name: "Thẻ ngân hàng", 
      icon: Building2,
      color: "text-green-600"
    },
    { 
      id: "card" as PaymentMethod, 
      name: "Số dư tài khoản", 
      icon: CreditCard,
      color: "text-purple-600"
    }
  ];

  const steps = [
    { number: 1, name: "Giỏ hàng", subtitle: "Kiểm tra sản phẩm", completed: currentStep > 1 },
    { number: 2, name: "Xác nhận", subtitle: "Thông tin đơn hàng", completed: currentStep > 2 },
    { number: 3, name: "Thanh toán", subtitle: "Hoàn tất đơn hàng", completed: false }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (localCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng</p>
          <Button onClick={() => navigate("/marketplace")}>Tiếp tục mua sắm</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step.completed 
                      ? 'bg-blue-600 text-white' 
                      : step.number === currentStep 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? <Check className="w-6 h-6" /> : step.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-semibold text-sm">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.subtitle}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 ${
                    steps[index + 1].completed || steps[index + 1].number <= currentStep
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Giỏ hàng */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Giỏ hàng của bạn ({localCartItems.length} sản phẩm)</h2>
                  <div className="space-y-4">
                    {enrichedCartItems.map((item, index) => {
                      if (!item.product) return null;
                      return (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                            <div className="text-sm text-gray-600 mb-2">{item.selectedPackage?.name}</div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-blue-600">
                              ${(formatPrice(item.selectedPackage?.price) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${formatPrice(item.selectedPackage?.price).toFixed(2)} x {item.quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Tổng quan đơn hàng</h3>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính ({localCartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm):</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Tổng cộng:</span>
                    <span className="font-bold text-2xl text-blue-600">${subtotal.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    Tiếp tục
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={() => navigate("/marketplace")}
                    variant="ghost"
                    className="w-full mt-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tiếp tục mua sắm
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Xác nhận */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Xác nhận thông tin đơn hàng</h2>
                  
                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email nhận License Key <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">License key sẽ được gửi đến email này</p>
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h3 className="font-semibold mb-3">Sản phẩm đã chọn</h3>
                    <div className="space-y-3">
                      {enrichedCartItems.map((item, index) => {
                        if (!item.product) return null;
                        return (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.product.name}</div>
                              <div className="text-xs text-gray-500">{item.selectedPackage?.name}</div>
                              <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                            </div>
                            <div className="font-bold text-blue-600">
                              ${(formatPrice(item.selectedPackage?.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Chi tiết thanh toán</h3>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Tổng thanh toán:</span>
                    <span className="font-bold text-2xl text-blue-600">${subtotal.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    disabled={!email.trim()}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    Tiếp tục thanh toán
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={handlePrevStep}
                    variant="ghost"
                    className="w-full mt-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại giỏ hàng
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Thanh toán */}
        {currentStep === 3 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${method.color}`}>
                            <method.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg">{method.name}</div>
                            {method.discount && (
                              <div className="text-sm text-green-600 font-medium">{method.discount}</div>
                            )}
                          </div>
                          {selectedPayment === method.id && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      Tôi đồng ý với{" "}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        Chính sách bảo mật
                      </a>{" "}
                      của chúng tôi
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Chi tiết thanh toán</h3>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                      🎁 Mã giảm giá (không bắt buộc)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1"
                        disabled={!!appliedCoupon}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || !!appliedCoupon || applyCouponMutation.isPending}
                        variant="outline"
                      >
                        {applyCouponMutation.isPending ? "..." : "Áp dụng"}
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Mã giảm giá đã được áp dụng
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Thử mã: SAVE5</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {momoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá MoMo (5%):</span>
                        <span>-${momoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá ({appliedCoupon.discount}%):</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Tổng thanh toán:</span>
                    <span className="font-bold text-2xl text-blue-600">${finalPrice.toFixed(2)}</span>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={!selectedPayment || !agreedToTerms || !email.trim() || isProcessing}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Xác nhận thanh toán - ${finalPrice.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePrevStep}
                    variant="ghost"
                    className="w-full mt-3"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-pink-50 border-pink-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎁</span>
                    <span className="font-bold text-pink-900">Quà tặng kèm theo</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      "30 ngày hỗ trợ premium miễn phí",
                      "Tài liệu hướng dẫn đầy đủ",
                      "Truy cập cộng đồng người dùng"
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Thanh toán bảo mật • Giao hàng tức thì</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
