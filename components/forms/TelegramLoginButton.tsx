"use client";

import * as React from "react";
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

  const cleanUsername = botUsername.replace(/^@/, "");
  const tgDeepLink = `tg://resolve?domain=${cleanUsername}&start=login`;
  const webLink = `https://t.me/${cleanUsername}?start=login`;

  const handleOpenTelegram = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    // Try to open the Telegram app first; fallback to web if it fails.
    window.location.href = tgDeepLink;
    window.setTimeout(() => {
      window.open(webLink, "_blank", "noreferrer");
    }, 600);
  };

  return (
    <div className="space-y-2">
      <a
        href={webLink}
        onClick={handleOpenTelegram}
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
