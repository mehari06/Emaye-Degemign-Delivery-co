"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  alt = "Emaye Degemign Delivery logo",
}: {
  className?: string;
  alt?: string;
}) {
  const [src, setSrc] = React.useState("/images/logo.svg");

  return (
    // We intentionally use <img> here so missing local files don't throw Next/Image errors in dev.
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setSrc("/images/logo-placeholder.svg")}
      loading="lazy"
      decoding="async"
    />
  );
}
