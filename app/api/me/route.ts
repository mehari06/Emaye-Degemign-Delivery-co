import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    authenticated: Boolean(user),
    isAdmin: isAdminUser(user),
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          telegramUsername: user.provider === "TELEGRAM" ? user.telegramUsername : undefined,
          provider: user.provider,
        }
      : null,
  });
}
