'use client';

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';

export interface CartItem {
  id: string | number;
  name: string;
  store: string;
  shopId?: string;
  price: number;
  oldPrice?: number;
  qty: number;
  size: string;
  color: string;
  bg?: string;
  img?: string;
}

interface CartState {
  items: CartItem[];
  open: boolean;
}

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; id: string | number; size: string }
  | { type: 'UPDATE_QTY'; id: string | number; size: string; delta: number }
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.item.id && i.size === action.item.size);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id && i.size === action.item.size
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => !(i.id === action.id && i.size === action.size)) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id && i.size === action.size
            ? { ...i, qty: Math.max(1, i.qty + action.delta) }
            : i
        ),
      };
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'OPEN':
      return { ...state, open: true };
    case 'CLOSE':
      return { ...state, open: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  open: boolean;
  addToCart: (product: any, size?: string, color?: string) => void;
  removeFromCart: (id: string | number, size: string) => void;
  updateQty: (id: string | number, size: string, delta: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'afm_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], open: false });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) dispatch({ type: 'SET_ITEMS', items: parsed });
      }
    } catch {}
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addToCart = (product: any, size?: string, color?: string) => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      store: product.store || product.shop_name,
      shopId: product.shopId || product.shop_id,
      price: product.price,
      oldPrice: product.oldPrice || product.compare_price,
      qty: 1,
      size: size || product.sizes?.[1] || product.sizes?.[0] || 'M',
      color: color || product.colors?.[0] || '#001F3F',
      bg: product.bg,
      img: product.img || product.images?.[0],
    };
    dispatch({ type: 'ADD', item });
    dispatch({ type: 'OPEN' });
  };

  const removeFromCart = (id: string | number, size: string) =>
    dispatch({ type: 'REMOVE', id, size });

  const updateQty = (id: string | number, size: string, delta: number) =>
    dispatch({ type: 'UPDATE_QTY', id, size, delta });

  const setItems = (items: CartItem[]) => dispatch({ type: 'SET_ITEMS', items });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const openCart = () => dispatch({ type: 'OPEN' });
  const closeCart = () => dispatch({ type: 'CLOSE' });

  const cartCount = state.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      open: state.open,
      addToCart,
      removeFromCart,
      updateQty,
      setItems,
      clearCart,
      openCart,
      closeCart,
      cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
