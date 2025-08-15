import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  paymentInfo: {
    order_code: string;
    amount: number;
    payment_method: string;
    user_info: {
      buyer_fullname: string;
      buyer_email: string;
      buyer_mobile: string;
    };
  };
  onCancel: () => void;
}

export function PaymentForm({ paymentInfo, onCancel }: PaymentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-submit the form when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      formRef.current?.submit();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-lg font-semibold">
          Redirecting to Payment Gateway
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          You will be redirected to NganLuong.vn to complete your payment of{" "}
          <strong>{paymentInfo.amount.toLocaleString("vi-VN")}₫</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order Code:</span>
            <span className="font-medium">{paymentInfo.order_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">{paymentInfo.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-green-600">
              {paymentInfo.amount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Secure Payment</p>
            <p>
              You will be redirected to NganLuong.vn, Vietnam's trusted payment
              gateway. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>

        {/* Hidden form that submits to PHP service */}
        <form
          ref={formRef}
          action="/services/payment-service/index.php"
          method="POST"
          style={{ display: "none" }}
        >
          <input type="hidden" name="nlpayment" value="1" />
          <input type="hidden" name="total_amount" value={paymentInfo.amount} />
          <input
            type="hidden"
            name="option_payment"
            value={paymentInfo.payment_method}
          />
          <input
            type="hidden"
            name="buyer_fullname"
            value={paymentInfo.user_info.buyer_fullname}
          />
          <input
            type="hidden"
            name="buyer_email"
            value={paymentInfo.user_info.buyer_email}
          />
          <input
            type="hidden"
            name="buyer_mobile"
            value={paymentInfo.user_info.buyer_mobile}
          />
          <input type="hidden" name="order_code" value={paymentInfo.order_code} />
        </form>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Continue Payment
          </Button>
        </div>

        {/* Auto redirect message */}
        <p className="text-xs text-center text-gray-500">
          Redirecting automatically in a few seconds...
        </p>
      </CardContent>
    </Card>
  );
}