"use client";

import type { OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const statusMap: Record<OrderStatus, { label: string; variant: "default" | "success" | "warning" | "info" }> =
  {
    PENDING: { label: "Pending", variant: "warning" },
    CONFIRMED: { label: "Confirmed", variant: "info" },
    PREPARING: { label: "Preparing", variant: "info" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "default" },
    DELIVERED: { label: "Delivered", variant: "success" },
  };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
