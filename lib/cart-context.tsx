'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RescueBag, CartItem } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (bag: RescueBag, quantity: number) => void;
  updateQuantity: (bagId: string, quantity: number) => void;
  removeFromCart: (bagId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('savebite_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('savebite_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((bag: RescueBag, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.bag.id === bag.id);
      if (existingItem) {
        // limit quantity up to remaining quantity
        const newQty = Math.min(existingItem.quantity + quantity, bag.quantity_remaining);
        return prev.map(item => 
          item.bag.id === bag.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { bag, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((bagId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.bag.id === bagId) {
          const newQty = Math.max(1, Math.min(quantity, item.bag.quantity_remaining));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((bagId: string) => {
    setCartItems(prev => prev.filter(item => item.bag.id !== bagId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.bag.rescue_price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal
    }}>
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
