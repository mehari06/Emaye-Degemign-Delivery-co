import { NextResponse } from "next/server";
import { verifyTelegramSession } from "@/lib/telegram";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  const secret = process.env.TELEGRAM_SESSION_SECRET ?? "";
  if (!secret) {
    return NextResponse.json(
      { error: "Telegram session secret is not configured" },
      { status: 500 },
    );
  }

  const payload = verifyTelegramSession(token, secret);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL("/profile", request.url));
  response.cookies.set("telegram_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

