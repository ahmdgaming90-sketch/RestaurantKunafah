"use client";

import { useState, useTransition } from "react";
import type { ProductAddon } from "@/types/database";

type AddonInput = {
  name: string;
  price: number;
  isActive: boolean;
  selectionType: "single" | "multiple";
  isRequired: boolean;
};

type Actions = {
  createAddon: (productId: string, input: AddonInput) => Promise<{ error?: string; success?: boolean; id?: string }>;
  updateAddon: (id: string, input: AddonInput) => Promise<{ error?: string; success?: boolean }>;
  deleteAddon: (id: string) => Promise<{ error?: string; success?: boolean }>;
};

const emptyForm: AddonInput = { name: "", price: 0, isActive: true, selectionType: "multiple", isRequired: false };

export default function AddonManager({
  productId,
  addons,
  actions,
}: {
  productId: string;
  addons: ProductAddon[];
  actions: Actions;
}) {
  const [items, setItems] = useState(addons);
  const [form, setForm] = useState<AddonInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    startTransition(async () => {
      if (editingId) {
        const res = await actions.updateAddon(editingId, form);
        if (res.error) return setMessage(res.error);
        setItems((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...toAddonPatch(form) } : a)));
        setMessage("تم حفظ الإضافة");
      } else {
        const res = await actions.createAddon(productId, form);
        if (res.error) return setMessage(res.error);
        setItems((prev) => [
          ...prev,
          {
            id: res.id as string,
            product_id: productId,
            restaurant_id: "",
            name: form.name.trim(),
            price: form.price,
            is_active: form.isActive,
            selection_type: form.selectionType,
            is_required: form.isRequired,
            sort_order: prev.length,
            created_at: "",
            updated_at: "",
          },
        ]);
        setMessage("تمت إضافة الإضافة");
      }
      resetForm();
    });
  }

  function startEdit(addon: ProductAddon) {
    setEditingId(addon.id);
    setForm({
      name: addon.name,
      price: addon.price,
      isActive: addon.is_active,
      selectionType: addon.selection_type,
      isRequired: addon.is_required,
    });
  }

  function handleDelete(id: string) {
    if (!confirm("حذف هذه الإضافة؟")) return;
    startTransition(async () => {
      const res = await actions.deleteAddon(id);
      if (res.error) return setMessage(res.error);
      setItems((prev) => prev.filter((a) => a.id !== id));
      setMessage("تم حذف الإضافة");
    });
  }

  return (
    <div className="rounded-xl border border-espresso/10 p-4">
      <h3 className="mb-3 text-sm font-semibold text-espresso">إضافات المنتج</h3>

      {items.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {items.map((addon) => (
            <li key={addon.id} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm">
              <div>
                <span className="text-espresso">{addon.name}</span>
                <span className="mr-2 text-espresso/50">+{addon.price} ريال</span>
                {!addon.is_active ? <span className="mr-2 text-xs text-espresso/40">(معطلة)</span> : null}
                {addon.is_required ? <span className="mr-2 text-xs text-gold">مطلوبة</span> : null}
              </div>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => startEdit(addon)} className="text-espresso/60 hover:text-gold">
                  تعديل
                </button>
                <button type="button" onClick={() => handleDelete(addon.id)} className="text-espresso/60 hover:text-red-600">
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-xs text-espresso/40">لا توجد إضافات لهذا المنتج بعد.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-espresso/10 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="اسم الإضافة"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-lg border border-espresso/15 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <input
            type="number"
            min={0}
            step="0.5"
            placeholder="السعر"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="rounded-lg border border-espresso/15 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-espresso/70">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            متاحة
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))}
            />
            مطلوبة
          </label>
          <label className="flex items-center gap-1.5">
            نوع الاختيار
            <select
              value={form.selectionType}
              onChange={(e) => setForm((f) => ({ ...f, selectionType: e.target.value as "single" | "multiple" }))}
              className="rounded-lg border border-espresso/15 px-2 py-1"
            >
              <option value="multiple">عدة إضافات</option>
              <option value="single">إضافة واحدة</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className="btn-secondary !px-4 !py-2 text-xs">
            {editingId ? "حفظ التعديل" : "إضافة"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="text-xs text-espresso/50">
              إلغاء
            </button>
          ) : null}
        </div>

        {message ? <p className="text-xs text-gold">{message}</p> : null}
      </form>
    </div>
  );
}

function toAddonPatch(form: AddonInput) {
  return {
    name: form.name.trim(),
    price: form.price,
    is_active: form.isActive,
    selection_type: form.selectionType,
    is_required: form.isRequired,
  };
}
