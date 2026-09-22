"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/types/database";

type Actions = {
  createCategory: (name: string) => Promise<{ error?: string; success?: boolean }>;
  updateCategory: (id: string, name: string) => Promise<{ error?: string; success?: boolean }>;
  deleteCategory: (id: string) => Promise<{ error?: string; success?: boolean }>;
};

export default function CategoryManager({ categories, actions }: { categories: Category[]; actions: Actions }) {
  const [items, setItems] = useState(categories);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await actions.createCategory(newName.trim());
      if (res.error) {
        setMessage(res.error);
        return;
      }
      setItems((prev) => [...prev, { id: crypto.randomUUID(), restaurant_id: "", name: newName.trim(), sort_order: prev.length, created_at: "", updated_at: "" }]);
      setNewName("");
      setMessage("تمت إضافة القسم");
    });
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    startTransition(async () => {
      const res = await actions.updateCategory(id, editingName.trim());
      if (res.error) {
        setMessage(res.error);
        return;
      }
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c)));
      setEditingId(null);
      setMessage("تم حفظ التغييرات");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("حذف هذا القسم؟")) return;
    startTransition(async () => {
      const res = await actions.deleteCategory(id);
      if (res.error) {
        setMessage(res.error);
        return;
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
      setMessage("تم حذف القسم");
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="اسم القسم الجديد"
          className="flex-1 rounded-xl border border-espresso/15 bg-paper px-4 py-2.5 text-sm text-espresso outline-none focus:border-gold"
        />
        <button type="submit" disabled={isPending} className="btn-primary !px-5 !py-2.5 text-sm">
          إضافة
        </button>
      </form>

      {message ? <p className="mb-4 text-xs text-gold">{message}</p> : null}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-espresso/50">لا توجد أقسام بعد.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((category) => (
            <li key={category.id} className="flex items-center justify-between rounded-xl border border-espresso/10 bg-paper px-4 py-3">
              {editingId === category.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 rounded-lg border border-espresso/15 px-2 py-1 text-sm outline-none focus:border-gold"
                  autoFocus
                />
              ) : (
                <span className="text-sm text-espresso">{category.name}</span>
              )}

              <div className="flex items-center gap-3 text-xs">
                {editingId === category.id ? (
                  <>
                    <button onClick={() => handleUpdate(category.id)} className="font-medium text-gold">
                      حفظ
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-espresso/40">
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(category)} className="text-espresso/60 hover:text-gold">
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="text-espresso/60 hover:text-red-600">
                      حذف
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
