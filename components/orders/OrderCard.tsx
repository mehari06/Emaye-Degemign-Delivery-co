"use client";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderSummary } from "@/lib/types";

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Order #{order.id.slice(0, 6).toUpperCase()}
          </p>
          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="flex flex-col gap-2 text-sm text-slate-600">
        {order.items.map((item) => (
          <div key={item.menuItemId} className="flex items-center justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(order.total)}</span>
      </div>
    </div>
  );
}
