"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

export function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem } = useCart();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
          <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2 rounded-full border border-border bg-slate-50 px-2 py-1">
          <button
            onClick={() => decrement(item.id)}
            className="rounded-full p-1 text-slate-600 hover:bg-white"
            aria-label={`Decrease ${item.name}`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2ch] text-center text-sm font-semibold text-slate-900">
            {item.quantity}
          </span>
          <button
            onClick={() => increment(item.id)}
            className="rounded-full p-1 text-slate-600 hover:bg-white"
            aria-label={`Increase ${item.name}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {formatCurrency(item.price * item.quantity)}
        </div>
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-700"
          onClick={() => removeItem(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
