"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";

async function getRestaurantId() {
  const supabase = createClient();
  const { data } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();
  return data?.id as string | undefined;
}

export async function createCategory(name: string) {
  const supabase = createClient();
  const restaurantId = await getRestaurantId();
  if (!restaurantId || !name.trim()) return { error: "بيانات غير صحيحة" };

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);

  const { error } = await supabase
    .from("categories")
    .insert({ restaurant_id: restaurantId, name: name.trim(), sort_order: count ?? 0 });

  if (error) return { error: "حدث خطأ أثناء إضافة القسم" };

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, name: string) {
  const supabase = createClient();
  if (!name.trim()) return { error: "الاسم مطلوب" };

  const { error } = await supabase.from("categories").update({ name: name.trim() }).eq("id", id);
  if (error) return { error: "حدث خطأ أثناء تعديل القسم" };

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: "حدث خطأ أثناء حذف القسم" };

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = createClient();
  await Promise.all(orderedIds.map((id, index) => supabase.from("categories").update({ sort_order: index }).eq("id", id)));

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  return { success: true };
}
