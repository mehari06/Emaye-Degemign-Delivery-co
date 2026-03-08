"use client";

import { useTransition } from "react";
import { updateDeliveryStatusAction } from "@/lib/actions/delivery";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

type AssignedOrder = {
    id: string;
    status: string;
    total: number;
    createdAt: Date;
    user: { name: string | null; phone: string | null } | null;
    address: { address: string; condoBlock: string | null; condoRoom: string | null } | null;
    items: { id: string; menuItem: { name: string } | null; quantity: number; totalPrice: number }[];
};

export function AssignedOrderList({ orders }: { orders: AssignedOrder[] }) {
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (orderId: string, nextStatus: string) => {
        startTransition(async () => {
            const result = await updateDeliveryStatusAction(orderId, nextStatus as any);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Order status updated to ${nextStatus.replace(/_/g, ' ')}`);
            }
        });
    };

    if (orders.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold">
                    !
                </div>
                <p className="text-sm font-medium text-slate-600">No active orders assigned to you.</p>
                <p className="mt-1 text-xs text-slate-500">Wait for the admin to assign you some deliveries!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-all hover:border-brand/30">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</p>
                            <p className="text-sm font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <OrderStatusBadge status={order.status as any} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Details</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                                        {order.user?.name?.[0] || "C"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{order.user?.name || "Guest"}</p>
                                        <p className="text-xs text-slate-500">{order.user?.phone || "No phone provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</p>
                                <p className="mt-1 text-sm text-slate-700">{order.address?.address}</p>
                                {(order.address?.condoBlock || order.address?.condoRoom) && (
                                    <div className="mt-1.5 flex gap-3">
                                        <div className="rounded-lg bg-brand/5 px-2 py-1 text-[10px] font-bold text-brand ring-1 ring-brand/10">
                                            BLOCK: {order.address.condoBlock || "N/A"}
                                        </div>
                                        <div className="rounded-lg bg-brand/5 px-2 py-1 text-[10px] font-bold text-brand ring-1 ring-brand/10">
                                            ROOM: {order.address.condoRoom || "N/A"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Items</p>
                                <ul className="mt-1 divide-y divide-slate-50">
                                    {order.items.map(item => (
                                        <li key={item.id} className="flex justify-between py-1.5 text-xs text-slate-600">
                                            <span>{item.menuItem?.name || "Deleted Item"} x {item.quantity}</span>
                                            <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-2 flex justify-between border-t border-slate-50 pt-2 text-sm font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {order.status === "CONFIRMED" && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                                            disabled={isPending}
                                            className="rounded-full bg-amber-500 px-4 py-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-amber-500/10 hover:bg-amber-600 disabled:opacity-50"
                                        >
                                            Start Preparing
                                        </button>
                                    )}
                                    {(order.status === "CONFIRMED" || order.status === "PREPARING") && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                                            disabled={isPending}
                                            className="rounded-full bg-blue-500 px-4 py-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-blue-500/10 hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            Mark Picked Up
                                        </button>
                                    )}
                                    {order.status === "OUT_FOR_DELIVERY" && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                            disabled={isPending}
                                            className="rounded-full bg-emerald-500 px-4 py-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-emerald-500/10 hover:bg-emerald-600 disabled:opacity-50"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
