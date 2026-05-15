// 📍 Ruta: src/features/admin/register/admin-register.service.ts

import { supabase } from "../../../lib/supabase";

export type CashRegisterSession = {
  id: string;
  opened_by_staff_id: string | null;
  closed_by_staff_id: string | null;
  opened_at: string;
  closed_at: string | null;
  starting_cash: number;
  ending_cash: number | null;
  cash_sales: number;
  card_sales: number;
  pending_sales: number;
  total_sales: number;
  order_count: number;
  cancelled_count: number;
  status: "open" | "closed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getOpenRegisterSession() {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data as CashRegisterSession | null;
}

export async function openRegisterSession(input: {
  staffProfileId: string;
  startingCash: number;
  notes?: string;
}) {
  const current = await getOpenRegisterSession();

  if (current) {
    throw new Error("Ya hay una caja abierta.");
  }

  const { data, error } = await supabase
    .from("cash_register_sessions")
    .insert({
      opened_by_staff_id: input.staffProfileId,
      starting_cash: input.startingCash,
      notes: input.notes?.trim() || null,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as CashRegisterSession;
}

export async function closeRegisterSession(input: {
  sessionId: string;
  staffProfileId: string;
  endingCash: number;
  notes?: string;
}) {
  const totals = await getRegisterSessionTotals(input.sessionId);

  const { data, error } = await supabase
    .from("cash_register_sessions")
    .update({
      closed_by_staff_id: input.staffProfileId,
      closed_at: new Date().toISOString(),
      ending_cash: input.endingCash,
      cash_sales: totals.cashSales,
      card_sales: totals.cardSales,
      pending_sales: totals.pendingSales,
      total_sales: totals.totalSales,
      order_count: totals.orderCount,
      cancelled_count: totals.cancelledCount,
      notes: input.notes?.trim() || null,
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .select("*")
    .single();

  if (error) throw error;

  return data as CashRegisterSession;
}

export async function getRegisterSessionTotals(sessionId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, payment_method, payment_status, status")
    .eq("register_session_id", sessionId);

  if (error) throw error;

  const rows = data ?? [];

  const activeOrders = rows.filter((order) => order.status === "delivered");
  const cancelledOrders = rows.filter((order) => order.status === "cancelled");

  const cashSales = activeOrders
    .filter((order) => order.payment_method === "cash")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const cardSales = activeOrders
    .filter((order) => order.payment_method === "card")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingSales = activeOrders
    .filter((order) => order.payment_status === "pending")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const totalSales = activeOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return {
    cashSales,
    cardSales,
    pendingSales,
    totalSales,
    orderCount: activeOrders.length,
    cancelledCount: cancelledOrders.length,
  };
}

export async function getRegisterSessionHistory() {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  return (data ?? []) as CashRegisterSession[];
}