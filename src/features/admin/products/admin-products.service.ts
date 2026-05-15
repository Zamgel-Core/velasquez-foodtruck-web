// 📍 Ruta: src/features/admin/products/admin-products.service.ts

import { supabase } from "../../../lib/supabase";
import type { AdminCategory, AdminProduct, ProductFormData } from "./admin-products.types";

type ProductPayload = {
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes: number | null;
  sort_order: number | null;
};

function toProductPayload(form: ProductFormData): ProductPayload {
  return {
    category_id: form.category_id || null,
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price || 0),
    image_url: form.image_url.trim() || null,
    is_available: form.is_available,
    is_featured: form.is_featured,
    prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
    sort_order: form.sort_order ? Number(form.sort_order) : null,
  };
}

export function createEmptyProductForm(): ProductFormData {
  return {
    category_id: "",
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_available: true,
    is_featured: false,
    prep_time_minutes: "",
    sort_order: "",
  };
}

export function productToForm(product: AdminProduct): ProductFormData {
  return {
    id: product.id,
    category_id: product.category_id ?? "",
    name: product.name ?? "",
    description: product.description ?? "",
    price: String(product.price ?? ""),
    image_url: product.image_url ?? "",
    is_available: product.is_available,
    is_featured: product.is_featured,
    prep_time_minutes: product.prep_time_minutes ? String(product.prep_time_minutes) : "",
    sort_order: product.sort_order ? String(product.sort_order) : "",
  };
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description, image_url, sort_order, is_active, slug")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading categories:", error);
    throw new Error("No se pudieron cargar las categorías.");
  }

  return (data ?? []) as AdminCategory[];
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      description,
      price,
      image_url,
      is_available,
      is_featured,
      prep_time_minutes,
      sort_order,
      created_at,
      category:categories (
        id,
        name,
        description,
        image_url,
        sort_order,
        is_active,
        slug
      )
    `)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading products:", error);
    throw new Error("No se pudieron cargar los productos.");
  }

  return ((data ?? []) as AdminProduct[]).map((product) => ({
    ...product,
    price: Number(product.price ?? 0),
    prep_time_minutes:
      product.prep_time_minutes === null ? null : Number(product.prep_time_minutes),
    sort_order: product.sort_order === null ? null : Number(product.sort_order),
  }));
}

export async function saveAdminProduct(form: ProductFormData) {
  const payload = toProductPayload(form);

  if (!payload.name) {
    throw new Error("El nombre del producto es requerido.");
  }

  if (!payload.price || payload.price <= 0) {
    throw new Error("El precio debe ser mayor a 0.");
  }

  if (form.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", form.id);

    if (error) {
      console.error("Error updating product:", error);
      throw new Error("No se pudo actualizar el producto.");
    }

    return true;
  }

  const { error } = await supabase.from("products").insert(payload);

  if (error) {
    console.error("Error creating product:", error);
    throw new Error("No se pudo crear el producto.");
  }

  return true;
}

export async function toggleProductAvailability(product: AdminProduct) {
  const { error } = await supabase
    .from("products")
    .update({ is_available: !product.is_available })
    .eq("id", product.id);

  if (error) {
    console.error("Error toggling product:", error);
    throw new Error("No se pudo cambiar la disponibilidad.");
  }

  return true;
}

export async function updateProductPrice(productId: string, price: number) {
  const { error } = await supabase
    .from("products")
    .update({ price })
    .eq("id", productId);

  if (error) {
    console.error("Error updating price:", error);
    throw new Error("No se pudo actualizar el precio.");
  }

  return true;
}