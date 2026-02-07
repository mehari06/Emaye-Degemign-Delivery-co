"use client";

import { buttonStyles } from "@/components/ui/buttonStyles";

export function TelegramLoginButton() {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!botUsername) {
    return (
      <p className="text-xs text-slate-500">
        Add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME to enable Telegram login.
      </p>
    );
  }

  const telegramLink = `https://t.me/${botUsername}?start=login`;

  return (
    <div className="space-y-2">
      <a
        href={telegramLink}
        target="_blank"
        rel="noreferrer"
        className={buttonStyles({ variant: "secondary", size: "md" })}
      >
        Open Telegram bot
      </a>
      <p className="text-xs text-slate-500">
        Share your contact in Telegram, then tap the link the bot sends back to
        finish signing in.
      </p>
    </div>
  );
}
