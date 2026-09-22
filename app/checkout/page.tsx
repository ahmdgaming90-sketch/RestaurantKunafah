import type { Metadata } from "next";
import { getRestaurantBundle } from "@/lib/queries";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "إتمام الطلب | كنافة سكره",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { restaurant, settings } = await getRestaurantBundle();

  return (
    <main className="container-content py-10 sm:py-14">
      <h1 className="mb-8 text-2xl font-semibold text-espresso">إتمام الطلب</h1>
      <CheckoutClient
        restaurantName={restaurant?.name ?? "كنافة سكره"}
        whatsappNumber={settings?.whatsapp ?? null}
      />
    </main>
  );
}
