"use client";

import type { OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const statusMap: Record<OrderStatus, { label: string; variant: "default" | "success" | "warning" | "info" }> =
{
  PENDING: { label: "Pending", variant: "warning" },
  PAID: { label: "Paid", variant: "success" },
  CONFIRMED: { label: "Confirmed", variant: "info" },
  PREPARING: { label: "Preparing", variant: "info" },
  OUT_FOR_DELIVERY: { label: "In transit", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "default" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
