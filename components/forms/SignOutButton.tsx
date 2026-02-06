"use client";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/telegram/logout", { method: "POST" });
    toast.success("Signed out");
    window.location.reload();
  };

  return (
    <Button variant="secondary" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
