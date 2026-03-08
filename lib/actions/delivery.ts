"use server";

import { prisma } from "@/lib/prisma/client";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function registerDeliveryPersonAction(formData: FormData) {
    try {
        const admin = await getCurrentUser();
        if (!isAdminUser(admin)) {
            return { error: "Unauthorized. Admin access required." };
        }

        const email = formData.get("email") as string;
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        if (!email || !name) {
            return { error: "Email and Name are required." };
        }

        // Generate a random password
        const password = crypto.randomBytes(8).toString("hex");

        const adminClient = await createSupabaseAdminClient();

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name },
        });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            return { error: authError.message };
        }

        const authUser = authData.user;
        if (!authUser) {
            return { error: "Failed to create auth user." };
        }

        // 2. Create user in Prisma with DELIVERY role
        await prisma.user.upsert({
            where: { id: authUser.id },
            update: {
                email,
                name,
                phone,
                role: "DELIVERY",
                provider: "EMAIL",
            },
            create: {
                id: authUser.id,
                email,
                name,
                phone,
                role: "DELIVERY",
                provider: "EMAIL",
            },
        });

        revalidatePath("/admin/delivery");

        return {
            success: true,
            credentials: {
                email,
                password,
                name
            }
        };
    } catch (error: any) {
        console.error("Registration Error:", error);
        return { error: error.message || "An unexpected error occurred." };
    }
}

export async function getDeliveryPersons() {
    return prisma.user.findMany({
        where: { role: "DELIVERY" },
        orderBy: { createdAt: "desc" },
    });
}

export async function getAssignedOrders() {
    const user = await getCurrentUser();
    if (!user) return [];

    return prisma.order.findMany({
        where: { deliveryPersonId: user.id },
        include: {
            user: true,
            address: true,
            items: { include: { menuItem: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateDeliveryStatusAction(orderId: string, status: any) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not logged in" };

    try {
        await prisma.order.update({
            where: { id: orderId, deliveryPersonId: user.id },
            data: { status },
        });
        revalidatePath("/delivery");
        revalidatePath("/orders");
        return { success: true };
    } catch (error) {
        console.error("updateDeliveryStatusAction failed", error);
        return { error: "Failed to update status" };
    }
}
