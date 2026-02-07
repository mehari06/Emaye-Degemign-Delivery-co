import { prisma } from "@/lib/prisma/client";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartWithItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (cart) return cart;
  return getOrCreateCart(userId).then((created) =>
    prisma.cart.findUnique({
      where: { id: created.id },
      include: { items: { include: { menuItem: true } } },
    }),
  );
}

export async function addCartItem({
  userId,
  menuItemId,
  quantity = 1,
}: {
  userId: string;
  menuItemId: string;
  quantity?: number;
}) {
  const cart = await getOrCreateCart(userId);
  const clamped = Math.max(1, Math.min(50, quantity));

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    select: { id: true, quantity: true },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(50, existing.quantity + clamped) },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      menuItemId,
      quantity: clamped,
    },
  });
}

export async function setCartItemQuantity({
  userId,
  menuItemId,
  quantity,
}: {
  userId: string;
  menuItemId: string;
  quantity: number;
}) {
  const cart = await getOrCreateCart(userId);
  const clamped = Math.max(0, Math.min(50, quantity));

  if (clamped === 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, menuItemId },
    });
    return;
  }

  await prisma.cartItem.upsert({
    where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    update: { quantity: clamped },
    create: { cartId: cart.id, menuItemId, quantity: clamped },
  });
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

