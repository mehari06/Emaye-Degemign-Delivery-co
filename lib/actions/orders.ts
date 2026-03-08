"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { createOrder, updateOrderStatus } from "@/lib/services/orders";
import { upsertGoogleUser } from "@/lib/services/users";
import type { OrderStatus } from "@/lib/types";

const OrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const AddressSchema = z.object({
  address: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  condoBlock: z.string().optional(),
  condoRoom: z.string().optional(),
});

export async function createOrderAction(payload: {
  items: z.infer<typeof OrderItemSchema>[];
  address: z.infer<typeof AddressSchema>;
  notes?: string;
}) {
  const parsed = z
    .object({
      items: z.array(OrderItemSchema).min(1),
      address: AddressSchema,
      notes: z.string().optional(),
    })
    .safeParse(payload);

  if (!parsed.success) {
    return { ok: false, error: "Invalid order details" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please sign in to place an order." };
  }

  try {
    if (user.provider === "GOOGLE") {
      await upsertGoogleUser({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    }
    const order = await createOrder({
      userId: user.id,
      address: parsed.data.address,
      items: parsed.data.items,
      notes: parsed.data.notes,
    });
    revalidatePath("/orders");
    return { ok: true, orderId: order.id, email: user.email };
  } catch (error) {
    console.error("createOrderAction failed", error);
    return { ok: false, error: "Unable to create order right now." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!isAdminUser(user)) return;

  const allowed = [
    "PENDING",
    "PAID",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  const status = String(formData.get("status") ?? "");
  if (!allowed.includes(status)) {
    return;
  }

  try {
    await updateOrderStatus({ orderId, status: status as OrderStatus });
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
  } catch {
    return;
  }
}

export async function assignOrderAction(orderId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return { error: "Unauthorized" };

  const deliveryPersonId = formData.get("deliveryPersonId") as string;
  if (!deliveryPersonId) return { error: "No delivery person selected" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPersonId,
        status: "CONFIRMED" // When assigned, it's usually confirmed
      },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("assignOrderAction failed", error);
    return { error: "Failed to assign order" };
  }
}
