// store/cartStore.ts
"use client";

import { create } from "zustand";
import { Product } from "@/types/product";

interface UseCart {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useCart = create<UseCart>((set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((p) => p.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((p) =>
            p.id === product.id ? { ...p, qty: (p.qty || 1) + 1 } : p
          ),
        };
      }
      return { cart: [...state.cart, { ...product, qty: 1 }] };
    }),
  removeFromCart: (id) =>
    set((state) => ({ cart: state.cart.filter((p) => p.id !== id) })),
  clearCart: () => set({ cart: [] }),
}));