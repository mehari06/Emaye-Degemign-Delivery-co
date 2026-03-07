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

  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "TELEBIRR" | "CBE_BIRR">("TELEBIRR");

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      // 1. Create the order in PENDING status
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

      if (!result?.ok || !result.orderId) {
        toast.error(result?.error ?? "Unable to place order.");
        return;
      }

      // 2. If it's a Chapa payment (Telebirr/CBE Birr are handled via Chapa for this demo)
      if (paymentMethod === "TELEBIRR" || paymentMethod === "CBE_BIRR") {
        try {
          const initResponse = await fetch("/api/chapa/initialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: result.orderId,
              amount: subtotal + 80, // Subtotal + fixed delivery fee for demo
              email: "customer@example.com", // In real app, get from user profile
              first_name: "Customer",
              last_name: "User",
            }),
          });

          const initData = await initResponse.json();

          if (initData.checkout_url) {
            clear();
            window.location.href = initData.checkout_url;
          } else {
            const errorMsg = initData.error || "Payment initialization failed.";
            toast.error(errorMsg);
            console.error("Payment init error:", initData);
          }
        } catch (error) {
          console.error("Payment error:", error);
          toast.error("Something went wrong with the payment.");
        }
      } else {
        // 3. Cash on Delivery
        clear();
        toast.success("Order placed! Tracking is now available.");
        router.push("/orders");
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
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Payment method
            </label>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {[
                { id: "TELEBIRR", label: "Telebirr", icon: "📱" },
                { id: "CBE_BIRR", label: "CBE Birr", icon: "🏦" },
                { id: "CASH", label: "Cash on delivery", icon: "💵" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${paymentMethod === method.id
                    ? "border-brand bg-brand-light/10 text-brand ring-1 ring-brand"
                    : "border-border bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto">
            {isPending
              ? "Processing..."
              : paymentMethod === "CASH"
                ? "Confirm order"
                : "Pay now"}
          </Button>
        </div>
        <CartSummary subtotal={subtotal} showCheckout={false} />
      </Container>
    </div>
  );
}
