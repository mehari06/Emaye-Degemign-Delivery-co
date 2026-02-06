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
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name ?? payload.name,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      provider: "TELEGRAM",
    };
  } catch {
    return {
      id: payload.userId,
      name: payload.name,
      provider: "TELEGRAM",
    };
  }
}
