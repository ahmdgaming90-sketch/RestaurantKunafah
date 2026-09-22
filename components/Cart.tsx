"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/whatsapp";
import CartItem from "@/components/CartItem";

export default function Cart({ onClose }: { onClose: () => void }) {
  const { lines, totalPrice } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/40 sm:items-center" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-paper sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
          <h2 className="text-base font-semibold text-espresso">سلتك</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-espresso/50 hover:text-espresso">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-espresso/50">السلة فارغة حاليًا.</p>
          ) : (
            lines.map((line) => <CartItem key={line.lineId} line={line} />)
          )}
        </div>

        {lines.length > 0 ? (
          <div className="space-y-3 border-t border-espresso/10 p-6">
            <div className="flex items-center justify-between text-sm font-semibold text-espresso">
              <span>الإجمالي</span>
              <span className="text-gold">{formatPrice(totalPrice)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="btn-primary block w-full text-center">
              إتمام الطلب
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
