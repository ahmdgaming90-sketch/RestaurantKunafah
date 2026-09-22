import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";
import type { Category } from "@/types/database";
import CategoryManager from "@/components/CategoryManager";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();

  const { data: categories } = restaurant
    ? await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">الأقسام</h1>
      <CategoryManager
        categories={(categories ?? []) as Category[]}
        actions={{ createCategory, updateCategory, deleteCategory }}
      />
    </div>
  );
}
