import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { Linkedin, Phone, Send } from "lucide-react";

export async function Footer() {
  const user = await getCurrentUser();
  const showAdmin = isAdminUser(user);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-900">
            Emaye Degemign Delivery Co
          </p>
          <p className="text-sm text-slate-500">
            Warm meals, fast delivery, and thoughtful service.
          </p>
          <p className="text-xs text-slate-500">
            © {year} Emaye Degemign Delivery Co. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-slate-600 md:items-end">
          <div className="flex flex-wrap gap-4">
            <Link href="/menu" className="hover:text-slate-900">
              Menu
            </Link>
            <Link href="/orders" className="hover:text-slate-900">
              Orders
            </Link>
            <Link href="/profile" className="hover:text-slate-900">
              Profile
            </Link>
            {showAdmin ? (
              <Link href="/admin/orders" className="hover:text-slate-900">
                Admin
              </Link>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500">
            <p>
              Developer:{" "}
              <span className="font-semibold text-slate-700">
                Mehari Bereket
              </span>
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.linkedin.com/in/mehari-bereket-1a8371338"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-700"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://t.me/meha06"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-700"
              >
                <Send className="h-4 w-4" />
                Telegram
              </a>
              <a
                href="tel:0944160177"
                className="inline-flex items-center gap-1 hover:text-slate-700"
              >
                <Phone className="h-4 w-4" />
                0944160177
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
