import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentForm } from "@/components/payment-form";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatVnd } from "@/components/dashboard/format";
import {
  ShoppingCart,
  CreditCard,
  MapPin,
  Check,
  ChevronRight,
  Package,
  Shield,
  QrCode,
  Building2,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "bank-qr",
    title: "Chuyển khoản QR (VietQR)",
    description: "Quét mã QR chuyển khoản ngân hàng qua SePay",
    icon: QrCode,
  },
  {
    id: "napas-qr",
    title: "QR NAPAS",
    description: "Thanh toán qua mạng lưới NAPAS",
    icon: Building2,
  },
];

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const total = getTotal();

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "");
      setEmail((prev) => prev || user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !showPaymentForm) {
      navigate("/marketplace");
    }
  }, [items.length, showPaymentForm, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "failure") {
      toast({
        title: "Thanh toán thất bại",
        description: "Không thể xử lý thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } else if (status === "cancel") {
      toast({
        title: "Đã hủy thanh toán",
        description: "Bạn đã hủy giao dịch thanh toán.",
      });
    }
  }, [toast]);

  const steps = [
    { number: 1, title: "Giỏ hàng", icon: ShoppingCart },
    { number: 2, title: "Thông tin", icon: MapPin },
    { number: 3, title: "Thanh toán", icon: CreditCard },
    { number: 4, title: "Xác nhận", icon: Check },
  ];

  const validateStep = (step: number): boolean => {
    if (step === 2) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền họ tên, email và số điện thoại",
          variant: "destructive",
        });
        return false;
      }
    }
    if (step === 3) {
      if (!selectedMethod) {
        toast({
          title: "Chọn phương thức",
          description: "Vui lòng chọn phương thức thanh toán SePay",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/marketplace");
    }
  };

  const handlePay = async () => {
    if (!validateStep(2) || !validateStep(3)) {
      setCurrentStep(!selectedMethod ? 3 : 2);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest("POST", "/api/payment/checkout", {
        items: items.map((item) => ({
          product_id: item.productId,
          package_id: item.packageId,
          quantity: item.quantity,
        })),
        payment_method: selectedMethod,
        buyer_info: { name, email, phone, notes },
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Không thể khởi tạo thanh toán");
      }

      setPaymentInfo(data.payment_info);
      setShowPaymentForm(true);
    } catch (error) {
      toast({
        title: "Lỗi thanh toán",
        description: error instanceof Error ? error.message : "Không thể khởi tạo thanh toán",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductImage = (item: (typeof items)[0]) => {
    const images = item.product.images;
    if (images && images.length > 0) return images[0];
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop";
  };

  if (showPaymentForm && paymentInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow py-8">
          <div className="max-w-2xl mx-auto px-4">
            <PaymentForm
              paymentInfo={paymentInfo}
              onCancel={() => {
                setShowPaymentForm(false);
                navigate("/marketplace/checkout?status=cancel");
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const selectedMethodLabel =
    PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.title || "Chưa chọn";

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate("/marketplace")}
              className="text-[#004080] hover:text-[#003366] font-semibold mb-4 inline-flex items-center gap-2"
            >
              ← Quay lại marketplace
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Thanh toán</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-100">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                              ? "bg-[#004080] text-white"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? "text-slate-800" : isCompleted ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-4 mt-[-20px] ${
                          isCompleted ? "bg-emerald-500" : "bg-slate-100"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Giỏ hàng của bạn</h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.packageId}`}
                          className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <img
                            src={getProductImage(item)}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-slate-900">{item.product.name}</h3>
                            <p className="text-sm text-slate-500 mb-2">{item.selectedPackage.name}</p>
                            <p className="text-xl font-bold text-[#004080]">
                              {formatVnd(item.selectedPackage.price)}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.productId, item.packageId, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.productId, item.packageId, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => removeFromCart(item.productId, item.packageId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right font-bold text-slate-800">
                            {formatVnd(item.selectedPackage.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-[#004080]/5 border border-[#004080]/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-[#004080] mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#004080]">Thanh toán an toàn qua SePay</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Giao dịch được xử lý bởi cổng thanh toán SePay — không lưu thông tin thẻ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin người mua</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Họ và tên *</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0901234567"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Ghi chú đơn hàng</Label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ghi chú thêm (nếu có)"
                          rows={3}
                          className="mt-1.5 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004080]/30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Phương thức thanh toán</h2>
                    <p className="text-sm text-slate-500 mb-6">Thanh toán qua SePay — chuyển khoản QR</p>
                    <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                      <div className="space-y-3">
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = method.icon;
                          return (
                            <label
                              key={method.id}
                              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                                selectedMethod === method.id
                                  ? "border-[#004080] bg-[#004080]/5"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <RadioGroupItem value={method.id} />
                              <div className="p-2 rounded-lg bg-[#004080]/10">
                                <Icon className="w-5 h-5 text-[#004080]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{method.title}</p>
                                <p className="text-sm text-slate-500">{method.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Xác nhận đơn hàng</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-3">Sản phẩm ({items.length})</h3>
                        {items.map((item) => (
                          <div
                            key={`${item.productId}-${item.packageId}`}
                            className="flex justify-between text-sm py-1"
                          >
                            <span>
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              {formatVnd(item.selectedPackage.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-3">Thông tin người mua</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold">Họ tên:</span> {name}
                          </p>
                          <p>
                            <span className="font-semibold">Email:</span> {email}
                          </p>
                          <p>
                            <span className="font-semibold">SĐT:</span> {phone}
                          </p>
                          {notes && (
                            <p>
                              <span className="font-semibold">Ghi chú:</span> {notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Phương thức thanh toán</h3>
                        <p className="text-sm text-slate-600">{selectedMethodLabel}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-semibold">{formatVnd(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí giao hàng</span>
                    <span className="font-semibold text-emerald-600">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-slate-800">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#004080]">{formatVnd(total)}</span>
                </div>

                <div className="space-y-3">
                  {currentStep === 4 ? (
                    <Button
                      onClick={handlePay}
                      disabled={isProcessing}
                      className="w-full bg-[#004080] hover:bg-[#003366] text-white font-semibold"
                      size="lg"
                    >
                      {isProcessing ? "Đang xử lý..." : "Thanh toán qua SePay"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="w-full bg-[#004080] hover:bg-[#003366] text-white font-semibold"
                      size="lg"
                    >
                      Tiếp tục
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}

                  <Button onClick={handleBack} variant="outline" className="w-full font-semibold" size="lg">
                    {currentStep === 1 ? "Quay lại marketplace" : "Quay lại"}
                  </Button>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Thanh toán an toàn qua SePay</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Package className="w-4 h-4" />
                    <span>Nhận sản phẩm ngay sau thanh toán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
