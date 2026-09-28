import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CartItem, Product, SubstitutionPreference } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  totalItemCount: number;
  itemTotalAmount: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
  savings: number;
  deliveryNotes: string;
  setDeliveryNotes: (notes: string) => void;
  substitutionPreference: SubstitutionPreference;
  setSubstitutionPreference: (pref: SubstitutionPreference) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial popular starter items with real inventory stock indicators
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'prod-1',
    name: 'Amul Taaza Toned Fresh Milk',
    price: 27,
    unit: '500 ml pouch',
    emoji: '🥛',
    category: 'Dairy',
    quantity: 2,
    mrp: 30,
    stock: 12,
    lowStockThreshold: 4,
  },
  {
    id: 'prod-2',
    name: 'Britannia 100% Whole Wheat Bread',
    price: 45,
    unit: '400 g pack',
    emoji: '🍞',
    category: 'Bakery',
    quantity: 1,
    mrp: 50,
    stock: 2,
    lowStockThreshold: 3,
  },
  {
    id: 'prod-3',
    name: "Lay's India's Magic Masala Chips",
    price: 20,
    unit: '50 g pouch',
    emoji: '🥔',
    category: 'Snacks',
    quantity: 2,
    mrp: 20,
    stock: 15,
    lowStockThreshold: 5,
  },
];

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Leave at door');
  const [substitutionPreference, setSubstitutionPreference] = useState<SubstitutionPreference>('similar');

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          return prev; // capped at stock
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock !== undefined && product.stock <= 0) {
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const cappedQty = item.stock !== undefined ? Math.min(quantity, item.stock) : quantity;
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const getItemQuantity = (productId: string): number => {
    const found = cartItems.find((item) => item.id === productId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const itemTotalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const deliveryFee = 0; // Quick commerce free tier
  const platformFee = itemTotalAmount > 0 ? 2 : 0;
  const grandTotal = itemTotalAmount + deliveryFee + platformFee;
  const savings = 25; // Delivery fee discount

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getItemQuantity,
    clearCart,
    totalItemCount,
    itemTotalAmount,
    deliveryFee,
    platformFee,
    grandTotal,
    savings,
    deliveryNotes,
    setDeliveryNotes,
    substitutionPreference,
    setSubstitutionPreference,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
