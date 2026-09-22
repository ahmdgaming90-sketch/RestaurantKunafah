"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/whatsapp";

type LastOrder = { orderNumber: string; total: number; waLink: string | null };

const LAST_ORDER_KEY = "kunafa-sokara-last-order";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  if (loaded && !order) {
    return (
      <main className="container-content flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-sm text-espresso/60">لا يوجد طلب حديث لعرضه.</p>
        <Link href="/menu" className="btn-primary">
          تصفح المنيو
        </Link>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="container-content flex flex-col items-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 12.5 9.5 17 19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-espresso">تم إنشاء طلبك</h1>
      <p className="max-w-sm text-sm leading-relaxed text-espresso/60">
        تم إنشاء الطلب، أرسل الطلب عبر واتساب للمطعم لإكماله.
      </p>

      <div className="rounded-2xl border border-espresso/10 bg-paper px-8 py-5">
        <p className="text-xs text-espresso/50">رقم الطلب</p>
        <p className="mt-1 text-xl font-semibold tracking-wide text-espresso" dir="ltr">
          {order.orderNumber}
        </p>
        <p className="mt-2 text-sm font-semibold text-gold">{formatPrice(order.total)}</p>
      </div>

      {order.waLink ? (
        <a href={order.waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          إرسال الطلب عبر واتساب
        </a>
      ) : (
        <p className="text-xs text-espresso/40">رقم واتساب المطعم غير متوفر حاليًا، الرجاء التواصل مباشرة.</p>
      )}

      <Link href="/" className="text-sm text-espresso/50 hover:text-gold">
        العودة للصفحة الرئيسية
      </Link>
    </main>
  );
}
