"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfile, upsertGoogleUser } from "@/lib/services/users";

const ProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
});

export async function updateProfileAction(payload: {
  name?: string;
  phone?: string;
}) {
  const parsed = ProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Invalid profile data" };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  try {
    if (user.provider === "GOOGLE") {
      await upsertGoogleUser({
        userId: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
      });
    }
    await updateUserProfile({
      userId: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
    });
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to update profile." };
  }
}
