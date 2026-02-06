import { prisma } from "@/lib/prisma/client";
import type { AddressInput, OrderItemInput, OrderStatus } from "@/lib/types";

export async function createOrder({
  userId,
  address,
  items,
  notes,
}: {
  userId: string;
  address: AddressInput;
  items: OrderItemInput[];
  notes?: string;
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= 2000 ? 0 : 80;
  const total = subtotal + deliveryFee;

  return prisma.order.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      status: "PENDING",
      subtotal,
      deliveryFee,
      total,
      notes,
      address: {
        create: {
          address: address.address,
          latitude: address.latitude,
          longitude: address.longitude,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
      items: {
        create: items.map((item) => ({
          menuItem: {
            connect: {
              id: item.menuItemId,
            },
          },
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      },
    },
  });
}

export async function updateOrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: { include: { menuItem: true } },
      address: true,
    },
  });
}
