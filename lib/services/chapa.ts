import { prisma } from "@/lib/prisma/client";

export interface ChapaInitParams {
    amount: number;
    email: string;
    first_name: string;
    last_name: string;
    orderId: string;
}

export async function initializeChapa({
    amount,
    email,
    first_name,
    last_name,
    orderId,
}: ChapaInitParams) {
    if (!process.env.CHAPA_SECRET_KEY) {
        throw new Error("Missing CHAPA_SECRET_KEY environment variable");
    }

    // Generate a unique transaction reference (Max 50 chars)
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
        return { checkout_url: data.data.checkout_url, tx_ref };
    } else {
        console.error("Chapa initialization failed:", JSON.stringify(data, null, 2));

        // Cleanly extract the error message
        let msg = "Failed to initialize transaction";
        if (typeof data.message === "string") {
            msg = data.message;
        } else if (data.message && typeof data.message === "object") {
            msg = Object.entries(data.message)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                .join(" | ");
        }

        throw new Error(msg);
    }
}
