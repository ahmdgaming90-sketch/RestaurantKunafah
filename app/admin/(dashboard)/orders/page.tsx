import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";
import OrderManager, { type OrderWithItems } from "@/components/OrderManager";
import { updateOrderStatus } from "./actions";

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();

  if (!restaurant) {
    return <p className="text-sm text-espresso/60">تعذر تحميل بيانات المطعم.</p>;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*, order_item_addons(*))")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">حدث خطأ أثناء تحميل الطلبات.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">الطلبات</h1>
      <OrderManager orders={(orders ?? []) as OrderWithItems[]} updateOrderStatus={updateOrderStatus} />
    </div>
  );
}
