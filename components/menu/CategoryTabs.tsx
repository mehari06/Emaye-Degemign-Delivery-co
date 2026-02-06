"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryTabs({
  categories,
  activeId,
  onChange,
}: {
  categories: Category[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={cn(
            "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeId === category.id
              ? "border-brand bg-brand text-white shadow-soft"
              : "border-border bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
          )}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
