// 📍 Ruta: src/features/cart/cart.types.ts

export type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  basePrice?: number;
  imageUrl?: string | null;
  image?: string | null;
  description?: string | null;
  category?: string | null;
  quantity: number;
  notes?: string;
  selectedProtein?: {
    label: string;
    extraPrice: number;
  } | null;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  notes?: string;
};