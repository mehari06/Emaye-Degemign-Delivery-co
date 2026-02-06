"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand",
        className,
      )}
      aria-hidden="true"
    />
  );
}
