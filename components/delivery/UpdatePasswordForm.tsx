"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export function UpdatePasswordForm() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        const supabase = createSupabaseBrowserClient();

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully!");
            setPassword("");
            setConfirmPassword("");
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Security</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
