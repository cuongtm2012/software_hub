import React from "react";
import { useLocation } from "wouter";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Shield,
  ArrowRight,
  Package,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function getItemImage(item: { product: { images?: string[] } }) {
  const images = item.product.images;
  if (!images?.length) return null;
  const first = images[0];
  return typeof first === "string" ? first : null;
}

/** Global cart sheet — single source via useCart (localStorage). */
export function GlobalCartSidebar() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getSubtotal,
  } = useCart();

  const subtotal = getSubtotal();
  const totalItems = getItemCount();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm trước khi thanh toán.",
        variant: "destructive",
      });
      return;
    }
    closeCart();
    navigate("/marketplace/checkout");
  };

  const goTo = (path: string) => {
    closeCart();
    navigate(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        className={cn(
          "flex w-full flex-col gap-0 border-l border-[#004080]/10 p-0 sm:max-w-md",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:bg-white/15 [&>button]:hover:opacity-100",
        )}
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-white/10 bg-gradient-to-r from-[#004080] to-[#003366] px-5 py-4 pr-14 text-left">
          <SheetTitle className="flex items-center gap-2.5 text-base font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <ShoppingCart className="h-5 w-5 text-[#ffcc00]" />
            </span>
            <span>
              Giỏ hàng
              <span className="mt-0.5 block text-xs font-normal text-slate-200">
                {totalItems} sản phẩm
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#004080]/10 to-[#ffcc00]/15 ring-4 ring-[#004080]/5">
              <ShoppingCart className="h-11 w-11 text-[#004080]/70" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Giỏ hàng trống</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              Khám phá marketplace và thêm sản phẩm số, công cụ hoặc phần mềm vào giỏ hàng.
            </p>
            <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
              <Button
                className="w-full bg-[#004080] font-semibold hover:bg-[#003366]"
                onClick={() => goTo("/marketplace")}
              >
                <Store className="mr-2 h-4 w-4" />
                Khám phá Marketplace
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#004080]/20 text-[#004080] hover:bg-[#004080]/5"
                onClick={() => goTo("/software")}
              >
                Xem phần mềm miễn phí
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f9f9f9] p-4">
              {items.map((item) => {
                const imageUrl = getItemImage(item);
                const unitPrice = item.selectedPackage.price;
                return (
                  <div
                    key={`${item.productId}-${item.packageId}`}
                    className="rounded-xl border border-[#004080]/10 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-7 w-7 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {item.product.name}
                        </h4>
                        {item.selectedPackage.name !== "Standard License" && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.selectedPackage.name}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-bold text-[#004080]">
                          {formatPrice(unitPrice)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                updateQuantity(item.productId, item.packageId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                updateQuantity(item.productId, item.packageId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.productId, item.packageId)}
                            className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end border-t border-gray-100 pt-2 text-sm font-semibold text-gray-700">
                      {formatPrice(unitPrice * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 space-y-4 border-t bg-white p-4">
              <div className="space-y-2 rounded-xl bg-[#004080]/5 p-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between border-t border-[#004080]/10 pt-2 text-base font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-[#004080]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Button
                className="h-11 w-full bg-[#004080] text-base font-semibold hover:bg-[#003366]"
                onClick={handleCheckout}
              >
                Thanh toán
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#004080]/20"
                onClick={() => goTo("/marketplace")}
              >
                Tiếp tục mua sắm
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  toast({
                    title: "Đã xóa giỏ hàng",
                    description: "Tất cả sản phẩm đã được gỡ khỏi giỏ.",
                  });
                }}
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Xóa tất cả
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                <span>Thanh toán bảo mật qua payOS</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CartTrigger() {
  const { getItemCount, openCart } = useCart();
  const totalItems = getItemCount();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openCart}
      className="relative text-slate-200 hover:bg-slate-700 hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="sr-only">Giỏ hàng</span>
      {totalItems > 0 && (
        <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffcc00] p-0 px-1 text-xs font-bold text-slate-900 hover:bg-[#ffcc00]">
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}
