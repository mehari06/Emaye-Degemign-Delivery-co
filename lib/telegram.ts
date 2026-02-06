import crypto from "crypto";

export type TelegramAuthPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export function verifyTelegramAuth(
  payload: TelegramAuthPayload,
  botToken: string,
) {
  const { hash, ...data } = payload;
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${String((data as Record<string, unknown>)[key])}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return signature === hash;
}

export function createTelegramSession(
  payload: TelegramAuthPayload,
  secret: string,
  userId: string,
) {
  const userName = [payload.first_name, payload.last_name].filter(Boolean).join(" ");
  const data = {
    userId,
    telegramId: String(payload.id),
    telegramUsername: payload.username ?? "",
    name: userName,
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return { token: `${encoded}.${signature}`, data };
}

export function verifyTelegramSession(token: string, secret: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (expected !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      userId: string;
      telegramId: string;
      telegramUsername: string;
      name: string;
    };
    return payload;
  } catch {
    return null;
  }
}
