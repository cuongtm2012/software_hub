import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Download, Mail, Package, 
  ArrowRight, Home, Receipt, Key
} from "lucide-react";

export default function OrderSuccessPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/marketplace/order-success/:orderId");

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', params?.orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${params?.orderId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Order not found');
      return response.json();
    },
    enabled: !!params?.orderId
  });

  // Confetti effect on success
  useEffect(() => {
    if (order) {
      // You can add a confetti library here for celebration effect
      console.log('Order completed successfully!', order);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác nhận đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <div className="text-sm text-gray-600 mb-1">Mã đơn hàng</div>
                <div className="text-2xl font-bold text-gray-900">
                  #{params?.orderId || 'N/A'}
                </div>
              </div>
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                Thành công
              </Badge>
            </div>

            {/* License Key Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    License Key của bạn
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-300 mb-3">
                    <code className="text-lg font-mono text-blue-600 break-all">
                      XXXX-XXXX-XXXX-XXXX-XXXX
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>License key đã được gửi đến email của bạn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin sản phẩm</h3>
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    Premium Software Solution
                  </div>
                  <div className="text-sm text-gray-600">Standard License</div>
                  <div className="text-sm text-gray-500 mt-2">Số lượng: 1</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-blue-600">$99.99</div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">$149.99</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>-$50.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Tổng thanh toán:</span>
                <span className="text-blue-600">$99.99</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Các bước tiếp theo</h3>
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Kiểm tra email",
                  description: "Chúng tôi đã gửi license key và hướng dẫn cài đặt đến email của bạn"
                },
                {
                  icon: Download,
                  title: "Tải xuống phần mềm",
                  description: "Sử dụng link tải xuống trong email hoặc trên trang sản phẩm"
                },
                {
                  icon: Key,
                  title: "Kích hoạt license",
                  description: "Nhập license key để kích hoạt phần mềm và bắt đầu sử dụng"
                }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">🎁 Quà tặng kèm theo</h3>
            <div className="space-y-2 text-sm">
              {[
                "30 ngày hỗ trợ premium miễn phí",
                "Tài liệu hướng dẫn đầy đủ",
                "Truy cập cộng đồng người dùng",
                "Cập nhật miễn phí trong 1 năm"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="w-full h-12"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Xem đơn hàng
          </Button>
          <Button
            onClick={() => navigate("/marketplace")}
            variant="outline"
            className="w-full h-12"
          >
            <Package className="w-5 h-5 mr-2" />
            Tiếp tục mua sắm
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Button>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-8 p-6 bg-white rounded-lg border">
          <p className="text-gray-600 mb-2">
            Cần hỗ trợ? Liên hệ với chúng tôi
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
            <span className="text-gray-400">|</span>
            <a href="tel:+1234567890" className="text-blue-600 hover:underline">
              +1 (234) 567-890
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
