// 📍 Ruta: src/features/admin/products/admin-products.service.ts

import { supabase } from "../../../lib/supabase";
import type { AdminCategory, AdminProduct, ProductFormData } from "./admin-products.types";

type ProductPayload = {
  category_id: string | null;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes: number | null;
  sort_order: number | null;
};

function toProductPayload(form: ProductFormData, imageUrl?: string | null): ProductPayload {
  return {
    category_id: form.category_id || null,
    name: form.name.trim(),
    name_en: form.name_en.trim() || null,
    description: form.description.trim() || null,
    description_en: form.description_en.trim() || null,
    price: Number(form.price || 0),
    image_url: (imageUrl ?? form.image_url).trim() || null,
    is_available: form.is_available,
    is_featured: form.is_featured,
    prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
    sort_order: form.sort_order ? Number(form.sort_order) : null,
  };
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function uploadProductImage(file: File, productName: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = sanitizeFileName(productName || "producto") || "producto";
  const filePath = `${safeName}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "31536000",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading product image:", error);
    throw new Error("No se pudo subir la imagen. Revisa que exista el bucket product-images.");
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);

  return data.publicUrl;
}

export function createEmptyProductForm(): ProductFormData {
  return {
    category_id: "",
    name: "",
    name_en: "",
    description: "",
    description_en: "",
    price: "",
    image_url: "",
    image_file: null,
    image_preview_url: "",
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
    name_en: product.name_en ?? "",
    description: product.description ?? "",
    description_en: product.description_en ?? "",
    price: String(product.price ?? ""),
    image_url: product.image_url ?? "",
    image_file: null,
    image_preview_url: product.image_url ?? "",
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
      name_en,
      description,
      description_en,
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
  if (!form.name.trim()) {
    throw new Error("El nombre del producto es requerido.");
  }

  if (!Number(form.price || 0) || Number(form.price || 0) <= 0) {
    throw new Error("El precio debe ser mayor a 0.");
  }

  let uploadedImageUrl: string | null | undefined;

  if (form.image_file) {
    uploadedImageUrl = await uploadProductImage(form.image_file, form.name);
  }

  const payload = toProductPayload(form, uploadedImageUrl);

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