import { formatPrice } from "@/lib/whatsapp";
import type { CartLine } from "@/types/database";

export default function OrderSummary({ lines, total }: { lines: CartLine[]; total: number }) {
  return (
    <div className="space-y-4 rounded-2xl border border-espresso/10 bg-paper p-5">
      {lines.map((line) => {
        const addonsTotal = line.addons.reduce((sum, a) => sum + a.price, 0);
        return (
          <div key={line.lineId} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-espresso">
                {line.name} × {line.quantity}
              </p>
              {line.addons.length > 0 ? (
                <p className="mt-0.5 text-xs text-espresso/50">{line.addons.map((a) => a.name).join("، ")}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-semibold text-espresso/80">
              {formatPrice((line.price + addonsTotal) * line.quantity)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-espresso/10 pt-4 text-sm font-semibold text-espresso">
        <span>الإجمالي</span>
        <span className="text-gold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
