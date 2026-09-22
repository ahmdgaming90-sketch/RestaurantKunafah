import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";
import type { Category, Product, ProductAddon } from "@/types/database";
import ProductsListClient from "./ProductsListClient";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();

  if (!restaurant) {
    return <p className="text-sm text-espresso/60">تعذر تحميل بيانات المطعم.</p>;
  }

  const [{ data: products }, { data: categories }, { data: addons }] = await Promise.all([
    supabase.from("products").select("*").eq("restaurant_id", restaurant.id).order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order", { ascending: true }),
    supabase.from("product_addons").select("*").eq("restaurant_id", restaurant.id).order("sort_order", { ascending: true }),
  ]);

  const addonsByProduct: Record<string, ProductAddon[]> = {};
  for (const addon of (addons ?? []) as ProductAddon[]) {
    if (!addonsByProduct[addon.product_id]) addonsByProduct[addon.product_id] = [];
    addonsByProduct[addon.product_id].push(addon);
  }

  return (
    <ProductsListClient
      initialProducts={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
      addonsByProduct={addonsByProduct}
    />
  );
}
