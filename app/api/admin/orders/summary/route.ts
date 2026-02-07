import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  );
}

