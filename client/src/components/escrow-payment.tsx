import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Lock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Order } from "@shared/schema";

interface EscrowPaymentProps {
  order: Order;
  onPaymentComplete: () => void;
}

export function EscrowPayment({ order, onPaymentComplete }: EscrowPaymentProps) {
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/payments", {
        order_id: order.id,
        amount: order.total_amount,
        payment_method: "escrow" // Using escrow as payment method
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: "Your payment has been placed in escrow until you receive and approve the product.",
      });
      setShowPaymentDialog(false);
      
      // Refresh orders
      queryClient.invalidateQueries({
        queryKey: ["/api/orders"],
      });
      
      onPaymentComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Release escrow mutation
  const releaseEscrowMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return apiRequest("POST", `/api/payments/${paymentId}/release-escrow`, {});
    },
    onSuccess: () => {
      toast({
        title: "Escrow released",
        description: "Your payment has been released to the seller. Thank you for your purchase!",
      });
      
      // Refresh orders
      queryClient.invalidateQueries({
        queryKey: ["/api/orders"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to release escrow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReleaseEscrow = (paymentId: number) => {
    releaseEscrowMutation.mutate(paymentId);
  };

  return (
    <>
      {order.status === "pending" && (
        <Card className="border-dashed border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-yellow-500" />
              Payment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Your order is awaiting payment. Once payment is made, the funds will be held in escrow until you confirm receipt.
            </p>
          </CardContent>
          <CardFooter>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button>Make Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Secure Escrow Payment</DialogTitle>
                  <DialogDescription>
                    Your payment will be held in escrow until you confirm receipt of the product.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Order #:</span>
                    <span>{order.id}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Amount:</span>
                    <span className="font-bold">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <Lock className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Your payment is secure. Funds will only be released when you confirm receipt.
                    </span>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaymentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPaymentMutation.mutate()}
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      )}

      {order.status !== "pending" && order.payments && order.payments.map((payment: any) => (
        <Card key={payment.id} className={`${payment.escrow_release ? 'border-green-500' : 'border-blue-500'}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg flex items-center">
                {payment.escrow_release ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Payment Released
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5 text-blue-500" />
                    Payment in Escrow
                  </>
                )}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {payment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="font-bold">${payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Date:</span>
              <span>{new Date(payment.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Method:</span>
              <span className="capitalize">{payment.payment_method}</span>
            </div>
            {!payment.escrow_release && order.status === "delivered" && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-700">
                  You have received your order. Please release the payment from escrow to complete this transaction.
                </p>
              </div>
            )}
          </CardContent>
          {!payment.escrow_release && order.status === "delivered" && (
            <CardFooter>
              <Button 
                onClick={() => handleReleaseEscrow(payment.id)}
                disabled={releaseEscrowMutation.isPending}
                className="w-full"
              >
                {releaseEscrowMutation.isPending ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Release Escrow Payment
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </>
  );
}