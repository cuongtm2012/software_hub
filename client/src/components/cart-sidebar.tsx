import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    seller_id: number;
    status: string;
  };
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartResponse, isLoading } = useQuery<{ cartItems: CartItem[] }>({
    queryKey: ["/api/cart"],
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const cartItems = cartResponse?.cartItems || [];

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/update/${itemId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("DELETE", `/api/cart/remove/${itemId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Remove failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/cart/clear");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Clear failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    clearCartMutation.mutate();
  };

  const handleCheckout = () => {
    // Implementation for checkout process
    toast({
      title: "Checkout",
      description: "Checkout functionality will be implemented soon.",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-96 p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-4 border-b bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Shopping Cart ({totalItems} items)
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-blue-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          {!user ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Please log in to view cart
                </h3>
                <p className="text-gray-500 mb-4">
                  You need to log in to add products to your cart
                </p>
                <Button onClick={() => window.location.href = "/login"}>
                  Log In
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading cart...</p>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  No products in your cart yet
                </p>
                <Button onClick={() => {
                  onClose();
                  window.location.href = "/marketplace";
                }}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex gap-3">
                      <img
                        src={item.product.image_url || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-red-600 font-semibold text-sm mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t bg-gray-50 p-4 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee:</span>
                    <span className="font-medium">{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Balance:</span>
                    <span>0đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-red-600">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  {/* Payment Methods */}
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-8 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Pay with VNPay QR
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-8 bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with QR Banking
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm h-8 bg-pink-600 text-white border-pink-600 hover:bg-pink-700"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Pay with MoMo
                    </Button>
                  </div>
                </div>

                {/* Clear Cart */}
                {cartItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={clearCartMutation.isPending}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CartTrigger() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Fetch cart count
  const { data: cartResponse } = useQuery<{ cartItems: CartItem[] }>({
    queryKey: ["/api/cart"],
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const cartItems = cartResponse?.cartItems || [];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      >
        <ShoppingCart className="w-4 h-4 mr-1" />
        Cart
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {totalItems}
          </Badge>
        )}
      </Button>
      
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}