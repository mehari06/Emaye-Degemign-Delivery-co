"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonStyles } from "@/components/ui/buttonStyles";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tx_ref = searchParams.get("tx_ref");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!tx_ref) {
            setStatus("error");
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/chapa/verify/${tx_ref}`);
                const data = await response.json();

                if (data.success) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
            }
        };

        verifyPayment();
    }, [tx_ref]);

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <Container className="max-w-md">
                <div className="rounded-[32px] border border-border bg-white p-10 text-center shadow-float">
                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
                            <h1 className="text-2xl font-semibold text-slate-900">Verifying Payment...</h1>
                            <p className="text-slate-600">Please wait while we confirm your transaction with Chapa.</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative h-48 w-48">
                                <Image
                                    src="/illustrations/hero_delivery.png"
                                    alt="Payment Success"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h1 className="text-3xl font-semibold text-slate-900">Payment Successful!</h1>
                            <p className="text-slate-600">
                                Thank you for your order. We've received your payment and our kitchen is starting to prepare your meal.
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                <Link href="/orders" className={buttonStyles({ size: "lg", className: "w-full" })}>
                                    Track My Order
                                </Link>
                                <Link href="/" className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}>
                                    Return Home
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-900">Payment Verification Failed</h1>
                            <p className="text-slate-600">
                                We couldn't verify your payment. If you believe this is an error, please contact our support.
                            </p>
                            <Link href="/orders" className={buttonStyles({ size: "lg", className: "w-full" })}>
                                Back to Orders
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
