import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface AddToCartProps {
  productId: number;
  productName: string;
  price: number;
  stockQuantity: number;
  maxQuantity?: number;
  className?: string;
  variant?: "default" | "compact" | "icon-only";
}

export function AddToCart({
  productId,
  productName,
  price,
  stockQuantity,
  maxQuantity,
  className = "",
  variant = "default"
}: AddToCartProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  // Max quantity is either the stock or provided max, whichever is lower
  const effectiveMaxQuantity = maxQuantity 
    ? Math.min(maxQuantity, stockQuantity) 
    : stockQuantity;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ product_id, quantity }: { product_id: number; quantity: number }) => {
      const response = await apiRequest("POST", "/api/cart/add", {
        product_id,
        quantity
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate cart queries to refresh cart count and contents
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${productName} ${data.action === "updated" ? "updated in" : "added to"} your cart.`,
      });

      // Reset quantity to 1 after successful add
      setQuantity(1);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > effectiveMaxQuantity) {
      setQuantity(effectiveMaxQuantity);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      // Redirect to login
      window.location.href = "/auth";
      return;
    }

    if (stockQuantity < 1) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate({ product_id: productId, quantity });
  };

  // Format price in VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Compact variant for marketplace cards
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || stockQuantity < 1}
          size="sm"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ShoppingCart className="w-3 h-3" />
          )}
          Add
        </Button>
        {stockQuantity < 1 && (
          <Badge variant="destructive" className="text-xs">
            Out of Stock
          </Badge>
        )}
      </div>
    );
  }

  // Icon-only variant for very compact spaces
  if (variant === "icon-only") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending || stockQuantity < 1}
        size="sm"
        variant="outline"
        className={`p-2 ${className}`}
        title={stockQuantity < 1 ? "Out of stock" : "Add to cart"}
      >
        {addToCartMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
      </Button>
    );
  }

  // Default variant for product detail pages
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {stockQuantity > 0 ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {stockQuantity} in stock
          </Badge>
        ) : (
          <Badge variant="destructive">
            Out of stock
          </Badge>
        )}
      </div>

      {/* Quantity Selector */}
      {stockQuantity > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0 rounded-r-none"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={effectiveMaxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 h-10 text-center border-0 rounded-none focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= effectiveMaxQuantity}
                className="h-10 w-10 p-0 rounded-l-none"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              (Max: {effectiveMaxQuantity})
            </span>
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Unit price:</span>
          <span className="font-medium">{formatPrice(price)}</span>
        </div>
        {quantity > 1 && (
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-lg font-bold text-red-600">
              {formatPrice(price * quantity)}
            </span>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending || stockQuantity < 1}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
        size="default"
      >
        {addToCartMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Additional Information */}
      {stockQuantity > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Free shipping on orders over 500,000 VND</p>
          <p>• 30-day return policy</p>
          <p>• Secure payment with buyer protection</p>
        </div>
      )}
    </div>
  );
}