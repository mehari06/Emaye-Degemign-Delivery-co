import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/client";
import { createTelegramSession, type TelegramAuthPayload } from "@/lib/telegram";
import { formatCurrency, formatDate } from "@/lib/utils";
import { addCartItem, clearCart, getCartWithItems } from "@/lib/services/cart";
import { createOrder, getOrdersForUser } from "@/lib/services/orders";
import { initializeChapa } from "@/lib/services/chapa";

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
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  callback_query?: {
    id: string;
    from?: {
      id: number;
      is_bot?: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    message?: {
      message_id: number;
      chat: { id: number; type: string };
    };
    data?: string;
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
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

async function editTelegramMessage({
  botToken,
  chatId,
  messageId,
  text,
  replyMarkup,
}: {
  botToken: string;
  chatId: number;
  messageId: number;
  text: string;
  replyMarkup?: unknown;
}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      reply_markup: replyMarkup,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram editMessageText failed: ${response.status} ${body}`);
  }
}

async function answerCallbackQuery({
  botToken,
  callbackQueryId,
  text,
}: {
  botToken: string;
  callbackQueryId: string;
  text?: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram answerCallbackQuery failed: ${response.status} ${body}`);
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function extractLatLngFromText(text: string) {
  const raw = text.trim();

  const candidates: Array<{ lat: number; lng: number }> = [];

  const simple = raw.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (simple) {
    candidates.push({ lat: Number(simple[1]), lng: Number(simple[2]) });
  }

  const geo = raw.match(/geo:(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/i);
  if (geo) {
    candidates.push({ lat: Number(geo[1]), lng: Number(geo[2]) });
  }

  const qParam = raw.match(/[?&](?:q|ll)=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/i);
  if (qParam) {
    candidates.push({ lat: Number(qParam[1]), lng: Number(qParam[2]) });
  }

  const at = raw.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (at) {
    candidates.push({ lat: Number(at[1]), lng: Number(at[2]) });
  }

  for (const candidate of candidates) {
    if (
      Number.isFinite(candidate.lat) &&
      Number.isFinite(candidate.lng) &&
      Math.abs(candidate.lat) <= 90 &&
      Math.abs(candidate.lng) <= 180
    ) {
      return candidate;
    }
  }

  return null;
}

async function ensureTelegramUser({
  telegramId,
  telegramUsername,
  name,
}: {
  telegramId: string;
  telegramUsername: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { telegramId },
    select: { id: true, phoneVerified: true },
  });

  const userId = existing?.id ?? crypto.randomUUID();
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name,
      telegramId,
      telegramUsername,
      provider: "TELEGRAM",
    },
    create: {
      id: userId,
      name,
      telegramId,
      telegramUsername,
      provider: "TELEGRAM",
    },
  });

  return { userId, phoneVerified: existing?.phoneVerified ?? false };
}

function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "Browse menu", callback_data: "menu" }],
      [
        { text: "My cart", callback_data: "cart" },
        { text: "My orders", callback_data: "orders" },
      ],
    ],
  };
}

async function renderCategoriesKeyboard() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return { text: "No categories found yet.", replyMarkup: mainMenuKeyboard() };
  }

  return {
    text: "Choose a category:",
    replyMarkup: {
      inline_keyboard: [
        ...categories.map((category) => [
          { text: category.name, callback_data: `cat:${category.id}` },
        ]),
        [{ text: "Back", callback_data: "home" }],
      ],
    },
  };
}

async function renderCategoryItemsKeyboard(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true },
  });
  if (!category) {
    return { text: "Category not found.", replyMarkup: mainMenuKeyboard() };
  }

  const items = await prisma.menuItem.findMany({
    where: { categoryId, isAvailable: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true },
  });

  if (items.length === 0) {
    return {
      text: `No available items in ${category.name} yet.`,
      replyMarkup: {
        inline_keyboard: [
          [{ text: "Back to categories", callback_data: "menu" }],
          [{ text: "Home", callback_data: "home" }],
        ],
      },
    };
  }

  const lines = [`${category.name} (tap to add):`];
  for (const item of items.slice(0, 30)) {
    lines.push(`- ${item.name} — ${formatCurrency(item.price)}`);
  }

  return {
    text: lines.join("\n"),
    replyMarkup: {
      inline_keyboard: [
        ...items.slice(0, 12).map((item) => [
          { text: `Add ${item.name} (${formatCurrency(item.price)})`, callback_data: `add:${item.id}` },
        ]),
        [{ text: "My cart", callback_data: "cart" }],
        [{ text: "Back to categories", callback_data: "menu" }],
      ],
    },
  };
}

async function renderCart(userId: string) {
  const cart = await getCartWithItems(userId);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return {
      text: "Your cart is empty. Browse the menu to add items.",
      replyMarkup: mainMenuKeyboard(),
    };
  }

  const subtotal = items.reduce(
    (sum, entry) => sum + entry.menuItem.price * entry.quantity,
    0,
  );
  const deliveryFee = subtotal >= 2000 ? 0 : 80;
  const total = subtotal + deliveryFee;

  const lines = ["Your cart:", ""];
  for (const entry of items) {
    lines.push(
      `- ${entry.menuItem.name} x ${entry.quantity} = ${formatCurrency(
        entry.menuItem.price * entry.quantity,
      )}`,
    );
  }
  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
  lines.push(`Delivery: ${formatCurrency(deliveryFee)}`);
  lines.push(`Total: ${formatCurrency(total)}`);

  return {
    text: lines.join("\n"),
    replyMarkup: {
      inline_keyboard: [
        [{ text: "Checkout (share location)", callback_data: "checkout" }],
        [
          { text: "Clear cart", callback_data: "clear_cart" },
          { text: "Browse menu", callback_data: "menu" },
        ],
        [{ text: "Home", callback_data: "home" }],
      ],
    },
  };
}

async function renderOrders(userId: string) {
  const orders = await getOrdersForUser(userId);
  if (orders.length === 0) {
    return { text: "No orders yet.", replyMarkup: mainMenuKeyboard() };
  }

  const lines = ["Your recent orders:"];
  for (const order of orders.slice(0, 5)) {
    lines.push(
      `- #${order.id.slice(0, 6).toUpperCase()} • ${order.status} • ${formatCurrency(
        order.total,
      )} • ${formatDate(order.createdAt)}`,
    );
  }

  return { text: lines.join("\n"), replyMarkup: mainMenuKeyboard() };
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

  if (update.callback_query?.data && update.callback_query.message?.chat?.id) {
    const chatId = update.callback_query.message.chat.id;
    const messageId = update.callback_query.message.message_id;
    const from = update.callback_query.from;
    const data = update.callback_query.data;

    if (!from) return NextResponse.json({ ok: true });

    const telegramId = String(from.id);
    const telegramUsername = from.username ?? "";
    const name = [from.first_name, from.last_name].filter(Boolean).join(" ");

    const { userId, phoneVerified } = await ensureTelegramUser({
      telegramId,
      telegramUsername,
      name,
    });

    await answerCallbackQuery({
      botToken,
      callbackQueryId: update.callback_query.id,
    });

    if (!phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact to continue.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (data === "home") {
      await editTelegramMessage({
        botToken,
        chatId,
        messageId,
        text: "Welcome! What would you like to do?",
        replyMarkup: mainMenuKeyboard(),
      });
      return NextResponse.json({ ok: true });
    }

    if (data === "menu") {
      const { text, replyMarkup } = await renderCategoriesKeyboard();
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cat:")) {
      const categoryId = data.slice("cat:".length);
      const { text, replyMarkup } = await renderCategoryItemsKeyboard(categoryId);
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("add:")) {
      const menuItemId = data.slice("add:".length);
      await addCartItem({ userId, menuItemId, quantity: 1 });
      const { text, replyMarkup } = await renderCart(userId);
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data === "cart") {
      const { text, replyMarkup } = await renderCart(userId);
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data === "clear_cart") {
      await clearCart(userId);
      const { text, replyMarkup } = await renderCart(userId);
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data === "orders") {
      const { text, replyMarkup } = await renderOrders(userId);
      await editTelegramMessage({ botToken, chatId, messageId, text, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    if (data === "checkout") {
      await sendTelegramMessage({
        botToken,
        chatId,
        text:
          "Please share your delivery location.\n\n" +
          "If you're on Telegram Desktop (location sharing may be unavailable), paste a Google Maps link or coordinates like:\n" +
          "- 9.0192, 38.7525",
        replyMarkup: {
          keyboard: [[{ text: "Share location", request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    await editTelegramMessage({
      botToken,
      chatId,
      messageId,
      text: "Command not recognized.",
      replyMarkup: mainMenuKeyboard(),
    });

    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const from = message.from;
  if (!from) return NextResponse.json({ ok: true });

  const telegramId = String(from.id);
  const telegramUsername = from.username ?? "";
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");

  const { userId } = await ensureTelegramUser({
    telegramId,
    telegramUsername,
    name,
  });

  const text = message.text ?? "";
  if (text.startsWith("/start")) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });

    if (user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Welcome back! What would you like to do?",
        replyMarkup: mainMenuKeyboard(),
      });
      return NextResponse.json({ ok: true });
    }

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

  if (text === "/menu" || text.toLowerCase() === "menu") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });
    if (!user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact to continue.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }
    const { text: menuText, replyMarkup } = await renderCategoriesKeyboard();
    await sendTelegramMessage({ botToken, chatId, text: menuText, replyMarkup });
    return NextResponse.json({ ok: true });
  }

  if (text === "/cart") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });
    if (!user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact to continue.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }
    const { text: cartText, replyMarkup } = await renderCart(userId);
    await sendTelegramMessage({ botToken, chatId, text: cartText, replyMarkup });
    return NextResponse.json({ ok: true });
  }

  if (text === "/orders") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });
    if (!user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact to continue.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }
    const { text: ordersText, replyMarkup } = await renderOrders(userId);
    await sendTelegramMessage({ botToken, chatId, text: ordersText, replyMarkup });
    return NextResponse.json({ ok: true });
  }

  const location = message.location;
  if (location?.latitude && location.longitude) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });

    if (!user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact first.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    const cart = await getCartWithItems(userId);
    const cartItems = cart?.items ?? [];
    if (cartItems.length === 0) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Your cart is empty. Browse the menu to add items first.",
        replyMarkup: mainMenuKeyboard(),
      });
      return NextResponse.json({ ok: true });
    }

    const itemsForOrder = cartItems.map((entry) => ({
      menuItemId: entry.menuItemId,
      name: entry.menuItem.name,
      price: entry.menuItem.price,
      quantity: entry.quantity,
    }));

    const order = await createOrder({
      userId,
      address: {
        address: "Shared via Telegram location",
        latitude: location.latitude,
        longitude: location.longitude,
      },
      items: itemsForOrder,
      notes: "Ordered via Telegram bot",
    });

    await clearCart(userId);

    await sendTelegramMessage({
      botToken,
      chatId,
      text: `Order placed! ✅\nOrder #${order.id.slice(0, 6).toUpperCase()}\nStatus: ${order.status}\nTotal: ${formatCurrency(order.total)}`,
      replyMarkup: { remove_keyboard: true },
    });

    try {
      const chapaResult = await initializeChapa({
        amount: order.total,
        email: from.username ? `${from.username}@telegram.com` : "customer@telegram.com",
        first_name: from.first_name,
        last_name: from.last_name || "",
        orderId: order.id,
      });

      await sendTelegramMessage({
        botToken,
        chatId,
        text: "You can pay now via Telebirr or CBE Birr using Chapa secure gateway:",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "💳 Pay Now (ETB)", url: chapaResult.checkout_url }],
            [{ text: "🏠 Home", callback_data: "home" }],
          ],
        },
      });
    } catch (chapaError) {
      console.error("Telegram Chapa Init Error:", chapaError);
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "What next?",
        replyMarkup: mainMenuKeyboard(),
      });
    }

    return NextResponse.json({ ok: true });
  }

  const maybeLatLng = extractLatLngFromText(text);
  if (maybeLatLng) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true },
    });

    if (!user?.phoneVerified) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Please share your contact first.",
        replyMarkup: {
          keyboard: [[{ text: "Share my phone number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    const cart = await getCartWithItems(userId);
    const cartItems = cart?.items ?? [];
    if (cartItems.length === 0) {
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Your cart is empty. Browse the menu to add items first.",
        replyMarkup: mainMenuKeyboard(),
      });
      return NextResponse.json({ ok: true });
    }

    const itemsForOrder = cartItems.map((entry) => ({
      menuItemId: entry.menuItemId,
      name: entry.menuItem.name,
      price: entry.menuItem.price,
      quantity: entry.quantity,
    }));

    const order = await createOrder({
      userId,
      address: {
        address: "Shared via Telegram map link",
        latitude: maybeLatLng.lat,
        longitude: maybeLatLng.lng,
      },
      items: itemsForOrder,
      notes: "Ordered via Telegram bot",
    });

    await clearCart(userId);

    await sendTelegramMessage({
      botToken,
      chatId,
      text: `Order placed! ✅\nOrder #${order.id.slice(0, 6).toUpperCase()}\nStatus: ${order.status}\nTotal: ${formatCurrency(order.total)}`,
      replyMarkup: { remove_keyboard: true },
    });

    try {
      const chapaResult = await initializeChapa({
        amount: order.total,
        email: from.username ? `${from.username}@telegram.com` : "customer@telegram.com",
        first_name: from.first_name,
        last_name: from.last_name || "",
        orderId: order.id,
      });

      await sendTelegramMessage({
        botToken,
        chatId,
        text: "You can pay now via Telebirr or CBE Birr using Chapa secure gateway:",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "💳 Pay Now (ETB)", url: chapaResult.checkout_url }],
            [{ text: "🏠 Home", callback_data: "home" }],
          ],
        },
      });
    } catch (chapaError) {
      console.error("Telegram Chapa Init Error:", chapaError);
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "What next?",
        replyMarkup: mainMenuKeyboard(),
      });
    }

    return NextResponse.json({ ok: true });
  }

  const contact = message.contact;
  if (!contact?.phone_number) return NextResponse.json({ ok: true });

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

  await sendTelegramMessage({
    botToken,
    chatId,
    text: "Welcome! What would you like to do?",
    replyMarkup: mainMenuKeyboard(),
  });

  return NextResponse.json({ ok: true });
}
