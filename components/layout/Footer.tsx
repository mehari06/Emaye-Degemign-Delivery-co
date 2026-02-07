import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function Footer() {
  const user = await getCurrentUser();
  const showAdmin = isAdminUser(user);

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
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
      </Container>
    </footer>
  );
}
