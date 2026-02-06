import { prisma } from "@/lib/prisma/client";

export async function upsertTelegramUser({
  userId,
  name,
  telegramId,
  telegramUsername,
}: {
  userId: string;
  name: string;
  telegramId: string;
  telegramUsername?: string;
}) {
  return prisma.user.upsert({
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
}

export async function upsertGoogleUser({
  userId,
  email,
  name,
}: {
  userId: string;
  email?: string | null;
  name?: string | null;
}) {
  return prisma.user.upsert({
    where: { id: userId },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
      provider: "GOOGLE",
    },
    create: {
      id: userId,
      email: email ?? undefined,
      name: name ?? undefined,
      provider: "GOOGLE",
    },
  });
}

export async function updateUserProfile({
  userId,
  name,
  phone,
}: {
  userId: string;
  name?: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });

  const phoneChanged = typeof phone === "string" && phone !== (existing?.phone ?? null);

  return prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      ...(phoneChanged
        ? {
            phoneVerified: false,
            phoneVerifiedAt: null,
          }
        : {}),
    },
  });
}
