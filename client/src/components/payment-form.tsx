import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  paymentInfo: {
    checkout_url: string;
    form_fields: Record<string, string | number>;
    order_invoice_number: string;
    amount: number;
    payment_method: string;
  };
  onCancel: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản QR (VietQR)",
  NAPAS_BANK_TRANSFER: "QR NAPAS",
};

export function PaymentForm({ paymentInfo, onCancel }: PaymentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      formRef.current?.submit();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  const methodLabel =
    METHOD_LABELS[paymentInfo.payment_method] || paymentInfo.payment_method;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-[#004080]/10 rounded-full">
          <CreditCard className="w-6 h-6 text-[#004080]" />
        </div>
        <CardTitle className="text-lg font-semibold">
          Chuyển đến cổng thanh toán SePay
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Bạn sẽ được chuyển đến SePay để thanh toán{" "}
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
            <span className="font-medium">{methodLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium text-green-600">
              {paymentInfo.amount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Thanh toán an toàn qua SePay</p>
            <p>
              Giao dịch được mã hóa và xử lý bởi SePay. Số dư ví sẽ được cập nhật
              sau khi thanh toán thành công.
            </p>
          </div>
        </div>

        <form ref={formRef} action={paymentInfo.checkout_url} method="POST">
          {Object.entries(paymentInfo.form_fields).map(([field, value]) => (
            <input key={field} type="hidden" name={field} value={String(value)} />
          ))}

          <div className="flex space-x-3 pt-4">
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
              onClick={handleSubmit}
              className="flex-1 bg-[#004080] hover:bg-[#003366]"
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-gray-500">
          Tự động chuyển hướng trong vài giây…
        </p>
      </CardContent>
    </Card>
  );
}
