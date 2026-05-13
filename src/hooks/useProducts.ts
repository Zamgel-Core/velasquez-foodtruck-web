// 📍 Ruta: src/hooks/useProducts.ts

import { useEffect, useState } from "react";
import { getProducts } from "../services/products.service";
import type { Product } from "../types/product.types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    setLoading(true);

    const data = await getProducts();

    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    refetch: fetchProducts,
  };
}