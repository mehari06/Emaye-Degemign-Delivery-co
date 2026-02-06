"use client";

import { formatCurrency } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/buttonStyles";
import Link from "next/link";

export function CartSummary({
  subtotal,
  showCheckout = true,
}: {
  subtotal: number;
  showCheckout?: boolean;
}) {
  const deliveryFee = subtotal >= 2000 ? 0 : 80;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Subtotal</span>
        <span className="font-semibold text-slate-900">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Delivery</span>
        <span className="font-semibold text-slate-900">
          {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
        </span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between text-base font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {showCheckout ? (
        <Link href="/checkout" className={buttonStyles({ className: "w-full" })}>
          Proceed to checkout
        </Link>
      ) : null}
    </div>
  );
}
