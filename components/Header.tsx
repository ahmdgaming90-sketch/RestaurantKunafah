import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "المنيو" },
  { href: "/about", label: "من نحن" },
];

export default function Header({ restaurantName, whatsappNumber }: { restaurantName: string; whatsappNumber: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-cream/90 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-espresso">
          {restaurantName}
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-espresso/80 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {whatsappNumber ? (
          <WhatsAppButton whatsappNumber={whatsappNumber} label="اطلب الآن" className="hidden sm:inline-flex" />
        ) : null}

        {/* Mobile nav */}
        <nav className="flex items-center gap-4 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-espresso/80">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
