import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/client";
import {
  createTelegramSession,
  verifyTelegramAuth,
  type TelegramAuthPayload,
} from "@/lib/telegram";
import { upsertTelegramUser } from "@/lib/services/users";

export async function POST(request: Request) {
  const payload = (await request.json()) as TelegramAuthPayload;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const sessionSecret = process.env.TELEGRAM_SESSION_SECRET;

  if (!botToken || !sessionSecret) {
    return NextResponse.json(
      { error: "Telegram auth is not configured" },
      { status: 500 },
    );
  }

  if (!verifyTelegramAuth(payload, botToken)) {
    return NextResponse.json({ error: "Invalid Telegram payload" }, { status: 401 });
  }

  const telegramId = String(payload.id);
  const existing = await prisma.user.findFirst({
    where: { telegramId },
  });

  const userId = existing?.id ?? crypto.randomUUID();
  const name = [payload.first_name, payload.last_name].filter(Boolean).join(" ");

  await upsertTelegramUser({
    userId,
    name,
    telegramId,
    telegramUsername: payload.username,
  });

  const session = createTelegramSession(payload, sessionSecret, userId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("telegram_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
