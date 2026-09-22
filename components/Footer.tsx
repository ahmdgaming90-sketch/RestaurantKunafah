import Link from "next/link";
import type { RestaurantSettings } from "@/types/database";

export default function Footer({ restaurantName, settings }: { restaurantName: string; settings: RestaurantSettings | null }) {
  return (
    <footer className="border-t border-espresso/10 bg-cream">
      <div className="container-content grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-espresso">{restaurantName}</p>
          {settings?.description ? <p className="mt-2 text-sm text-espresso/60">{settings.description}</p> : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-espresso">روابط</p>
          <ul className="space-y-2 text-sm text-espresso/60">
            <li><Link href="/menu" className="hover:text-gold">المنيو</Link></li>
            <li><Link href="/about" className="hover:text-gold">من نحن</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-espresso">تواصل معنا</p>
          <ul className="space-y-2 text-sm text-espresso/60">
            {settings?.phone ? <li>{settings.phone}</li> : null}
            {settings?.address ? <li>{settings.address}</li> : null}
            {settings?.instagram ? (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  @{settings.instagram}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso/10 py-5 text-center text-xs text-espresso/40">
        © {new Date().getFullYear()} {restaurantName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
