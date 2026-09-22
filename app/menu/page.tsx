import type { Metadata } from "next";
import { getRestaurantBundle } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";

export const metadata: Metadata = {
  title: "المنيو",
  description: "منيو كنافة سكره — كنافة وحلويات في جدة.",
};

export const revalidate = 60;

export default async function MenuPage() {
  const { restaurant, settings, categories, products, addonsByProduct } = await getRestaurantBundle();
  const restaurantName = restaurant?.name ?? "كنافة سكره";

  return (
    <>
      <Header restaurantName={restaurantName} whatsappNumber={settings?.whatsapp ?? null} />
      <main className="container-content py-10 sm:py-14">
        <h1 className="mb-8 text-2xl font-semibold text-espresso">المنيو</h1>
        <CategoryTabs categories={categories} products={products} addonsByProduct={addonsByProduct} />
      </main>
      <Footer restaurantName={restaurantName} settings={settings} />
    </>
  );
}
