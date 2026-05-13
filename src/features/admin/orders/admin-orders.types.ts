// 📍 Ruta: src/features/admin/orders/admin-orders.types.ts

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash" | "card";

export type AdminOrderItem = {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  product_name?: string;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  payment_status: string;
  payment_method: PaymentMethod;
  fee_amount: number;
  notes: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    notes: string | null;
  } | null;
  items: AdminOrderItem[];
};
