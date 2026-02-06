"use client";

import * as React from "react";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "INCREMENT"; payload: { id: string } }
  | { type: "DECREMENT"; payload: { id: string } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: CartState };

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "emaye-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.payload.id) };
    case "INCREMENT":
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    case "DECREMENT":
      return {
        items: state.items
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.max(0, item.quantity - 1) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(cartReducer, { items: [] });

  React.useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        dispatch({ type: "HYDRATE", payload: JSON.parse(stored) as CartState });
      } catch {
        dispatch({ type: "CLEAR" });
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextValue = {
    items: state.items,
    totalItems,
    subtotal,
    addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: { id } }),
    increment: (id) => dispatch({ type: "INCREMENT", payload: { id } }),
    decrement: (id) => dispatch({ type: "DECREMENT", payload: { id } }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
