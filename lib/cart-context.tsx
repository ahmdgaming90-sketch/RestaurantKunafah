"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/types/database";

const STORAGE_KEY = "kunafa-sokara-cart";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  totalPrice: number;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineTotal(line: CartLine) {
  const addonsTotal = line.addons.reduce((sum, a) => sum + a.price, 0);
  return (line.price + addonsTotal) * line.quantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage may be unavailable (private mode) — cart just won't persist
    }
  }, [lines, hydrated]);

  const addLine: CartContextValue["addLine"] = (line) => {
    setLines((prev) => [...prev, { ...line, lineId: crypto.randomUUID() }]);
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (lineId, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.lineId !== lineId)
        : prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
    );
  };

  const removeLine: CartContextValue["removeLine"] = (lineId) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const clear = () => setLines([]);

  const totalPrice = useMemo(() => lines.reduce((sum, l) => sum + lineTotal(l), 0), [lines]);
  const totalCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, addLine, updateQuantity, removeLine, clear, totalPrice, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
