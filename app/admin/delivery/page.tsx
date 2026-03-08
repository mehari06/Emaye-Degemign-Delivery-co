import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { AddDeliveryForm } from "@/components/admin/AddDeliveryForm";
import { getDeliveryPersons } from "@/lib/actions/delivery";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) notFound();

    const deliveryPersons = await getDeliveryPersons();

    return (
        <div className="bg-white">
            <Container className="flex flex-col gap-8 py-16">
                <SectionHeading
                    eyebrow="Admin"
                    title="Delivery Personnel"
                    subtitle="Register and manage your delivery team members."
                />

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <AddDeliveryForm />
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="mb-6 text-lg font-semibold text-slate-900">Active Delivery Team</h3>
                        {deliveryPersons.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-slate-600">
                                No delivery persons registered yet.
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Date Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {deliveryPersons.map((person) => (
                                            <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand font-bold">
                                                            {person.name?.[0]?.toUpperCase() ?? "D"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{person.name}</p>
                                                            <p className="text-xs text-slate-500">ID: {person.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-700">{person.email}</p>
                                                    <p className="text-xs text-slate-500">{person.phone || "No phone"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {formatDate(person.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
