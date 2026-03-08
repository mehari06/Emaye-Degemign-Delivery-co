import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Select } from "@/components/ui/Select";
import { OrdersRealtimeObserver } from "@/components/realtime/OrdersRealtimeObserver";
import { updateOrderStatusAction, assignDeliveryHeroAction } from "@/lib/actions/orders";
import { getDeliveryPersons } from "@/lib/actions/delivery";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getAllOrders } from "@/lib/services/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type OrderWithRelations = Awaited<ReturnType<typeof getAllOrders>>[number];

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) notFound();

  let orders: OrderWithRelations[] = [];
  let deliveryPersons: Awaited<ReturnType<typeof getDeliveryPersons>> = [];

  try {
    [orders, deliveryPersons] = await Promise.all([
      getAllOrders(),
      getDeliveryPersons(),
    ]);
  } catch {
    orders = [];
  }

  return (
    <div className="bg-white">
      <Container className="flex flex-col gap-8 py-16">
        <SectionHeading
          eyebrow="Admin"
          title="Order management"
          subtitle="Update order statuses and monitor active deliveries."
        />
        <OrdersRealtimeObserver scope="admin" />

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-slate-600">
            No orders found yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft hover:border-brand/30 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Order #{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(order.createdAt)} {"\u00b7"}{" "}
                      {order.user?.name ?? "Guest"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.deliveryPerson && (
                      <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.deliveryPerson.name}
                      </div>
                    )}
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-900">Delivery Address</p>
                    <p>{order.address?.address}</p>
                    {(order.address?.condoBlock || order.address?.condoRoom) && (
                      <p className="text-xs font-medium text-brand">
                        Block: {order.address.condoBlock || "N/A"}, Room: {order.address.condoRoom || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Payment & Contact</p>
                    <p className="capitalize">{order.paymentMethod.toLowerCase()} ({order.paymentStatus})</p>
                    <p>{order.user?.phone || "No phone provided"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-y border-border/50 py-4">
                  {order.items.map(
                    (item: OrderWithRelations["items"][number]) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.menuItem?.name} x {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  {/* Status Update Form */}
                  <form
                    action={updateOrderStatusAction.bind(null, order.id)}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Status</label>
                    <div className="flex gap-2">
                      <Select name="status" defaultValue={order.status} className="h-10">
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid (Success)</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </Select>
                      <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                        Update
                      </button>
                    </div>
                  </form>

                  {/* Delivery Hero Assignment Form */}
                  <form
                    action={assignDeliveryHeroAction.bind(null, order.id)}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assign Delivery Hero</label>
                    <div className="flex gap-2">
                      <Select
                        name="deliveryPersonId"
                        defaultValue={order.deliveryPersonId || ""}
                        className="h-10 min-w-[200px]"
                      >
                        <option value="" disabled>Select Delivery Person</option>
                        {deliveryPersons.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.phone || "No phone"})</option>
                        ))}
                      </Select>
                      <button className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand/90">
                        Assign
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
