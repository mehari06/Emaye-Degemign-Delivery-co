"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/components/cart/CartProvider";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function FoodCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = async () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart`);

    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const data = (await response.json()) as { authenticated?: boolean };
      if (!data?.authenticated) {
        router.push("/profile");
      }
    } catch {
      // If the auth check fails, keep the cart update but don't redirect.
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
      <div className="relative h-44 w-full bg-slate-100">
        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
          {item.tags?.[0] ? <Badge variant="info">{item.tags[0]}</Badge> : null}
        </div>
        <p className="text-sm text-slate-600">{item.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(item.price)}
          </span>
          <Button size="sm" onClick={handleAdd} aria-label={`Add ${item.name}`}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
