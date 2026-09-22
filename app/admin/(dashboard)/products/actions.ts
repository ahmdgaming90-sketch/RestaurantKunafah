"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";

async function getRestaurantId() {
  const supabase = createClient();
  const { data } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();
  return data?.id as string | undefined;
}

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  imageUrl: string | null;
  available: boolean;
};

function revalidateStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function createProduct(input: ProductInput) {
  const supabase = createClient();
  const restaurantId = await getRestaurantId();
  if (!restaurantId || !input.name.trim()) return { error: "بيانات غير صحيحة" };

  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId);

  const { data, error } = await supabase
    .from("products")
    .insert({
      restaurant_id: restaurantId,
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      image_url: input.imageUrl,
      available: input.available,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) return { error: "حدث خطأ أثناء إضافة المنتج" };

  revalidateStorefront();
  return { success: true, id: data.id as string };
}

export async function updateProduct(id: string, input: ProductInput) {
  const supabase = createClient();
  if (!input.name.trim()) return { error: "الاسم مطلوب" };

  const { error } = await supabase
    .from("products")
    .update({
      category_id: input.categoryId,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      image_url: input.imageUrl,
      available: input.available,
    })
    .eq("id", id);

  if (error) return { error: "حدث خطأ أثناء تعديل المنتج" };

  revalidateStorefront();
  return { success: true };
}

export async function deleteProduct(id: string, imageUrl: string | null) {
  const supabase = createClient();

  if (imageUrl) {
    const path = imageUrl.split("/restaurant-media/")[1];
    if (path) await supabase.storage.from("restaurant-media").remove([path]);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "حدث خطأ أثناء حذف المنتج" };

  revalidateStorefront();
  return { success: true };
}

export async function toggleAvailability(id: string, available: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("products").update({ available }).eq("id", id);
  if (error) return { error: "حدث خطأ" };

  revalidateStorefront();
  return { success: true };
}

// ---- Addons ----

export type AddonInput = {
  name: string;
  price: number;
  isActive: boolean;
  selectionType: "single" | "multiple";
  isRequired: boolean;
};

export async function createAddon(productId: string, input: AddonInput) {
  const supabase = createClient();
  const restaurantId = await getRestaurantId();
  if (!restaurantId || !input.name.trim()) return { error: "بيانات غير صحيحة" };

  const { count } = await supabase.from("product_addons").select("id", { count: "exact", head: true }).eq("product_id", productId);

  const { data, error } = await supabase
    .from("product_addons")
    .insert({
      product_id: productId,
      restaurant_id: restaurantId,
      name: input.name.trim(),
      price: input.price,
      is_active: input.isActive,
      selection_type: input.selectionType,
      is_required: input.isRequired,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) return { error: "حدث خطأ أثناء إضافة الإضافة" };

  revalidateStorefront();
  return { success: true, id: data.id as string };
}

export async function updateAddon(id: string, input: AddonInput) {
  const supabase = createClient();
  const { error } = await supabase
    .from("product_addons")
    .update({
      name: input.name.trim(),
      price: input.price,
      is_active: input.isActive,
      selection_type: input.selectionType,
      is_required: input.isRequired,
    })
    .eq("id", id);

  if (error) return { error: "حدث خطأ أثناء تعديل الإضافة" };

  revalidateStorefront();
  return { success: true };
}

export async function deleteAddon(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("product_addons").delete().eq("id", id);
  if (error) return { error: "حدث خطأ أثناء حذف الإضافة" };

  revalidateStorefront();
  return { success: true };
}
