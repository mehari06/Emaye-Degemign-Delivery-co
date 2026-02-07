import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  );
}

