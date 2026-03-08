import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { verifyTelegramSession } from "@/lib/telegram";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    let dbUser: { name: string | null; email: string | null; phone: string | null } | null =
      null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { name: true, email: true, phone: true },
      });
    } catch {
      dbUser = null;
    }
    return {
      id: data.user.id,
      name:
        (dbUser?.name as string | undefined) ??
        (data.user.user_metadata?.full_name as string | undefined),
      email: data.user.email ?? dbUser?.email ?? undefined,
      phone: dbUser?.phone ?? undefined,
      provider: "GOOGLE",
    };
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("telegram_session")?.value;
  const secret = process.env.TELEGRAM_SESSION_SECRET ?? "";
  if (!session || !secret) return null;

  const payload = verifyTelegramSession(session, secret);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, phone: true, telegramUsername: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name ?? payload.name,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      telegramUsername: user.telegramUsername ?? payload.telegramUsername,
      provider: "TELEGRAM",
    };
  } catch {
    return {
      id: payload.userId,
      name: payload.name,
      telegramUsername: payload.telegramUsername,
      provider: "TELEGRAM",
    };
  }
}

function parseCommaSeparatedEnv(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/[,\n]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isAdminUser(
  user:
    | {
      id: string;
      email?: string;
      telegramUsername?: string;
      telegramId?: string;
    }
    | null,
) {
  if (!user) return false;

  const adminUserIds = new Set(parseCommaSeparatedEnv(process.env.ADMIN_USER_IDS));
  if (adminUserIds.size > 0 && adminUserIds.has(user.id)) return true;

  const adminEmails = new Set(
    parseCommaSeparatedEnv(process.env.ADMIN_EMAILS).map((email) => email.toLowerCase()),
  );
  if (adminEmails.size > 0 && user.email && adminEmails.has(user.email.toLowerCase())) {
    return true;
  }

  const telegramUsernames = new Set(
    parseCommaSeparatedEnv(process.env.ADMIN_TELEGRAM_USERNAMES).map((name) =>
      name.replace(/^@/, "").toLowerCase(),
    ),
  );
  const maybeTelegramUsername = user.telegramUsername;
  if (
    telegramUsernames.size > 0 &&
    maybeTelegramUsername &&
    telegramUsernames.has(maybeTelegramUsername.replace(/^@/, "").toLowerCase())
  ) {
    return true;
  }

  const telegramIds = new Set(parseCommaSeparatedEnv(process.env.ADMIN_TELEGRAM_IDS));
  const maybeTelegramId = user.telegramId;
  if (telegramIds.size > 0 && maybeTelegramId && telegramIds.has(maybeTelegramId)) {
    return true;
  }

  return false;
}

export function isDeliveryUser(user: any) {
  return (user as { role?: string })?.role === "DELIVERY";
}

export function isAnyStaff(user: any) {
  const role = (user as { role?: string })?.role;
  return role === "ADMIN" || role === "DELIVERY";
}
