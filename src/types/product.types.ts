// 📍 Ruta: src/types/product.types.ts

export type Product = {
  id: string;
  name: string;
  description: string;
  description_en?: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
};