// 📍 Ruta: src/features/admin/products/admin-products.types.ts

export type AdminCategory = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean;
  slug: string | null;
};

export type AdminProduct = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes: number | null;
  sort_order: number | null;
  created_at: string | null;
  category?: AdminCategory | null;
};

export type ProductFormData = {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes: string;
  sort_order: string;
};