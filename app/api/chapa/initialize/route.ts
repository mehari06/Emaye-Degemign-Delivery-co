import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { initializeChapa } from "@/lib/services/chapa";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { amount, email, first_name, last_name, orderId } = body;

        if (!amount || !email || !orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        try {
            const chapaResult = await initializeChapa({
                amount,
                email,
                first_name,
                last_name,
                orderId,
            });
            return NextResponse.json({ checkout_url: chapaResult.checkout_url });
        } catch (chapaError: any) {
            console.error("Chapa Initialization Error:", chapaError);
            return NextResponse.json({
                error: chapaError.message || "Failed to initialize transaction"
            }, { status: 400 });
        }
    } catch (error) {
        console.error("Chapa API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
