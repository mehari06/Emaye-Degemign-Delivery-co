"use client";

import * as React from "react";
import type { ButtonSize, ButtonVariant } from "@/components/ui/buttonStyles";
import { buttonStyles } from "@/components/ui/buttonStyles";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
