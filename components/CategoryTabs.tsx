"use client";

import { useState } from "react";
import type { Category, Product, ProductAddon } from "@/types/database";
import ProductCard from "@/components/ProductCard";
import ProductDetails from "@/components/ProductDetails";

const ALL_ID = "__all__";

export default function CategoryTabs({
  categories,
  products,
  addonsByProduct,
}: {
  categories: Category[];
  products: Product[];
  addonsByProduct: Record<string, ProductAddon[]>;
}) {
  const [activeId, setActiveId] = useState<string>(ALL_ID);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const visibleProducts = activeId === ALL_ID ? products : products.filter((p) => p.category_id === activeId);

  return (
    <div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-4">
        <button
          onClick={() => setActiveId(ALL_ID)}
          className={`shrink-0 rounded-full px-5 py-2 text-sm transition-colors ${
            activeId === ALL_ID ? "bg-espresso text-paper" : "bg-espresso/5 text-espresso/70"
          }`}
        >
          الكل
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveId(category.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm transition-colors ${
              activeId === category.id ? "bg-espresso text-paper" : "bg-espresso/5 text-espresso/70"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p className="py-12 text-center text-sm text-espresso/50">لا توجد منتجات في هذا القسم حاليًا.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
          ))}
        </div>
      )}

      {selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          addons={addonsByProduct[selectedProduct.id] ?? []}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}
