// 📍 Ruta: src/features/admin/product-options/product-options.types.ts

export type AdminProductOptionProduct = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type ProductOption = {
  id: string;
  product_id: string;
  option_group: string;
  option_name: string;
  extra_price: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  product?: AdminProductOptionProduct | null;
};

export type ProductOptionFormData = {
  id?: string;
  product_id: string;
  option_group: string;
  option_name: string;
  extra_price: string;
  is_required: boolean;
  is_default: boolean;
  sort_order: string;
};
