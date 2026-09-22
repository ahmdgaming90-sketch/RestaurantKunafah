"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { buildOrderConfirmationLink } from "@/lib/whatsapp";
import CheckoutForm, { type CheckoutFormValues } from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";

const LAST_ORDER_KEY = "kunafa-sokara-last-order";

export default function CheckoutClient({
  restaurantName,
  whatsappNumber,
}: {
  restaurantName: string;
  whatsappNumber: string | null;
}) {
  const { lines, totalPrice, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(values: CheckoutFormValues) {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            addonIds: line.addons.map((a) => a.id),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(errorText(data.error));
        setSubmitting(false);
        return;
      }

      const waLink = whatsappNumber
        ? buildOrderConfirmationLink({
            whatsappNumber,
            restaurantName,
            orderNumber: data.order_number,
            customerName: values.customerName,
            customerPhone: values.customerPhone,
            lines,
            total: data.total,
          })
        : null;

      window.sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({ orderNumber: data.order_number, total: data.total, waLink })
      );

      clear();
      router.push("/order-success");
    } catch {
      setErrorMessage("حدث خطأ أثناء إنشاء الطلب، الرجاء المحاولة مرة أخرى.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-espresso/60">سلتك فارغة حاليًا.</p>
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          تصفح المنيو
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h2 className="mb-4 text-sm font-semibold text-espresso">ملخص الطلب</h2>
        <OrderSummary lines={lines} total={totalPrice} />
      </div>
      <div>
        <h2 className="mb-4 text-sm font-semibold text-espresso">بيانات الاستلام</h2>
        <CheckoutForm onSubmit={handleSubmit} submitting={submitting} />
        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        <p className="mt-4 text-xs text-espresso/40">الإجمالي المعروض للاطلاع فقط — يتم احتساب السعر النهائي من خوادمنا لضمان الدقة.</p>
      </div>
    </div>
  );
}

function errorText(code?: string) {
  switch (code) {
    case "CUSTOMER_NAME_REQUIRED":
      return "الرجاء إدخال اسم المستلم.";
    case "CUSTOMER_PHONE_INVALID":
      return "رقم الجوال غير صحيح.";
    case "CART_EMPTY":
      return "السلة فارغة.";
    case "PRODUCT_NOT_FOUND":
    case "PRODUCT_UNAVAILABLE":
      return "أحد المنتجات لم يعد متوفرًا، الرجاء مراجعة السلة.";
    case "ADDON_NOT_FOUND":
      return "أحد الإضافات لم تعد متوفرة، الرجاء مراجعة السلة.";
    default:
      return "حدث خطأ أثناء إنشاء الطلب، الرجاء المحاولة مرة أخرى.";
  }
}

export { LAST_ORDER_KEY };
