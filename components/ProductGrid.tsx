"use client";

import { useState } from "react";
import type { Product, ProductAddon } from "@/types/database";
import ProductCard from "@/components/ProductCard";
import ProductDetails from "@/components/ProductDetails";

export default function ProductGrid({
  products,
  addonsByProduct,
}: {
  products: Product[];
  addonsByProduct: Record<string, ProductAddon[]>;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return <p className="py-12 text-center text-sm text-espresso/50">سيتم إضافة المنتجات قريبًا.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
        ))}
      </div>
      {selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          addons={addonsByProduct[selectedProduct.id] ?? []}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </>
  );
}
