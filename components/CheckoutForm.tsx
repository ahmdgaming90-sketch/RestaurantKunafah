"use client";

import { useState } from "react";

export type CheckoutFormValues = {
  customerName: string;
  customerPhone: string;
};

const PHONE_REGEX = /^05\d{8}$/;

export default function CheckoutForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: CheckoutFormValues) => void;
  submitting: boolean;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (customerName.trim().length < 2) nextErrors.name = "الرجاء إدخال اسم المستلم.";
    if (!PHONE_REGEX.test(customerPhone.trim())) nextErrors.phone = "الرجاء إدخال رقم جوال سعودي صحيح (05xxxxxxxx).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ customerName: customerName.trim(), customerPhone: customerPhone.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium text-espresso">
          اسم المستلم
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-paper px-4 py-3 text-sm text-espresso outline-none focus:border-gold"
          placeholder="الاسم"
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="customerPhone" className="mb-1.5 block text-sm font-medium text-espresso">
          رقم الجوال
        </label>
        <input
          id="customerPhone"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-paper px-4 py-3 text-sm text-espresso outline-none focus:border-gold"
          placeholder="05xxxxxxxx"
        />
        {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
        {submitting ? "جارٍ إنشاء الطلب..." : "إتمام الطلب"}
      </button>
    </form>
  );
}
