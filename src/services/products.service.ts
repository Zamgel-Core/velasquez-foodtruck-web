// 📍 Ruta: src/services/products.service.ts

import { supabase } from "../lib/supabase";
import type { Product } from "../types/product.types";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number | null;
  categories?: {
    name: string;
    slug?: string | null;
  } | null;
};

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      image_url,
      is_available,
      sort_order,
      categories (
        name,
        slug
      )
    `,
    )
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data ?? []).map((product: ProductRow) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price),
    image_url: product.image_url ?? "/images/regular_tacos.png",
    category: product.categories?.name ?? "Extras",
    is_available: product.is_available,
  }));
}
