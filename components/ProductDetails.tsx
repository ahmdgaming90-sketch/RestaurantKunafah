"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductAddon } from "@/types/database";

export default function ProductDetails({
  product,
  addons,
  onClose,
}: {
  product: Product;
  addons: ProductAddon[];
  onClose: () => void;
}) {
  const { addLine } = useCart();
  const isSingleSelect = addons.length > 0 && addons.every((a) => a.selection_type === "single");
  const hasRequiredAddon = addons.some((a) => a.is_required);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedAddons = useMemo(
    () => addons.filter((a) => selectedIds.includes(a.id)),
    [addons, selectedIds]
  );

  const unitPrice = product.price + selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalPrice = unitPrice * quantity;

  function toggleAddon(addon: ProductAddon) {
    if (isSingleSelect) {
      setSelectedIds([addon.id]);
      return;
    }
    setSelectedIds((prev) => (prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]));
  }

  function handleAdd() {
    if (hasRequiredAddon && selectedIds.length === 0) return;

    addLine({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity,
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    });
    setAdded(true);
    setTimeout(onClose, 600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/40 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl">
        <div className="relative aspect-[4/3] w-full bg-cream">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 32rem" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gold">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M4 7a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-espresso shadow"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-xl font-semibold text-espresso">{product.name}</h2>
            {product.description ? <p className="mt-1 text-sm text-espresso/60">{product.description}</p> : null}
            <p className="mt-2 text-sm font-semibold text-gold">{formatPrice(product.price)}</p>
          </div>

          {addons.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-espresso">
                الإضافات
                {hasRequiredAddon ? <span className="mr-1 text-xs font-normal text-espresso/50">(مطلوب اختيار)</span> : null}
              </h3>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const checked = selectedIds.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                        checked ? "border-gold bg-gold/5" : "border-espresso/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type={isSingleSelect ? "radio" : "checkbox"}
                          name="addon"
                          checked={checked}
                          onChange={() => toggleAddon(addon)}
                          className="h-4 w-4 accent-gold"
                        />
                        <span className="text-espresso">{addon.name}</span>
                      </span>
                      <span className="text-espresso/60">+{formatPrice(addon.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-espresso">الكمية</span>
            <div className="flex items-center gap-3 rounded-full border border-espresso/10 px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="إنقاص الكمية"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-espresso hover:bg-espresso/5"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-espresso">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="زيادة الكمية"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-espresso hover:bg-espresso/5"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={hasRequiredAddon && selectedIds.length === 0}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? "تمت الإضافة" : `أضف إلى السلة · ${formatPrice(finalPrice)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
