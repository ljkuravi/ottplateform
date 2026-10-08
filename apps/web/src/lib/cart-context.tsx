'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './auth-context';

interface CartItem {
  id: string;
  listingId: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    slug: string;
    planName: string;
    durationMonths: number;
    price: number;
    originalPrice?: number;
    accessType: string;
    platform: {
      name: string;
      logoUrl: string;
    };
    seller: {
      displayName: string;
    };
  };
  isAvailable: boolean;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (listingId: string) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  subtotal: 0,
  isLoading: false,
  isOpen: false,
  setIsOpen: () => {},
  addToCart: async () => false,
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (listingId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/listings`;
      return false;
    }

    try {
      const res = await api.post('/cart/items', { listingId });
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
        setIsOpen(true);
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch {
      // ignore
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
      setSubtotal(0);
    } catch {
      // ignore
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        isLoading,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
