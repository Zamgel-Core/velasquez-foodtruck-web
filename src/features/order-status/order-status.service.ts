// 📍 Ruta: src/features/order-status/order-status.service.ts

import { supabase } from "../../lib/supabase";

export type PublicOrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type PublicOrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  product_name: string;
};

export type PublicOrder = {
  id: string;
  order_number: string;
  status: PublicOrderStatus;
  subtotal: number;
  total: number;
  payment_method: "cash" | "card";
  payment_status: string;
  notes: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    notes: string | null;
  } | null;
  items: PublicOrderItem[];
};

type RawOrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  products?: {
    name: string;
  } | null;
};

type RawOrder = {
  id: string;
  order_number: string;
  status: PublicOrderStatus;
  subtotal: number;
  total: number;
  payment_method: "cash" | "card" | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  customers?: {
    id: string;
    name: string;
    phone: string;
    notes: string | null;
  } | null;
  order_items?: RawOrderItem[];
};

const ORDER_SELECT = `
  id,
  order_number,
  status,
  subtotal,
  total,
  payment_method,
  payment_status,
  notes,
  created_at,
  customers (
    id,
    name,
    phone,
    notes
  ),
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    notes,
    products (
      name
    )
  )
`;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function mapOrder(order: RawOrder): PublicOrder {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    subtotal: Number(order.subtotal ?? 0),
    total: Number(order.total ?? 0),
    payment_method: order.payment_method ?? "cash",
    payment_status: order.payment_status,
    notes: order.notes,
    created_at: order.created_at,
    customer: order.customers ?? null,
    items: (order.order_items ?? []).map((item) => ({
      id: item.id,
      quantity: Number(item.quantity ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      total_price: Number(item.total_price ?? 0),
      notes: item.notes,
      product_name: item.products?.name ?? item.notes ?? "Producto",
    })),
  };
}

export async function findOrderByNumber(orderNumber: string) {
  const cleanOrderNumber = orderNumber.trim().replace(/#/g, "");

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", cleanOrderNumber)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapOrder(data as RawOrder);
}

export async function findOrderById(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapOrder(data as RawOrder);
}

export async function findLatestOrderByPhone(phone: string) {
  const cleanedPhone = normalizePhone(phone);

  if (cleanedPhone.length < 7) return null;

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", cleanedPhone)
    .order("created_at", { ascending: false })
    .limit(20);

  if (customersError) throw customersError;

  const customerIds = (customers ?? []).map((customer) => customer.id);

  if (customerIds.length === 0) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .in("customer_id", customerIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapOrder(data as RawOrder);
}

export async function findOrderByNumberOrPhone(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const orderResult = await findOrderByNumber(trimmed);

  if (orderResult) return orderResult;

  return findLatestOrderByPhone(trimmed);
}
