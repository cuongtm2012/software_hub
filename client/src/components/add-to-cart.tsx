import React, { useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

interface AddToCartProps {
  productId: number;
  productName: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  maxQuantity?: number;
  className?: string;
  variant?: "default" | "compact" | "icon-only";
}

export function AddToCart({
  productId,
  productName,
  price,
  stockQuantity,
  imageUrl,
  maxQuantity,
  className = "",
  variant = "default",
}: AddToCartProps) {
  const { toast } = useToast();
  const { addToCart, updateQuantity, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const effectiveMaxQuantity = maxQuantity
    ? Math.min(maxQuantity, stockQuantity)
    : stockQuantity;

  const handleAddToCart = () => {
    if (stockQuantity < 1) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm hiện không còn trong kho.",
        variant: "destructive",
      });
      return;
    }

    const product = {
      id: String(productId),
      name: productName,
      price,
      images: imageUrl ? [imageUrl] : [],
    };

    addToCart(product, "standard");
    if (quantity > 1) {
      updateQuantity(String(productId), "standard", quantity);
    }

    toast({
      title: "Đã thêm vào giỏ",
      description: `${quantity} × ${productName}`,
    });
    setQuantity(1);
    openCart();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) setQuantity(1);
    else if (newQuantity > effectiveMaxQuantity) setQuantity(effectiveMaxQuantity);
    else setQuantity(newQuantity);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={handleAddToCart}
          disabled={stockQuantity < 1}
          size="sm"
          className="flex items-center gap-1 bg-[#004080] hover:bg-[#003366] text-white"
        >
          <ShoppingCart className="w-3 h-3" />
          Thêm
        </Button>
        {stockQuantity < 1 && (
          <Badge variant="destructive" className="text-xs">
            Hết hàng
          </Badge>
        )}
      </div>
    );
  }

  if (variant === "icon-only") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={stockQuantity < 1}
        size="sm"
        variant="outline"
        className={`p-2 ${className}`}
        title={stockQuantity < 1 ? "Hết hàng" : "Thêm vào giỏ"}
      >
        <ShoppingCart className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        {stockQuantity > 0 ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Còn {stockQuantity} sản phẩm
          </Badge>
        ) : (
          <Badge variant="destructive">Hết hàng</Badge>
        )}
      </div>

      {stockQuantity > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Số lượng</label>
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
            <span className="text-sm text-gray-500">(Tối đa: {effectiveMaxQuantity})</span>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Đơn giá:</span>
          <span className="font-medium">{formatPrice(price)}</span>
        </div>
        {quantity > 1 && (
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-sm font-medium">Tổng:</span>
            <span className="text-lg font-bold text-[#004080]">
              {formatPrice(price * quantity)}
            </span>
          </div>
        )}
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={stockQuantity < 1}
        className="w-full bg-[#004080] hover:bg-[#003366] text-white py-2.5"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Thêm vào giỏ hàng
      </Button>
    </div>
  );
}
