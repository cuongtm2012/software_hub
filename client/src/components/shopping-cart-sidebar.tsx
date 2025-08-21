import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Plus, Minus, Trash2, 
  Shield, Package, ArrowRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ShoppingCartSidebar() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getItemCount,
    getSubtotal,
    getSavings,
    getTotal
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({ 
        title: "Giỏ hàng trống", 
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
        variant: "destructive"
      });
      return;
    }

    // Navigate to checkout page with cart data
    const params = new URLSearchParams();
    params.set('step', '1');
    
    // Add first item to URL (for backward compatibility)
    if (items.length > 0) {
      params.set('product', items[0].productId);
      params.set('package', items[0].packageId);
    }
    
    closeCart();
    navigate(`/marketplace/checkout?${params.toString()}`);
  };

  const handleContinueShopping = () => {
    closeCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">
              Giỏ hàng ({getItemCount()} sản phẩm)
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 mb-6">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
              </p>
              <Button onClick={handleContinueShopping} className="bg-blue-600 hover:bg-blue-700">
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.packageId}`}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {item.selectedPackage.name}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.packageId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.packageId, item.quantity + 1)}
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId, item.packageId)}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        <span className="text-xs">Xóa</span>
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-blue-600">
                      ${(item.selectedPackage.price * item.quantity).toFixed(2)}
                    </div>
                    {item.selectedPackage.discount && (
                      <div className="text-xs text-gray-500 line-through">
                        ${((item.selectedPackage.price / (1 - item.selectedPackage.discount / 100)) * item.quantity).toFixed(2)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      ${item.selectedPackage.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary and Actions */}
        {items.length > 0 && (
          <div className="border-t bg-white p-6 space-y-4">
            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">${getSubtotal().toFixed(2)}</span>
              </div>

              {getSavings() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Tiết kiệm:</span>
                  <span className="font-medium">-${getSavings().toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Thanh toán
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={handleContinueShopping}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                Tiếp tục mua sắm
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
              <Shield className="w-4 h-4" />
              <span>Thanh toán bảo mật • Giao hàng tức thì</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
