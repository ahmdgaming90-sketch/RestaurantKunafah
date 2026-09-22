import Image from "next/image";
import { formatPrice } from "@/lib/whatsapp";
import type { Product } from "@/types/database";

export default function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-paper text-right transition-shadow hover:shadow-lg hover:shadow-espresso/5"
    >
      <div className="relative aspect-square w-full bg-cream">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gold">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M4 7a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
              <circle cx="12" cy="13" r="3.2" />
            </svg>
            <span className="text-xs text-espresso/40">كنافة سكره</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-semibold text-espresso">{product.name}</h3>
        {product.description ? (
          <p className="line-clamp-2 text-sm text-espresso/60">{product.description}</p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-semibold text-gold">{formatPrice(product.price)}</span>
      </div>
    </button>
  );
}
