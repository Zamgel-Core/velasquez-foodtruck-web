// 📍 Ruta: src/services/orders.service.ts

import { supabase } from "../lib/supabase";
import type { CartItem, CheckoutCustomer } from "../features/cart/cart.types";

type PaymentMethod = "cash" | "card";

type OrderPaymentData = {
  paymentMethod: PaymentMethod;
  feeAmount: number;
  total: number;
};

function generateOrderNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidUuid(value?: string) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function resolveProductId(item: CartItem) {
  if (isValidUuid(item.productId)) {
    return item.productId;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("name", item.name)
    .maybeSingle();

  if (error) {
    console.error("Error resolving product:", error);
    return null;
  }

  return data?.id ?? null;
}

async function getActiveRegisterSessionId() {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("id")
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Cash register lookup error:", error);
    return null;
  }

  return data?.id ?? null;
}

export async function createOrder(
  customer: CheckoutCustomer,
  items: CartItem[],
  subtotal: number,
  payment?: OrderPaymentData,
) {
  if (items.length === 0) {
    return { success: false, error: "El carrito está vacío." };
  }

  const paymentMethod = payment?.paymentMethod ?? "cash";
  const feeAmount = payment?.feeAmount ?? 0;
  const total = payment?.total ?? subtotal;

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes || null,
    })
    .select("id")
    .single();

  if (customerError) {
    console.error("Customer error:", customerError);
    return { success: false, error: "No se pudo crear el cliente." };
  }

  const orderNumber = generateOrderNumber();
  const registerSessionId = await getActiveRegisterSessionId();
  if (!registerSessionId) {
    return {
      success: false,
      error: "Por el momento no estamos tomando órdenes. Intenta más tarde.",
    };
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerData.id,
      order_number: orderNumber,
      status: "received",
      subtotal,
      tax: 0,
      fee_amount: feeAmount,
      total,
      payment_method: paymentMethod,
      payment_status: "pending",
      notes: customer.notes || null,
      register_session_id: registerSessionId,
    })
    .select("id, order_number")
    .single();

  if (orderError) {
    console.error("Order error:", orderError);
    return { success: false, error: "No se pudo crear la orden." };
  }

  const orderItems = await Promise.all(
    items.map(async (item) => {
      const productId = await resolveProductId(item);

      const itemNotes = [
        item.selectedProtein
          ? `Proteína: ${item.selectedProtein.label}${
              item.selectedProtein.extraPrice > 0
                ? ` (+$${item.selectedProtein.extraPrice.toFixed(2)})`
                : ""
            }`
          : "",
        item.notes?.trim() || "",
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        order_id: orderData.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        notes: itemNotes || null,
      };
    }),
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items error:", itemsError);
    return { success: false, error: "No se pudieron guardar los productos." };
  }

  return {
    success: true,
    orderNumber: orderData.order_number,
    loyaltyPoints: 0,
  };
}
