import { getRestaurantBundle } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import RestaurantInfo from "@/components/RestaurantInfo";
import OpeningHours from "@/components/OpeningHours";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const { restaurant, settings, products, hours, addonsByProduct } = await getRestaurantBundle();

  const restaurantName = restaurant?.name ?? "كنافة سكره";
  const featured = products.slice(0, 4);

  const structuredData = restaurant
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurantName,
        image: settings?.logo_url ?? undefined,
        address: settings?.address
          ? { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "SA" }
          : undefined,
        telephone: settings?.phone ?? undefined,
        servesCuisine: "Dessert",
        priceRange: "$$",
      }
    : null;

  return (
    <>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      ) : null}

      <Header restaurantName={restaurantName} whatsappNumber={settings?.whatsapp ?? null} />

      <main>
        <Hero
          restaurantName={restaurantName}
          description={settings?.description ?? null}
          whatsappNumber={settings?.whatsapp ?? null}
          coverUrl={settings?.cover_url ?? null}
        />

        <section className="container-content py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-espresso">منتجات مميزة</h2>
            <Link href="/menu" className="text-sm font-medium text-gold hover:underline">
              عرض المنيو كاملًا
            </Link>
          </div>
          <ProductGrid products={featured} addonsByProduct={addonsByProduct} />
        </section>

        <section className="border-t border-espresso/10 bg-paper py-16">
          <div className="container-content grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-espresso">عن كنافة سكره</h2>
              <p className="text-sm leading-relaxed text-espresso/70">
                {settings?.description ?? "كنافة سكره — كنافة وحلويات طازجة في جدة."}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-espresso">أوقات العمل</h3>
                <OpeningHours hours={hours} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-espresso">الموقع والتواصل</h3>
                <RestaurantInfo settings={settings} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer restaurantName={restaurantName} settings={settings} />
    </>
  );
}
