// 📍 Ruta: src/features/cart/cart.types.ts

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  notes?: string;
};