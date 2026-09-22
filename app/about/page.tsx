import type { Metadata } from "next";
import { getRestaurantBundle } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RestaurantInfo from "@/components/RestaurantInfo";
import OpeningHours from "@/components/OpeningHours";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف على كنافة سكره — كنافة وحلويات في جدة.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const { restaurant, settings, hours } = await getRestaurantBundle();
  const restaurantName = restaurant?.name ?? "كنافة سكره";

  return (
    <>
      <Header restaurantName={restaurantName} whatsappNumber={settings?.whatsapp ?? null} />
      <main className="container-content py-10 sm:py-14">
        <h1 className="mb-6 text-2xl font-semibold text-espresso">من نحن</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-espresso/70">
          {settings?.description ?? "كنافة سكره — كنافة وحلويات طازجة في جدة."}
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-espresso">أوقات العمل</h2>
            <OpeningHours hours={hours} />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-espresso">الموقع والتواصل</h2>
            <RestaurantInfo settings={settings} />
          </div>
        </div>
      </main>
      <Footer restaurantName={restaurantName} settings={settings} />
    </>
  );
}
