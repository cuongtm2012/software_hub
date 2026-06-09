import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PaymentForm } from "@/components/payment-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Wallet,
  QrCode,
  ArrowLeft,
  DollarSign,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";

export default function AddFundsPage() {
  const [, navigate] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failure" | "cancel" | null>(null);
  const { toast } = useToast();

  // Check for payment status in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderCode = urlParams.get('order');
    if (status === "success") {
      setPaymentStatus("success");
      toast({
        title: "Thanh toán thành công",
        description: orderCode
          ? `Giao dịch ${orderCode} đã được ghi nhận. Số dư sẽ cập nhật trong giây lát.`
          : "Giao dịch đã được ghi nhận.",
      });
    } else if (status === "failure") {
      setPaymentStatus("failure");
      toast({
        title: "Thanh toán thất bại",
        description: "Không thể xử lý thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } else if (status === "cancel") {
      setPaymentStatus("cancel");
      toast({
        title: "Đã hủy thanh toán",
        description: "Bạn đã hủy giao dịch.",
      });
    }
  }, [toast]);

  const paymentMethods = [
    {
      id: "bank-qr",
      title: "Chuyển khoản QR (VietQR)",
      description: "Quét mã QR chuyển khoản ngân hàng qua payOS",
      icon: QrCode,
      iconBg: "bg-[#004080]/10",
      iconColor: "text-[#004080]",
      fee: "Theo gói payOS",
      popular: true,
    },
    {
      id: "napas-qr",
      title: "QR NAPAS",
      description: "Thanh toán qua mạng lưới NAPAS",
      icon: Building2,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
      fee: "Theo gói payOS",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !amount || parseInt(amount) < 1000) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Chọn phương thức thanh toán và nhập tối thiểu 1.000₫",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the payment initiation API
      const response = await apiRequest("POST", "/api/payment/initiate", {
        amount: parseInt(amount),
        payment_method: selectedMethod,
      });

      const data = await response.json();
      if (data.success) {
        setPaymentInfo(data.payment_info);
        setShowPaymentForm(true);
      } else {
        throw new Error(data.message || "Payment initiation failed");
      }
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

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setPaymentInfo(null);
  };

  // Show payment form if payment info is available
  if (showPaymentForm && paymentInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow pt-16 container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 flex items-center justify-center">
          <PaymentForm paymentInfo={paymentInfo} onCancel={handleCancelPayment} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow pt-16 container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Dashboard
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-[#004080]/10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Nạp tiền vào ví
            </h1>
            <p className="text-sm text-gray-600">
              Thanh toán an toàn qua cổng payOS
            </p>
          </div>
        </div>

        {/* Payment Status Alert */}
        {paymentStatus && (
          <div className="mb-6">
            <Card className={
              paymentStatus === "success"
                ? "border-green-200 bg-green-50"
                : paymentStatus === "cancel"
                  ? "border-amber-200 bg-amber-50"
                  : "border-red-200 bg-red-50"
            }>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {paymentStatus === "success" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      paymentStatus === "success"
                        ? "text-green-800"
                        : paymentStatus === "cancel"
                          ? "text-amber-800"
                          : "text-red-800"
                    }`}>
                      {paymentStatus === "success"
                        ? "Thanh toán thành công!"
                        : paymentStatus === "cancel"
                          ? "Đã hủy thanh toán"
                          : "Thanh toán thất bại"}
                    </h3>
                    <p className={`text-sm ${
                      paymentStatus === "success"
                        ? "text-green-700"
                        : paymentStatus === "cancel"
                          ? "text-amber-700"
                          : "text-red-700"
                    }`}>
                      {paymentStatus === "success"
                        ? "Số dư ví sẽ được cập nhật sau khi payOS xác nhận giao dịch."
                        : paymentStatus === "cancel"
                          ? "Bạn có thể thử lại bất cứ lúc nào."
                          : "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại."}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPaymentStatus(null)}
                    className={
                      paymentStatus === "success"
                        ? "text-green-600 hover:text-green-800"
                        : paymentStatus === "cancel"
                          ? "text-amber-600 hover:text-amber-800"
                          : "text-red-600 hover:text-red-800"
                    }
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Payment Methods */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Phương thức thanh toán (payOS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div key={method.id} className="relative">
                          <Label
                            htmlFor={method.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                          >
                            <RadioGroupItem value={method.id} id={method.id} />

                            <div className={`p-2 rounded-lg ${method.iconBg}`}>
                              <IconComponent
                                className={`h-5 w-5 ${method.iconColor}`}
                              />
                            </div>

                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 text-sm">
                                  {method.title}
                                </h3>
                                {method.popular && (
                                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full font-medium">
                                    Phổ biến
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {method.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Fee: {method.fee}
                              </p>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Amount and Summary */}
          <div className="space-y-4 lg:col-span-2">
            {/* Amount Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  Số tiền
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="amount" className="text-sm">
                    Nhập số tiền (VND)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1000"
                    step="1000"
                    className="text-base"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {["100000", "500000", "1000000"].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount)}
                      className="text-sm"
                    >
                      {parseInt(quickAmount).toLocaleString("vi-VN")}₫
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            {selectedMethod && amount && parseInt(amount) >= 1000 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tóm tắt thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {parseInt(amount).toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium text-xs">
                      {
                        paymentMethods.find((m) => m.id === selectedMethod)
                          ?.title
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">
                      {paymentMethods.find((m) => m.id === selectedMethod)?.fee}
                    </span>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total:</span>
                      <span>{parseInt(amount).toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#004080] hover:bg-[#003366]"
                  >
                    {isProcessing ? "Đang xử lý…" : "Tiếp tục thanh toán"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1 text-sm">
                      Thông tin thanh toán
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Thanh toán qua cổng payOS (sandbox/production)</li>
                      <li>• Số dư cập nhật sau khi IPN xác nhận</li>
                      <li>• Số tiền nạp tối thiểu: 1.000₫</li>
                      <li>• Liên hệ hỗ trợ nếu gặp sự cố</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supported Payment Providers */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Đối tác thanh toán
          </h3>
          <div className="flex items-center justify-center gap-6">
            <div className="text-sm font-semibold text-[#004080]">payOS</div>
            <div className="text-sm text-gray-500">VietQR · NAPAS · Ngân hàng liên kết</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
