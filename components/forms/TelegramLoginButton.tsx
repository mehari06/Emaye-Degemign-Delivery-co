"use client";

import * as React from "react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    handleTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

export function TelegramLoginButton() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!botUsername || !container) return;

    window.handleTelegramAuth = async (user) => {
      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        if (!response.ok) {
          throw new Error("Telegram login failed");
        }
        toast.success("Logged in with Telegram");
        window.location.reload();
      } catch {
        toast.error("Unable to log in with Telegram");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "handleTelegramAuth(user)");

    container.innerHTML = "";
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [botUsername]);

  if (!botUsername) {
    return (
      <p className="text-xs text-slate-500">
        Add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME to enable Telegram login.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
