import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrder, getOrdersForUser } from "@/lib/services/orders";
import { upsertGoogleUser } from "@/lib/services/users";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.provider === "GOOGLE") {
    await upsertGoogleUser({
      userId: user.id,
      email: user.email ?? null,
      name: user.name ?? null,
    });
  }

  const payload = (await request.json()) as {
    items: { menuItemId: string; name: string; price: number; quantity: number }[];
    address: { address: string; latitude: number; longitude: number };
    notes?: string;
  };

  try {
    const order = await createOrder({
      userId: user.id,
      address: payload.address,
      items: payload.items,
      notes: payload.notes,
    });
    return NextResponse.json({ ok: true, orderId: order.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to create order" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getOrdersForUser(user.id);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch orders" },
      { status: 500 },
    );
  }
}
