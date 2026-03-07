import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        if (!process.env.CHAPA_SECRET_KEY) {
            console.error("Missing CHAPA_SECRET_KEY environment variable");
            return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
        }

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { amount, email, first_name, last_name, orderId } = body;

        if (!amount || !email || !orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate a unique transaction reference (Max 50 chars)
        // UUID(36) + "tx-"(3) = 39. This is safe. 
        const tx_ref = `tx-${orderId}`;

        // Update order with payment reference and method
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentReference: tx_ref,
                paymentMethod: "CHAPA",
            },
        });

        const baseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

        const chapaRequestData = {
            amount: amount.toString(),
            currency: "ETB",
            email: email,
            first_name: first_name || "Customer",
            last_name: last_name || "User",
            tx_ref: tx_ref,
            callback_url: `${baseUrl}/api/chapa/webhook`,
            return_url: `${baseUrl}/payment-success?tx_ref=${tx_ref}`,
            customization: {
                title: "Emaye Delivery", // Max 16 characters
                description: "Order Payment",
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

        if (data.status === "success" && data.data?.checkout_url) {
            return NextResponse.json({ checkout_url: data.data.checkout_url });
        } else {
            console.error("Chapa initialization failed:", JSON.stringify(data, null, 2));

            // Cleanly extract the error message so the frontend doesn't crash React
            let msg = "Failed to initialize transaction";
            if (typeof data.message === "string") {
                msg = data.message;
            } else if (data.message && typeof data.message === "object") {
                // If message is an object (common in validation errors), stringify it
                msg = Object.entries(data.message)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                    .join(" | ");
            }

            return NextResponse.json({
                error: msg,
                details: data
            }, { status: 400 });
        }
    } catch (error) {
        console.error("Chapa API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
