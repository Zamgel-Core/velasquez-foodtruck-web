// 📍 Ruta: src/features/admin/product-options/product-options.service.ts

import { supabase } from "../../../lib/supabase";
import type {
  AdminProductOptionProduct,
  ProductOption,
  ProductOptionFormData,
} from "./product-options.types";

type ProductOptionPayload = {
  product_id: string;
  option_group: string;
  option_name: string;
  extra_price: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
};

function toPayload(form: ProductOptionFormData): ProductOptionPayload {
  return {
    product_id: form.product_id,
    option_group: form.option_group.trim(),
    option_name: form.option_name.trim(),
    extra_price: Number(form.extra_price || 0),
    is_required: form.is_required,
    is_default: form.is_default,
    sort_order: Number(form.sort_order || 0),
  };
}

export function createEmptyOptionForm(productId = ""): ProductOptionFormData {
  return {
    product_id: productId,
    option_group: "",
    option_name: "",
    extra_price: "0",
    is_required: false,
    is_default: false,
    sort_order: "0",
  };
}

export function optionToForm(option: ProductOption): ProductOptionFormData {
  return {
    id: option.id,
    product_id: option.product_id,
    option_group: option.option_group,
    option_name: option.option_name,
    extra_price: String(option.extra_price ?? 0),
    is_required: option.is_required,
    is_default: option.is_default,
    sort_order: String(option.sort_order ?? 0),
  };
}

export async function getOptionProducts(): Promise<AdminProductOptionProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      category_id,
      category:categories (
        id,
        name
      )
    `)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading products for options:", error);
    throw new Error("No se pudieron cargar los productos.");
  }

  return ((data ?? []) as AdminProductOptionProduct[]).map((product) => ({
    ...product,
    price: Number(product.price ?? 0),
  }));
}

export async function getProductOptions(): Promise<ProductOption[]> {
  const { data, error } = await supabase
    .from("product_options")
    .select(`
      id,
      product_id,
      option_group,
      option_name,
      extra_price,
      is_required,
      is_default,
      sort_order,
      created_at,
      product:products (
        id,
        name,
        price,
        category_id,
        category:categories (
          id,
          name
        )
      )
    `)
    .order("sort_order", { ascending: true })
    .order("option_group", { ascending: true })
    .order("option_name", { ascending: true });

  if (error) {
    console.error("Error loading product options:", error);
    throw new Error("No se pudieron cargar las opciones.");
  }

  return ((data ?? []) as ProductOption[]).map((option) => ({
    ...option,
    extra_price: Number(option.extra_price ?? 0),
    sort_order: Number(option.sort_order ?? 0),
  }));
}

export async function saveProductOption(form: ProductOptionFormData) {
  const payload = toPayload(form);

  if (!payload.product_id) throw new Error("Selecciona un producto.");
  if (!payload.option_group) throw new Error("El grupo es requerido.");
  if (!payload.option_name) throw new Error("El nombre de la opción es requerido.");

  if (form.id) {
    const { error } = await supabase
      .from("product_options")
      .update(payload)
      .eq("id", form.id);

    if (error) {
      console.error("Error updating option:", error);
      throw new Error("No se pudo actualizar la opción.");
    }
    return true;
  }

  const { error } = await supabase.from("product_options").insert(payload);
  if (error) {
    console.error("Error creating option:", error);
    throw new Error("No se pudo crear la opción.");
  }

  return true;
}

export async function deleteProductOption(optionId: string) {
  const { error } = await supabase
    .from("product_options")
    .delete()
    .eq("id", optionId);

  if (error) {
    console.error("Error deleting option:", error);
    throw new Error("No se pudo eliminar la opción.");
  }

  return true;
}
