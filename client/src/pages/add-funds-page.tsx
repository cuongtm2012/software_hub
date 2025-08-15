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
  CreditCard,
  Smartphone,
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
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | null>(null);
  const { toast } = useToast();

  // Check for payment status in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderCode = urlParams.get('order');
    const token = urlParams.get('token');

    if (status === 'success') {
      setPaymentStatus('success');
      toast({
        title: "Payment Successful!",
        description: `Your payment has been processed successfully. Order: ${orderCode}`,
      });
    } else if (status === 'failure') {
      setPaymentStatus('failure');
      toast({
        title: "Payment Failed",
        description: `Your payment could not be processed. Order: ${orderCode}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const paymentMethods = [
    {
      id: "qr-bank",
      title: "QR Code Bank Transfer",
      description: "Scan QR code for online bank transfer. Fee: 0%",
      icon: QrCode,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      fee: "0%",
      popular: true,
    },
    {
      id: "vnpay-qr",
      title: "VNPAY-QR Payment",
      description:
        "Pay with QR code via Mobile Banking app, transaction fee 2%",
      icon: QrCode,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      fee: "2%",
    },
    {
      id: "atm-balance",
      title: "ATM Card Balance Transfer",
      description: "Fee: 0.9% + $0.50",
      icon: CreditCard,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      fee: "0.9% + $0.50",
    },
    {
      id: "credit-card",
      title: "Credit Card Payment (Master/Visa/JCB)",
      description: "Fee: 2.36% + $1.50",
      icon: CreditCard,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      fee: "2.36% + $1.50",
    },
    {
      id: "mobile-card",
      title: "Mobile Card Top-up",
      description: "Add funds via mobile carrier, transaction fee 30%",
      icon: Smartphone,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      fee: "30%",
    },
    {
      id: "bank-transfer",
      title: "Bank Transfer 24/7",
      description: "Online bank transfer or counter service",
      icon: Building2,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      fee: "Varies by bank",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !amount || parseInt(amount) < 1000) {
      toast({
        title: "Invalid Input",
        description: "Please select a payment method and enter a minimum amount of 1,000₫",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the payment initiation API
      const response = await apiRequest("/api/payment/initiate", {
        method: "POST",
        body: JSON.stringify({
          amount: parseInt(amount),
          payment_method: selectedMethod,
          user_info: {
            buyer_fullname: "Customer", // Will be filled by backend with user data
            buyer_email: "customer@example.com",
            buyer_mobile: "0123456789",
          },
        }),
      });

      if (response.success) {
        setPaymentInfo(response.payment_info);
        setShowPaymentForm(true);
      } else {
        throw new Error(response.message || "Payment initiation failed");
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
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
        <main className="flex-grow container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 flex items-center justify-center">
          <PaymentForm paymentInfo={paymentInfo} onCancel={handleCancelPayment} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Add Funds to Account
            </h1>
            <p className="text-sm text-gray-600">
              Choose from various payment methods available below
            </p>
          </div>
        </div>

        {/* Payment Status Alert */}
        {paymentStatus && (
          <div className="mb-6">
            <Card className={paymentStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {paymentStatus === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`font-medium ${paymentStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                    </h3>
                    <p className={`text-sm ${paymentStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {paymentStatus === 'success' 
                        ? 'Your funds have been added to your account successfully.' 
                        : 'There was an issue processing your payment. Please try again.'}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPaymentStatus(null)}
                    className={paymentStatus === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
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
                  Payment Methods
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
                                    Popular
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
                  Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="amount" className="text-sm">
                    Enter Amount (VND)
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
                  <CardTitle className="text-sm">Payment Summary</CardTitle>
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? "Processing..." : "Proceed to Payment"}
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
                      Payment Information
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Funds available immediately after payment</li>
                      <li>• All transactions secured with SSL encryption</li>
                      <li>• Minimum deposit amount is 1,000₫</li>
                      <li>• Contact support for payment issues</li>
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
            Supported Payment Providers
          </h3>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <div className="text-sm font-medium">MoMo</div>
            <div className="text-sm font-medium text-red-600">VNPAY</div>
            <div className="text-sm font-medium text-blue-600">VISA</div>
            <div className="text-sm font-medium text-orange-600">
              Mastercard
            </div>
            <div className="text-gray-500 text-xs">
              and many other payment methods
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
