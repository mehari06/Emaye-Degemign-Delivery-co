"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { Container } from "@/components/layout/Container";

export default function CartPage() {
  const { items, subtotal } = useCart();

  return (
    <div className="bg-surface">
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Cart
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Your order</h1>
          </div>
          <Link href="/menu" className={buttonStyles({ variant: "secondary" })}>
            Add more items
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-slate-600">
              Your cart is empty. Explore the menu to add your favorites.
            </p>
            <Link
              href="/menu"
              className={buttonStyles({ className: "mt-4 inline-flex" })}
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
            <CartSummary subtotal={subtotal} />
          </div>
        )}
      </Container>
    </div>
  );
}
