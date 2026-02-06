"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TelegramLoginButton } from "@/components/forms/TelegramLoginButton";

export function AuthButtons() {
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleGoogleLogin} disabled={isLoading}>
        Continue with Google
      </Button>
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Continue with Telegram
        </p>
        <TelegramLoginButton />
      </div>
    </div>
  );
}
