import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";
import type { Category, OpeningHour, Product, ProductAddon, Restaurant, RestaurantSettings } from "@/types/database";

export async function getRestaurantBundle() {
  const supabase = createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", RESTAURANT_SLUG)
    .single<Restaurant>();

  if (!restaurant) {
    return { restaurant: null, settings: null, categories: [], products: [], hours: [], addonsByProduct: {} };
  }

  const [{ data: settings }, { data: categories }, { data: products }, { data: hours }] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .single<RestaurantSettings>(),
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("available", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("opening_hours")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("day_of_week", { ascending: true }),
  ]);

  const productList = (products ?? []) as Product[];
  const addonsByProduct: Record<string, ProductAddon[]> = {};

  if (productList.length > 0) {
    const { data: addons } = await supabase
      .from("product_addons")
      .select("*")
      .in(
        "product_id",
        productList.map((p) => p.id)
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    for (const addon of (addons ?? []) as ProductAddon[]) {
      if (!addonsByProduct[addon.product_id]) addonsByProduct[addon.product_id] = [];
      addonsByProduct[addon.product_id].push(addon);
    }
  }

  return {
    restaurant,
    settings: settings ?? null,
    categories: (categories ?? []) as Category[],
    products: productList,
    hours: (hours ?? []) as OpeningHour[],
    addonsByProduct,
  };
}
