"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/cart/CartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-700 shadow-soft",
        }}
      />
    </CartProvider>
  );
}
