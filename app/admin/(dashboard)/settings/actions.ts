"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";

async function getRestaurantId() {
  const supabase = createClient();
  const { data } = await supabase.from("restaurants").select("id").eq("slug", RESTAURANT_SLUG).single();
  return data?.id as string | undefined;
}

export type SettingsInput = {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  mapsUrl: string;
  logoUrl: string | null;
  coverUrl: string | null;
};

function revalidateStorefront() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/about");
}

export async function updateSettings(input: SettingsInput) {
  const supabase = createClient();
  const restaurantId = await getRestaurantId();
  if (!restaurantId) return { error: "تعذر تحديد المطعم" };

  const [{ error: restaurantError }, { error: settingsError }] = await Promise.all([
    supabase.from("restaurants").update({ name: input.name.trim() }).eq("id", restaurantId),
    supabase
      .from("restaurant_settings")
      .update({
        description: input.description.trim() || null,
        phone: input.phone.trim() || null,
        whatsapp: input.whatsapp.trim() || null,
        instagram: input.instagram.trim() || null,
        address: input.address.trim() || null,
        maps_url: input.mapsUrl.trim() || null,
        logo_url: input.logoUrl,
        cover_url: input.coverUrl,
      })
      .eq("restaurant_id", restaurantId),
  ]);

  if (restaurantError || settingsError) return { error: "حدث خطأ أثناء حفظ الإعدادات" };

  revalidateStorefront();
  return { success: true };
}

export type OpeningHourInput = {
  id: string;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export async function updateOpeningHours(hours: OpeningHourInput[]) {
  const supabase = createClient();

  const results = await Promise.all(
    hours.map((h) =>
      supabase
        .from("opening_hours")
        .update({ open_time: h.isClosed ? null : h.openTime, close_time: h.isClosed ? null : h.closeTime, is_closed: h.isClosed })
        .eq("id", h.id)
    )
  );

  if (results.some((r) => r.error)) return { error: "حدث خطأ أثناء حفظ أوقات العمل" };

  revalidateStorefront();
  return { success: true };
}
