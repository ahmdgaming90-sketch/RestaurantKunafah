import { createClient } from "@/lib/supabase/server";
import { RESTAURANT_SLUG } from "@/types/database";
import type { OpeningHour, Restaurant, RestaurantSettings as SettingsType } from "@/types/database";
import RestaurantSettingsForm from "@/components/RestaurantSettings";
import { updateSettings, updateOpeningHours } from "./actions";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("slug", RESTAURANT_SLUG).single<Restaurant>();

  if (!restaurant) {
    return <p className="text-sm text-espresso/60">تعذر تحميل بيانات المطعم.</p>;
  }

  const [{ data: settings }, { data: hours }] = await Promise.all([
    supabase.from("restaurant_settings").select("*").eq("restaurant_id", restaurant.id).single<SettingsType>(),
    supabase.from("opening_hours").select("*").eq("restaurant_id", restaurant.id).order("day_of_week", { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-espresso">إعدادات المطعم</h1>
      <RestaurantSettingsForm
        restaurant={restaurant}
        settings={settings ?? null}
        hours={(hours ?? []) as OpeningHour[]}
        actions={{ updateSettings, updateOpeningHours }}
      />
    </div>
  );
}
