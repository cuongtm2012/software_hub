import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle, QrCode } from "lucide-react";

interface PaymentFormProps {
  paymentInfo: {
    checkout_url: string;
    order_invoice_number: string;
    order_code?: number;
    amount: number;
    payment_method: string;
    qr_code?: string;
    form_fields?: Record<string, string | number>;
  };
  onCancel: () => void;
}

export function PaymentForm({ paymentInfo, onCancel }: PaymentFormProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = paymentInfo.checkout_url;
    }, 1500);

    return () => clearTimeout(timer);
  }, [paymentInfo.checkout_url]);

  const handleContinue = () => {
    window.location.href = paymentInfo.checkout_url;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-[#004080]/10 rounded-full">
          <CreditCard className="w-6 h-6 text-[#004080]" />
        </div>
        <CardTitle className="text-lg font-semibold">
          Chuyển đến cổng thanh toán payOS
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Bạn sẽ được chuyển đến payOS để thanh toán{" "}
          <strong>{paymentInfo.amount.toLocaleString("vi-VN")}₫</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mã đơn:</span>
            <span className="font-medium">{paymentInfo.order_invoice_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-medium">VietQR / Chuyển khoản</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium text-green-600">
              {paymentInfo.amount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {paymentInfo.qr_code && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Mã QR có sẵn trên trang thanh toán payOS sau khi chuyển hướng.</span>
          </div>
        )}

        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Thanh toán an toàn qua payOS</p>
            <p>
              Giao dịch được xử lý bởi payOS (Napas 24/7). Số dư hoặc đơn hàng được cập nhật
              sau khi thanh toán thành công.
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            className="flex-1 bg-[#004080] hover:bg-[#003366]"
          >
            Tiếp tục thanh toán
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Tự động chuyển hướng trong vài giây…
        </p>
      </CardContent>
    </Card>
  );
}
