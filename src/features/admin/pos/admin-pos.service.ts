// 📍 Ruta: src/features/admin/pos/admin-pos.service.ts

import { supabase } from "../../../lib/supabase";
import { getOpenRegisterSession } from "../register/admin-register.service";
import { redeemLoyaltyReward } from "../loyalty/loyalty.service";

export type POSProduct = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category?: {
    name: string;
  } | null;
};

export type POSProductOption = {
  id: string;
  product_id: string;
  option_group: string;
  option_name: string;
  extra_price: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number | null;
};

export type POSSelectedOption = POSProductOption;

export type POSCartItem = {
  cart_item_id?: string;
  product: POSProduct;
  quantity: number;
  notes?: string;
  selectedOptions?: POSSelectedOption[];
};

export type CreatePOSOrderInput = {
  customerName: string;
  customerPhone: string;
  notes: string;
  paymentMethod: "cash" | "card" | "pending";
  amountPaid: number;
  staffProfileId: string;
  items: POSCartItem[];
  loyaltyRewardId?: string | null;
  loyaltyDiscountAmount?: number;
  loyaltyRewardLabel?: string;
};

function generateOrderNumber() {
  const now = Date.now().toString().slice(-6);
  return `POS-${now}`;
}

export function getPOSItemUnitPrice(item: POSCartItem) {
  const optionsTotal =
    item.selectedOptions?.reduce(
      (sum, option) => sum + Number(option.extra_price || 0),
      0
    ) ?? 0;

  return Number(item.product.price) + optionsTotal;
}

function getPOSItemNotes(item: POSCartItem) {
  const optionText =
    item.selectedOptions && item.selectedOptions.length > 0
      ? item.selectedOptions
          .map((option) =>
            Number(option.extra_price || 0) > 0
              ? `${option.option_group}: ${option.option_name} +$${Number(
                  option.extra_price
                ).toFixed(2)}`
              : `${option.option_group}: ${option.option_name}`
          )
          .join(" | ")
      : "";

  return [optionText, item.notes?.trim()].filter(Boolean).join(" | ");
}

export async function getPOSProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category_id, name, description, price, image_url, is_available, category:categories(name)"
    )
    .eq("is_available", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as POSProduct[];
}

export async function getPOSProductOptions(productId: string) {
  const { data, error } = await supabase
    .from("product_options")
    .select(
      "id, product_id, option_group, option_name, extra_price, is_required, is_default, sort_order"
    )
    .eq("product_id", productId)
    .order("option_group", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as POSProductOption[];
}

export async function createPOSOrder(input: CreatePOSOrderInput) {
  const validItems = input.items.filter((item) => item.quantity > 0);

  if (validItems.length === 0) {
    throw new Error("Agrega productos antes de crear la orden.");
  }

  const subtotal = validItems.reduce(
    (sum, item) => sum + getPOSItemUnitPrice(item) * item.quantity,
    0
  );

  const requestedDiscount = Math.max(0, Number(input.loyaltyDiscountAmount || 0));
  const loyaltyDiscount = Math.min(subtotal, requestedDiscount);
  const total = Math.max(0, subtotal - loyaltyDiscount);
  const amountPaid = input.paymentMethod === "cash" ? input.amountPaid : total;
  const changeDue =
    input.paymentMethod === "cash" ? Math.max(0, amountPaid - total) : 0;

  const customerName = input.customerName.trim() || "Cliente POS";
  const customerPhone = input.customerPhone.trim();
  const loyaltyNote =
    input.loyaltyRewardId && input.loyaltyRewardLabel
      ? `Canje lealtad: ${input.loyaltyRewardLabel}${
          loyaltyDiscount > 0 ? ` (-$${loyaltyDiscount.toFixed(2)})` : ""
        }`
      : "";
  const combinedNotes = [input.notes.trim(), loyaltyNote].filter(Boolean).join(" | ");

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: customerName,
      phone: customerPhone || null,
      notes: combinedNotes || null,
    })
    .select("id")
    .single();

  if (customerError) throw customerError;

  const openSession = await getOpenRegisterSession();
  if (!openSession) {
  throw new Error("Primero debes abrir caja antes de crear órdenes POS.");
}
  
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customer.id,
      order_number: generateOrderNumber(),
      status: "received",
      subtotal,
      tax: 0,
      fee_amount: 0,
      total,
      payment_status: input.paymentMethod === "pending" ? "pending" : "paid",
      payment_method: input.paymentMethod === "pending" ? "cash" : input.paymentMethod,
      amount_paid: amountPaid,
      change_due: changeDue,
      notes: combinedNotes || null,
      order_source: "pos",
      created_by_staff_id: input.staffProfileId,
      register_session_id: openSession.id,
    })
    .select("id, order_number")
    .single();

  if (orderError) throw orderError;

  const orderItems = validItems.map((item) => {
    const unitPrice = getPOSItemUnitPrice(item);
    const notes = getPOSItemNotes(item);

    return {
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
      notes: notes || null,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("POS order_items error:", itemsError);

    await supabase.from("orders").delete().eq("id", order.id);
    await supabase.from("customers").delete().eq("id", customer.id);

    throw new Error("No se pudieron guardar los productos de la orden.");
  }

  if (input.loyaltyRewardId) {
    try {
      await redeemLoyaltyReward({
        customerPhone,
        rewardId: input.loyaltyRewardId,
        orderNumber: order.order_number,
        orderTotal: subtotal,
        source: "admin_pos",
      });
    } catch (loyaltyError) {
      console.error("POS loyalty redeem error:", loyaltyError);
      throw loyaltyError instanceof Error
        ? loyaltyError
        : new Error("No se pudo canjear la recompensa de lealtad.");
    }
  }

  return order;
}