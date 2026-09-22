import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import CartButton from "@/components/CartButton";
import InstallPrompt from "@/components/InstallPrompt";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "كنافة سكره | كنافة وحلويات في جدة",
    template: "%s | كنافة سكره",
  },
  description: "كنافة سكره في جدة — كنافة وحلويات ومشروبات في البغدادية الغربية.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "كنافة سكره",
  },
  openGraph: {
    title: "كنافة سكره",
    description: "كنافة وحلويات في جدة — حي البغدادية الغربية.",
    locale: "ar_SA",
    type: "website",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#241A16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={notoKufiArabic.variable}>
      <body className="font-arabic antialiased">
        <CartProvider>
          {children}
          <CartButton />
          <InstallPrompt />
        </CartProvider>
      </body>
    </html>
  );
}
