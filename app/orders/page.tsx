import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrdersRealtimeObserver } from "@/components/realtime/OrdersRealtimeObserver";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/services/orders";
import type { OrderSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="bg-surface">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Orders"
            title="Track every delivery in one place"
            subtitle="Sign in to see your past orders and live delivery updates."
          />
        </Container>
      </div>
    );
  }

  let orders: OrderSummary[] = [];
  try {
    const dbOrders = await getOrdersForUser(user.id);
    orders = dbOrders.map((order) => ({
      id: order.id,
      status: order.status as OrderSummary["status"],
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    }));
  } catch {
    orders = [];
  }

  const latestOrder = orders[0];

  return (
    <div className="bg-surface">
      <Container className="flex flex-col gap-10 py-16">
        <SectionHeading
          eyebrow="Orders"
          title="Your delivery timeline"
          subtitle="Check the latest order status and revisit previous deliveries."
        />
        <OrdersRealtimeObserver scope="user" userId={user.id} />
        {latestOrder ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <OrderCard order={latestOrder} />
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-slate-900">
                Live status
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Updates refresh automatically as your order moves.
              </p>
              <div className="mt-6">
                <OrderTimeline status={latestOrder.status} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-slate-600">
              You have no orders yet. Explore the menu to start a new delivery.
            </p>
          </div>
        )}
        {orders.length > 1 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.slice(1).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
