import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth";

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

        // Generate a unique transaction reference
        const tx_ref = `tx-${orderId}-${Date.now()}`;

        // Update order with payment reference and method
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentReference: tx_ref,
                paymentMethod: "CHAPA",
            },
        });

        const chapaRequestData = {
            amount: amount.toString(),
            currency: "ETB",
            email: email,
            first_name: first_name || "Customer",
            last_name: last_name || "User",
            tx_ref: tx_ref,
            callback_url: `${process.env.APP_BASE_URL}/api/chapa/webhook`, // Optional: for background status updates
            return_url: `${process.env.APP_BASE_URL}/payment-success?tx_ref=${tx_ref}`,
            customization: {
                title: "Emaye Degemign Delivery",
                description: "Payment for food order",
            },
        };

        const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chapaRequestData),
        });

        const data = await response.json();

        if (data.status === "success") {
            return NextResponse.json({ checkout_url: data.data.checkout_url });
        } else {
            console.error("Chapa initialization failed:", data);
            return NextResponse.json({ error: data.message || "Failed to initialize transaction" }, { status: 400 });
        }
    } catch (error) {
        console.error("Chapa API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
