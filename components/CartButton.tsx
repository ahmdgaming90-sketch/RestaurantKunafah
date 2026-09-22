"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/whatsapp";
import Cart from "@/components/Cart";

export default function CartButton() {
  const { totalCount, totalPrice } = useCart();
  const [open, setOpen] = useState(false);

  if (totalCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full bg-espresso px-6 py-4 text-paper shadow-lg shadow-espresso/20 sm:inset-x-auto sm:left-8 sm:w-80"
      >
        <span className="text-sm font-medium">السلة · {totalCount}</span>
        <span className="text-sm font-semibold">{formatPrice(totalPrice)}</span>
      </button>
      {open ? <Cart onClose={() => setOpen(false)} /> : null}
    </>
  );
}
