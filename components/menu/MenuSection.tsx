"use client";

import * as React from "react";
import type { Category, MenuItem } from "@/lib/types";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { FoodCard } from "@/components/menu/FoodCard";

export function MenuSection({
  categories,
  items,
}: {
  categories: Category[];
  items: MenuItem[];
}) {
  const [activeId, setActiveId] = React.useState(categories[0]?.id ?? "");

  const filtered = React.useMemo(
    () => items.filter((item) => item.category === activeId),
    [items, activeId],
  );

  return (
    <div className="flex flex-col gap-8">
      <CategoryTabs
        categories={categories}
        activeId={activeId}
        onChange={setActiveId}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
