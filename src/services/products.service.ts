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
  is_active: boolean;
  sort_order: number | null;
  categories?: {
    name: string;
    slug?: string | null;
    is_active: boolean;
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
      is_active,
      sort_order,
      categories!inner (
        name,
        slug,
        is_active
      )
    `,
    )
    .eq("is_active", true)
    .eq("categories.is_active", true)
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
    is_active: product.is_active,
  }));
}
