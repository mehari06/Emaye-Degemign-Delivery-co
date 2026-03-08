"use client";

import { useState } from "react";
import { registerDeliveryPersonAction } from "@/lib/actions/delivery";
import { toast } from "react-hot-toast";

export function AddDeliveryForm() {
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string; name: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setCredentials(null);

        const formData = new FormData(e.currentTarget);
        const result = await registerDeliveryPersonAction(formData);

        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else if (result.success && result.credentials) {
            toast.success("Delivery person registered successfully!");
            setCredentials(result.credentials);
            (e.target as HTMLFormElement).reset();
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-slate-900">Add New Delivery Person</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Abebe Balcha"
                            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="e.g. abebe@example.com"
                            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number (Optional)</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="+251..."
                            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center rounded-full bg-brand py-3 text-sm font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register Delivery Person"}
                </button>
            </form>

            {credentials && (
                <div className="rounded-2xl border-2 border-dashed border-brand bg-brand/5 p-6 space-y-3">
                    <div className="flex items-center gap-2 text-brand">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-bold">Account Created Successfully!</h4>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">Please share these credentials with {credentials.name}:</p>
                    <div className="bg-white p-4 rounded-xl border border-brand/20 space-y-2 select-all">
                        <p className="text-sm"><span className="text-slate-500 font-semibold">Email:</span> {credentials.email}</p>
                        <p className="text-sm"><span className="text-slate-500 font-semibold">Password:</span> <code className="bg-slate-100 px-1 rounded font-mono font-bold text-brand">{credentials.password}</code></p>
                    </div>
                    <p className="text-xs text-red-500 font-semibold">⚠️ Important: This password is only shown once. Make sure to copy it now.</p>
                </div>
            )}
        </div>
    );
}
