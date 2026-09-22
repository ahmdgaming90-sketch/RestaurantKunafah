import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();
  const restaurantId = restaurant?.id;

  const [{ count: productsCount }, { count: categoriesCount }, { count: newOrdersCount }, { count: ordersCount }] = restaurantId
    ? await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
        supabase.from("categories").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .eq("status", "new"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }];

  const stats = [
    { label: "المنتجات", value: productsCount ?? 0 },
    { label: "الأقسام", value: categoriesCount ?? 0 },
    { label: "طلبات جديدة", value: newOrdersCount ?? 0 },
    { label: "إجمالي الطلبات", value: ordersCount ?? 0 },
  ];

  const shortcuts = [
    { href: "/admin/products", label: "إضافة منتج" },
    { href: "/admin/orders", label: "عرض الطلبات" },
    { href: "/admin/categories", label: "إدارة الأقسام" },
    { href: "/admin/settings", label: "إعدادات المطعم" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">لوحة التحكم</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-espresso/10 bg-paper p-4">
            <p className="text-2xl font-semibold text-espresso">{stat.value}</p>
            <p className="mt-1 text-xs text-espresso/50">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-espresso">اختصارات</h2>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl border border-espresso/10 bg-paper p-4 text-sm font-medium text-espresso hover:border-gold"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
