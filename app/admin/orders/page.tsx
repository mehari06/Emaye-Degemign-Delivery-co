import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Select } from "@/components/ui/Select";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { getAllOrders } from "@/lib/services/orders";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OrderWithRelations = Awaited<ReturnType<typeof getAllOrders>>[number];

export default async function AdminOrdersPage() {
  let orders: OrderWithRelations[] = [];

  try {
    orders = await getAllOrders();
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

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-slate-600">
            No orders found yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft"
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
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-900">Delivery</p>
                    <p>{order.address?.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Total</p>
                    <p>{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
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

                <form
                  action={updateOrderStatusAction.bind(null, order.id)}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <Select name="status" defaultValue={order.status}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                    <option value="DELIVERED">Delivered</option>
                  </Select>
                  <button className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">
                    Update status
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
