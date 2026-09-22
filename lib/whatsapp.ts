import type { CartLine, Product } from "@/types/database";

function toWaLink(whatsappNumber: string, message: string) {
  const digits = whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Builds a wa.me link with a pre-filled Arabic order message. Never opens automatically. */
export function buildWhatsAppOrderLink(whatsappNumber: string, product?: Pick<Product, "name" | "price">) {
  const message = product
    ? `السلام عليكم،\nأرغب في طلب:\n${product.name}\nالسعر: ${formatPrice(product.price)}`
    : `السلام عليكم،\nأرغب في الاستفسار عن المنيو.`;

  return toWaLink(whatsappNumber, message);
}

/** Builds the confirmation message for a placed order — no emojis, clearly formatted. */
export function buildOrderConfirmationLink({
  whatsappNumber,
  restaurantName,
  orderNumber,
  customerName,
  customerPhone,
  lines,
  total,
}: {
  whatsappNumber: string;
  restaurantName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  lines: CartLine[];
  total: number;
}) {
  const itemsText = lines
    .map((line, index) => {
      const addonsText = line.addons.length
        ? "\n    الإضافات:\n" + line.addons.map((a) => `    - ${a.name} +${formatPrice(a.price)}`).join("\n")
        : "";
      return `${index + 1}. ${line.name} × ${line.quantity}${addonsText}`;
    })
    .join("\n\n");

  const message = [
    `السلام عليكم، أريد تأكيد طلبي من ${restaurantName}.`,
    "",
    `رقم الطلب: ${orderNumber}`,
    "",
    `اسم المستلم: ${customerName}`,
    `رقم الجوال: ${customerPhone}`,
    "",
    "الطلب:",
    "",
    itemsText,
    "",
    `الإجمالي: ${formatPrice(total)}`,
  ].join("\n");

  return toWaLink(whatsappNumber, message);
}

export function formatPrice(price: number) {
  return `${price.toFixed(price % 1 === 0 ? 0 : 2)} ريال`;
}
