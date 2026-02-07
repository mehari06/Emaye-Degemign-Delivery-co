import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/client";
import { createTelegramSession, type TelegramAuthPayload } from "@/lib/telegram";

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: { id: number; type: string };
    from?: {
      id: number;
      is_bot?: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
      vcard?: string;
    };
  };
};

async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  replyMarkup,
}: {
  botToken: string;
  chatId: number;
  text: string;
  replyMarkup?: unknown;
}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const sessionSecret = process.env.TELEGRAM_SESSION_SECRET ?? "";
  const appBaseUrl = process.env.APP_BASE_URL ?? "";
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

  if (!botToken || !sessionSecret || !appBaseUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "Telegram webhook is not configured" },
      { status: 500 },
    );
  }

  const incomingSecret =
    request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (incomingSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const from = message.from;
  if (!from) return NextResponse.json({ ok: true });

  const telegramId = String(from.id);
  const telegramUsername = from.username ?? "";
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");

  const text = message.text ?? "";
  if (text.startsWith("/start")) {
    await sendTelegramMessage({
      botToken,
      chatId,
      text: "Please share your contact to continue.",
      replyMarkup: {
        keyboard: [
          [
            {
              text: "Share my phone number",
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return NextResponse.json({ ok: true });
  }

  const contact = message.contact;
  if (!contact?.phone_number) return NextResponse.json({ ok: true });

  const existing = await prisma.user.findUnique({
    where: { telegramId },
    select: { id: true },
  });

  const userId = existing?.id ?? crypto.randomUUID();

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name,
      telegramId,
      telegramUsername,
      provider: "TELEGRAM",
      phone: normalizePhone(contact.phone_number),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
    create: {
      id: userId,
      name,
      telegramId,
      telegramUsername,
      provider: "TELEGRAM",
      phone: normalizePhone(contact.phone_number),
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });

  const payload: TelegramAuthPayload = {
    id: from.id,
    first_name: from.first_name,
    last_name: from.last_name,
    username: from.username,
    auth_date: Math.floor(Date.now() / 1000),
    hash: "",
  };

  const session = createTelegramSession(payload, sessionSecret, userId);
  const continueUrl = new URL("/api/auth/telegram/bot-session", appBaseUrl);
  continueUrl.searchParams.set("token", session.token);

  await sendTelegramMessage({
    botToken,
    chatId,
    text: `Your phone number is registered successfully, ${name}.\nTap to continue: ${continueUrl.toString()}`,
    replyMarkup: { remove_keyboard: true },
  });

  return NextResponse.json({ ok: true });
}

