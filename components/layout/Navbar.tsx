"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { BrandLogo } from "@/components/layout/BrandLogo";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-white shadow-sm">
            <BrandLogo />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              Emaye Degemign
            </p>
            <p className="text-xs text-slate-500">Delivery Co</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-slate-600 transition hover:text-slate-900",
                pathname === link.href && "text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full border border-border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="View cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Cart</span>
            {totalItems > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
          <Link href="/menu" className={buttonStyles({ size: "sm" })}>
            Start Order
          </Link>
        </div>
      </div>
    </header>
  );
}
