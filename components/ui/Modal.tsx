"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: "center" | "bottom";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  variant = "center",
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "w-full max-w-lg rounded-2xl p-0 shadow-float backdrop:bg-slate-900/40",
        variant === "bottom" && "max-w-full rounded-b-none",
      )}
      onClose={onClose}
      onCancel={onClose}
    >
      <div
        className={cn(
          "relative flex flex-col gap-4 bg-white p-6",
          variant === "bottom" && "rounded-t-3xl",
        )}
      >
        <div className="flex items-center justify-between">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
