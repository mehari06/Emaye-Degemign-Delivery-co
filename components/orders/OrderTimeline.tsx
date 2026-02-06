"use client";

import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const labels: Record<OrderStatus, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = steps.indexOf(status);

  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
              index <= activeIndex
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-slate-400",
            )}
          >
            {index + 1}
          </span>
          <p
            className={cn(
              "text-sm",
              index <= activeIndex ? "text-slate-900" : "text-slate-500",
            )}
          >
            {labels[step]}
          </p>
        </div>
      ))}
    </div>
  );
}
