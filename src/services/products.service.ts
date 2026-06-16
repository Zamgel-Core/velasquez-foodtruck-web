// 📍 Ruta: src/services/products.service.ts

import { supabase } from "../lib/supabase";
import type { Product } from "../types/product.types";

type ProductRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
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
      name_en,
      description,
      description_en,
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
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data ?? []).map((product: ProductRow) => ({
    id: product.id,
    name: product.name,
    name_en: product.name_en ?? "",
    description: product.description ?? "",
    description_en: product.description_en ?? "",
    price: Number(product.price),
    image_url: product.image_url ?? "/images/regular_tacos.png",
    category: product.categories?.name ?? "Extras",
    is_available: product.is_available,
  }));
}
