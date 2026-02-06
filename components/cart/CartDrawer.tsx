"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/components/cart/CartProvider";

export function CartDrawer() {
  const { items, subtotal, totalItems } = useCart();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full shadow-float sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open cart"
      >
        <ShoppingBag className="h-4 w-4" />
        Cart ({totalItems})
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Your cart" variant="bottom">
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-auto pb-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Your cart is empty.</p>
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>
        <CartSummary subtotal={subtotal} />
      </Modal>
    </>
  );
}
