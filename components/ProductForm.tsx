"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import AddonManager from "@/components/AddonManager";
import type { Category, Product, ProductAddon } from "@/types/database";
import type { ProductInput, AddonInput } from "@/app/admin/(dashboard)/products/actions";

type ProductActions = {
  createProduct: (input: ProductInput) => Promise<{ error?: string; success?: boolean; id?: string }>;
  updateProduct: (id: string, input: ProductInput) => Promise<{ error?: string; success?: boolean }>;
};

type AddonActions = {
  createAddon: (productId: string, input: AddonInput) => Promise<{ error?: string; success?: boolean; id?: string }>;
  updateAddon: (id: string, input: AddonInput) => Promise<{ error?: string; success?: boolean }>;
  deleteAddon: (id: string) => Promise<{ error?: string; success?: boolean }>;
};

export default function ProductForm({
  product,
  addons,
  categories,
  productActions,
  addonActions,
  onClose,
  onSaved,
}: {
  product: Product | null;
  addons: ProductAddon[];
  categories: Category[];
  productActions: ProductActions;
  addonActions: AddonActions;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [categoryId, setCategoryId] = useState<string | null>(product?.category_id ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url ?? null);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [savedProductId, setSavedProductId] = useState<string | null>(product?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("الاسم مطلوب");
      return;
    }

    setSaving(true);
    setMessage(null);

    const input: ProductInput = { name, description, price, categoryId, imageUrl, available };

    if (savedProductId) {
      const res = await productActions.updateProduct(savedProductId, input);
      setSaving(false);
      if (res.error) return setMessage(res.error);
      setMessage("تم حفظ التغييرات");
      onSaved();
    } else {
      const res = await productActions.createProduct(input);
      setSaving(false);
      if (res.error) return setMessage(res.error);
      setSavedProductId(res.id ?? null);
      setMessage("تم إنشاء المنتج — يمكنك الآن إضافة الإضافات أدناه");
      onSaved();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/40 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
          <h2 className="text-base font-semibold text-espresso">{savedProductId ? "تعديل المنتج" : "منتج جديد"}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-espresso/50 hover:text-espresso">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">اسم المنتج</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">الوصف</label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-espresso">السعر (ريال)</label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-espresso">القسم</label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="">بدون قسم</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">صورة المنتج</label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} folder="products" />
          </div>

          <label className="flex items-center gap-2 text-sm text-espresso">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            المنتج ظاهر للعملاء
          </label>

          {message ? <p className="text-sm text-gold">{message}</p> : null}

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
            {saving ? "جارٍ الحفظ..." : "حفظ المنتج"}
          </button>
        </form>

        {savedProductId ? (
          <div className="px-6 pb-6">
            <AddonManager productId={savedProductId} addons={addons} actions={addonActions} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
