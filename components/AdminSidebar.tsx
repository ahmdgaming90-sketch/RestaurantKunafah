"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الأقسام" },
  { href: "/admin/settings", label: "إعدادات المطعم" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-l border-espresso/10 bg-paper sm:block">
        <div className="p-5">
          <p className="text-sm font-semibold text-espresso">لوحة الإدارة</p>
          <p className="mt-0.5 text-xs text-espresso/40">كنافة سكره</p>
        </div>
        <nav className="space-y-1 px-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                pathname === link.href ? "bg-espresso text-paper" : "text-espresso/70 hover:bg-espresso/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 block w-full rounded-lg px-3 py-2.5 text-right text-sm text-espresso/50 hover:bg-espresso/5"
          >
            تسجيل الخروج
          </button>
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-espresso/10 bg-paper py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
              pathname === link.href ? "text-gold" : "text-espresso/50"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-2 py-1 text-[11px] text-espresso/50">
          خروج
        </button>
      </nav>
    </>
  );
}
