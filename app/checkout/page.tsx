"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { AddressForm } from "@/components/forms/AddressForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useCart } from "@/components/cart/CartProvider";
import { createOrderAction } from "@/lib/actions/orders";
import type { AddressInput } from "@/lib/types";

const defaultAddress: AddressInput = {
  address: "Add your delivery address",
  latitude: 9.03,
  longitude: 38.74,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [address, setAddress] = React.useState<AddressInput>(defaultAddress);
  const [notes, setNotes] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        address,
        notes,
      });

      if (result?.ok) {
        clear();
        toast.success("Order placed! Tracking is now available.");
        router.push("/orders");
      } else {
        toast.error(result?.error ?? "Unable to place order.");
      }
    });
  };

  return (
    <div className="bg-white">
      <Container className="grid gap-8 py-16 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Checkout
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Confirm delivery details
            </h1>
          </div>
          <AddressForm value={address} onChange={setAddress} />
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Delivery notes
            </label>
            <Textarea
              className="mt-2"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Gate code, drop-off instructions, or any helpful notes."
            />
          </div>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Placing order..." : "Confirm order"}
          </Button>
        </div>
        <CartSummary subtotal={subtotal} showCheckout={false} />
      </Container>
    </div>
  );
}
