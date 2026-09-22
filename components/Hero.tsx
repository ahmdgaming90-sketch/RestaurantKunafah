import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Hero({
  restaurantName,
  description,
  whatsappNumber,
  coverUrl,
}: {
  restaurantName: string;
  description: string | null;
  whatsappNumber: string | null;
  coverUrl: string | null;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
        aria-hidden="true"
      />
      <div className="container-content relative flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="text-xs uppercase tracking-[0.3em] text-gold">حلويات جدة</span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-espresso sm:text-5xl">
          {restaurantName}
        </h1>
        {description ? (
          <p className="max-w-xl text-base leading-relaxed text-espresso/70">{description}</p>
        ) : null}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/menu" className="btn-primary">
            عرض المنيو
          </Link>
          {whatsappNumber ? (
            <WhatsAppButton whatsappNumber={whatsappNumber} label="اطلب عبر واتساب" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
