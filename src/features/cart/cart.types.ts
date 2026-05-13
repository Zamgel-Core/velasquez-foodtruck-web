// 📍 Ruta: src/features/cart/cart.types.ts

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  image?: string | null;
  description?: string | null;
  quantity: number;
  notes?: string;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  notes?: string;
};