import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  productId: string;
  packageId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    images?: string[];
    price: string | number;
    pricing_tiers?: any;
  };
  selectedPackage: {
    id: string;
    name: string;
    price: number;
    discount?: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: any, packageId: string) => void;
  removeFromCart: (productId: string, packageId: string) => void;
  updateQuantity: (productId: string, packageId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getSavings: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(items));
  }, [items]);

  const formatPrice = (price: any): number => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return (!isNaN(numPrice) && numPrice !== null && numPrice !== undefined) ? numPrice : 0;
  };

  const addToCart = (product: any, packageId: string) => {
    // Parse pricing tiers
    const packages = product?.pricing_tiers ? 
      (typeof product.pricing_tiers === 'string' ? JSON.parse(product.pricing_tiers) : product.pricing_tiers) :
      [{ id: "standard", name: "Standard License", price: formatPrice(product?.price) || 99.99 }];

    const selectedPackage = packages.find((p: any) => p.id === packageId) || packages[0];

    setItems(currentItems => {
      // Check if product with same package already exists
      const existingIndex = currentItems.findIndex(
        item => item.productId === product.id && item.packageId === packageId
      );

      if (existingIndex !== -1) {
        // Increase quantity
        const newItems = [...currentItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        };
        return newItems;
      } else {
        // Add new item
        return [...currentItems, {
          productId: product.id,
          packageId,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            images: product.images,
            price: product.price,
            pricing_tiers: product.pricing_tiers
          },
          selectedPackage: {
            id: selectedPackage.id,
            name: selectedPackage.name,
            price: formatPrice(selectedPackage.price),
            discount: selectedPackage.discount
          }
        }];
      }
    });

    setIsOpen(true); // Open cart sidebar
  };

  const removeFromCart = (productId: string, packageId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => !(item.productId === productId && item.packageId === packageId))
    );
  };

  const updateQuantity = (productId: string, packageId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, packageId);
      return;
    }

    setItems(currentItems => 
      currentItems.map(item =>
        item.productId === productId && item.packageId === packageId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(!isOpen);

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.selectedPackage.price * item.quantity);
    }, 0);
  };

  const getSavings = () => {
    return items.reduce((total, item) => {
      if (item.selectedPackage.discount) {
        const originalPrice = item.selectedPackage.price / (1 - item.selectedPackage.discount / 100);
        const savings = (originalPrice - item.selectedPackage.price) * item.quantity;
        return total + savings;
      }
      return total;
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        getItemCount,
        getSubtotal,
        getSavings,
        getTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
