import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { AssignedOrderList } from "@/components/delivery/AssignedOrderList";
import { DeliveryMap } from "@/components/delivery/DeliveryMap";
import { UpdatePasswordForm } from "@/components/delivery/UpdatePasswordForm";
import { getAssignedOrders } from "@/lib/actions/delivery";
import { getCurrentUser, isDeliveryUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeliveryDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login?callbackUrl=/delivery");
    }

    if (!isDeliveryUser(user)) {
        redirect("/"); // Or a custom "Not Authorized" page
    }

    const orders = (await getAssignedOrders()) as any[];

    // Format orders for the map component
    const mapOrders = orders
        .filter(o => o.address?.latitude && o.address?.longitude)
        .map(o => ({
            id: o.id,
            lat: o.address!.latitude,
            lng: o.address!.longitude,
            customerName: o.user?.name || "Customer",
            status: o.status.replace(/_/g, ' '),
        }));

    return (
        <div className="bg-white min-h-screen">
            <Container className="flex flex-col gap-8 py-16">
                <div className="flex flex-col gap-2">
                    <SectionHeading
                        eyebrow="Delivery Dash"
                        title={`Welcome back, ${user.name?.split(' ')[0] || 'Hero'}`}
                        subtitle="View your active deliveries and track your map locations."
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content: Map and Order List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Hawassa Delivery Map
                            </h3>
                            <DeliveryMap orders={mapOrders} />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Active Assignments
                            </h3>
                            <AssignedOrderList orders={orders as any} />
                        </div>
                    </div>

                    {/* Sidebar: Security and Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        <UpdatePasswordForm />

                        <div className="rounded-2xl border border-border bg-slate-50 p-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Quick Note</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Use the map markers to see customer locations and order details.
                                Update order status as you progress from pickup to delivery.
                                Need help? Contact the main office.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
