import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(
    request: Request,
    { params }: { params: { tx_ref: string } }
) {
    const { tx_ref } = params;

    if (!tx_ref) {
        return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    try {
        // Call Chapa to verify transaction
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            },
        });

        const data = await response.json();

        if (data.status === "success" && data.data.status === "success") {
            // Update order status in database
            const order = await prisma.order.update({
                where: { paymentReference: tx_ref },
                data: {
                    status: "PAID",
                    paymentStatus: "paid",
                },
            });

            return NextResponse.json({ success: true, orderId: order.id });
        } else {
            return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
        }
    } catch (error) {
        console.error("Chapa Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
