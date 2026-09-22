import { formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart-context";
import type { CartLine } from "@/types/database";

export default function CartItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeLine } = useCart();
  const addonsTotal = line.addons.reduce((sum, a) => sum + a.price, 0);
  const lineTotal = (line.price + addonsTotal) * line.quantity;

  return (
    <div className="flex flex-col gap-2 border-b border-espresso/10 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-espresso">
            {line.name} <span className="text-espresso/50">× {line.quantity}</span>
          </p>
          {line.addons.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-xs text-espresso/60">
              {line.addons.map((a) => (
                <li key={a.id}>
                  {a.name} +{formatPrice(a.price)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-semibold text-gold">{formatPrice(lineTotal)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-espresso/10 px-1.5 py-0.5">
          <button
            onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
            aria-label="إنقاص الكمية"
            className="flex h-7 w-7 items-center justify-center rounded-full text-espresso hover:bg-espresso/5"
          >
            −
          </button>
          <span className="w-5 text-center text-xs font-semibold text-espresso">{line.quantity}</span>
          <button
            onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
            aria-label="زيادة الكمية"
            className="flex h-7 w-7 items-center justify-center rounded-full text-espresso hover:bg-espresso/5"
          >
            +
          </button>
        </div>
        <button onClick={() => removeLine(line.lineId)} className="text-xs text-espresso/50 hover:text-red-600">
          حذف
        </button>
      </div>
    </div>
  );
}
