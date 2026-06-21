import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: Record<string, CartItem>;
  addToCart: (name: string, price: number) => void;
  updateQuantity: (name: string, change: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('varevva_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
  }, []);

  // Sync cart to localStorage when it changes
  const saveCart = (newCart: Record<string, CartItem>) => {
    setCart(newCart);
    localStorage.setItem('varevva_cart', JSON.stringify(newCart));
  };

  const addToCart = (name: string, price: number) => {
    const newCart = { ...cart };
    if (newCart[name]) {
      newCart[name].quantity += 1;
    } else {
      newCart[name] = { name, price, quantity: 1 };
    }
    saveCart(newCart);
  };

  const updateQuantity = (name: string, change: number) => {
    const newCart = { ...cart };
    if (!newCart[name]) return;
    newCart[name].quantity += change;
    if (newCart[name].quantity <= 0) {
      delete newCart[name];
    }
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart({});
  };

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
