// 📍 Ruta: src/features/admin/orders/admin-orders.service.ts

import { supabase } from "../../../lib/supabase";
import type { AdminOrder, OrderStatus, PaymentMethod } from "./admin-orders.types";
import { registerLoyaltyOrder } from "../loyalty/loyalty.service";

type RawOrderItem = {
  id: string;
  product_id: string | null;
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
  status: OrderStatus;
  subtotal: number;
  total: number;
  payment_status: string;
  payment_method: PaymentMethod | null;
  fee_amount: number | null;
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

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      subtotal,
      total,
      payment_status,
      payment_method,
      fee_amount,
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
        product_id,
        quantity,
        unit_price,
        total_price,
        notes,
        products (
          name
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error loading admin orders:", error);
    throw new Error("No se pudieron cargar las órdenes.");
  }

  return ((data ?? []) as RawOrder[]).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    subtotal: Number(order.subtotal ?? 0),
    total: Number(order.total ?? 0),
    payment_status: order.payment_status,
    payment_method: order.payment_method ?? "cash",
    fee_amount: Number(order.fee_amount ?? 0),
    notes: order.notes,
    created_at: order.created_at,
    customer: order.customers ?? null,
    items: (order.order_items ?? []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: Number(item.quantity ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      total_price: Number(item.total_price ?? 0),
      notes: item.notes,
      product_name: item.products?.name ?? item.notes ?? "Producto",
    })),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total,
      customers (
        name,
        phone
      )
    `)
    .eq("id", orderId)
    .single();

  if (currentOrderError) {
    console.error("Error loading order before status update:", currentOrderError);
    throw new Error("No se pudo cargar la orden.");
  }

  const previousStatus = currentOrder?.status as OrderStatus | undefined;

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  const shouldRegisterLoyalty =
    (status === "ready" || status === "delivered") &&
    previousStatus !== "ready" &&
    previousStatus !== "delivered";

  if (shouldRegisterLoyalty) {
    const customer = Array.isArray(currentOrder.customers)
      ? currentOrder.customers[0]
      : currentOrder.customers;

    try {
      await registerLoyaltyOrder({
        customerName: customer?.name ?? "Cliente Velasquez",
        customerPhone: customer?.phone ?? "",
        orderNumber: currentOrder.order_number,
        orderTotal: Number(currentOrder.total ?? 0),
        source: "admin_pos",
      });
    } catch (loyaltyError) {
      console.error("Loyalty status reward error:", loyaltyError);
    }
  }

  return true;
}
