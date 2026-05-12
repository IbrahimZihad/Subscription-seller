"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { CartItem, Product, ProductPlan } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; plan?: ProductPlan }
  | { type: "REMOVE_ITEM"; productId: string; planId?: string }
  | { type: "UPDATE_QTY"; key: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, plan?: ProductPlan) => void;
  removeItem: (productId: string, planId?: string) => void;
  updateQuantity: (productId: string, planId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

// -----------------------------
// SAFE KEY GENERATOR
// -----------------------------
const getProductId = (p: Product) => (p as any)._id || p.id;

const getKey = (productId: string, planId?: string) =>
  planId ? `${productId}-${planId}` : productId;

// -----------------------------
// REDUCER
// -----------------------------
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case "ADD_ITEM": {
      const productId = getProductId(action.product);
      const key = getKey(productId, action.plan?.id);

      const existing = state.items.find((i) => i.key === key);

      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            key,
            product: action.product,
            plan: action.plan,
            quantity: 1,
          },
        ],
      };
    }

    case "REMOVE_ITEM": {
      const key = getKey(action.productId, action.planId);
      return {
        ...state,
        items: state.items.filter((i) => i.key !== key),
      };
    }

    case "UPDATE_QTY": {
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === action.key
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

// -----------------------------
// PROVIDER
// -----------------------------
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // -----------------------------
  // LOAD CART (FIXED - NO RE-DISPATCH LOOP)
  // -----------------------------
  useEffect(() => {
    const saved = localStorage.getItem("sbd-cart");
    if (saved) {
      try {
        const items = JSON.parse(saved);

        if (Array.isArray(items)) {
          // restore directly (no dispatch loop bug)
          items.forEach((item: CartItem) => {
            dispatch({
              type: "ADD_ITEM",
              product: item.product,
              plan: item.plan,
            });
          });
        }
      } catch (err) {
        console.error("Cart load error:", err);
      }
    }
  }, []);

  // -----------------------------
  // SAVE CART
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("sbd-cart", JSON.stringify(state.items));
  }, [state.items]);

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const addItem = (product: Product, plan?: ProductPlan) =>
    dispatch({ type: "ADD_ITEM", product, plan });

  const removeItem = (productId: string, planId?: string) =>
    dispatch({ type: "REMOVE_ITEM", productId, planId });

  const updateQuantity = (productId: string, planId: string | undefined, quantity: number) => {
    const key = getKey(productId, planId);
    dispatch({ type: "UPDATE_QTY", key, quantity });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });

  // -----------------------------
  // TOTALS
  // -----------------------------
  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);

  const totalPrice = state.items.reduce((acc, i) => {
    const price = i.plan ? i.plan.price : (i.product as any).price;
    return acc + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// -----------------------------
// HOOK
// -----------------------------
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}