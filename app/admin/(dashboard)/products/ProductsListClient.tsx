"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/whatsapp";
import ProductForm from "@/components/ProductForm";
import type { Category, Product, ProductAddon } from "@/types/database";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  createAddon,
  updateAddon,
  deleteAddon,
} from "./actions";

export default function ProductsListClient({
  initialProducts,
  categories,
  addonsByProduct,
}: {
  initialProducts: Product[];
  categories: Category[];
  addonsByProduct: Record<string, ProductAddon[]>;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    window.location.reload();
  }

  async function handleToggle(product: Product) {
    const next = !product.available;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, available: next } : p)));
    const res = await toggleAvailability(product.id, next);
    if (res.error) setMessage(res.error);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`حذف "${product.name}"؟`)) return;
    const res = await deleteProduct(product.id, product.image_url);
    if (res.error) {
      setMessage(res.error);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setMessage("تم حذف المنتج");
  }

  const editingProduct = editing === "new" ? null : editing;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-espresso">المنتجات</h1>
        <button onClick={() => setEditing("new")} className="btn-primary !px-4 !py-2 text-xs">
          إضافة منتج
        </button>
      </div>

      {message ? <p className="mb-4 text-xs text-gold">{message}</p> : null}

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-espresso/50">لا توجد منتجات حاليًا.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-paper p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="56px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-espresso">{product.name}</p>
                <p className="text-xs text-espresso/50">{formatPrice(product.price)}</p>
                {!product.available ? <span className="text-xs text-red-600">مخفي</span> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <button onClick={() => handleToggle(product)} className="text-espresso/60 hover:text-gold">
                  {product.available ? "إخفاء" : "إظهار"}
                </button>
                <button onClick={() => setEditing(product)} className="text-espresso/60 hover:text-gold">
                  تعديل
                </button>
                <button onClick={() => handleDelete(product)} className="text-espresso/60 hover:text-red-600">
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ProductForm
          product={editingProduct}
          addons={editingProduct ? addonsByProduct[editingProduct.id] ?? [] : []}
          categories={categories}
          productActions={{ createProduct, updateProduct }}
          addonActions={{ createAddon, updateAddon, deleteAddon }}
          onClose={() => {
            setEditing(null);
            refresh();
          }}
          onSaved={() => {}}
        />
      ) : null}
    </div>
  );
}
