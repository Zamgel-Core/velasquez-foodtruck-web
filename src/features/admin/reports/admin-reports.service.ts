// 📍 Ruta: src/features/admin/reports/admin-reports.service.ts

import { supabase } from "../../../lib/supabase";

export type ReportRange = "today" | "yesterday" | "week" | "month" | "all";

export type ReportOrder = {
  id: string;
  order_number: string;
  total: number;
  payment_method: "cash" | "card" | "pending";
  payment_status: string;
  status: string;
  created_at: string;
  register_session_id: string | null;
};

export type CashRegisterReport = {
  id: string;
  opened_by_staff_id: string | null;
  closed_by_staff_id: string | null;
  opened_at: string;
  closed_at: string | null;
  starting_cash: number;
  ending_cash: number | null;
  expected_cash: number | null;
  cash_difference: number | null;
  cash_sales: number;
  card_sales: number;
  pending_sales: number;
  total_sales: number;
  order_count: number;
  cancelled_count: number;
  status: "open" | "closed";
  notes: string | null;
};

export type TopProductReport = {
  productName: string;
  quantity: number;
  total: number;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getDateRange(range: ReportRange) {
  const now = new Date();

  if (range === "all") {
    return {
      from: null,
      to: null,
      label: "Todo",
    };
  }

  if (range === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    return {
      from: startOfDay(yesterday).toISOString(),
      to: endOfDay(yesterday).toISOString(),
      label: "Ayer",
    };
  }

  if (range === "week") {
    const date = new Date(now);
    const day = date.getDay();
    const diff = date.getDate() - day;
    date.setDate(diff);

    return {
      from: startOfDay(date).toISOString(),
      to: null,
      label: "Esta semana",
    };
  }

  if (range === "month") {
    const date = new Date(now);
    date.setDate(1);

    return {
      from: startOfDay(date).toISOString(),
      to: null,
      label: "Este mes",
    };
  }

  return {
    from: startOfDay(now).toISOString(),
    to: null,
    label: "Hoy",
  };
}

function applyDateRange(query: any, column: string, range: ReportRange) {
  const dates = getDateRange(range);

  let next = query;

  if (dates.from) {
    next = next.gte(column, dates.from);
  }

  if (dates.to) {
    next = next.lte(column, dates.to);
  }

  return next;
}

async function getDeliveredOrdersByRange(range: ReportRange) {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("status", "delivered")
    .order("created_at", { ascending: false });

  query = applyDateRange(query, "created_at", range);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}

async function getCancelledOrdersByRange(range: ReportRange) {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("status", "cancelled")
    .order("created_at", { ascending: false });

  query = applyDateRange(query, "created_at", range);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}

export async function getReportsSummary(range: ReportRange = "today") {
  const [deliveredOrders, cancelledOrders] = await Promise.all([
    getDeliveredOrdersByRange(range),
    getCancelledOrdersByRange(range),
  ]);

  const totalSales = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const cashSales = deliveredOrders
    .filter((order) => order.payment_method === "cash")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const cardSales = deliveredOrders
    .filter((order) => order.payment_method === "card")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  return {
    rangeLabel: getDateRange(range).label,
    deliveredOrders,
    totalSales,
    cashSales,
    cardSales,
    ordersCount: deliveredOrders.length,
    cancelledCount: cancelledOrders.length,
    averageTicket:
      deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0,
  };
}

export async function getTopProducts(range: ReportRange = "today") {
  const orders = await getDeliveredOrdersByRange(range);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) return [] as TopProductReport[];

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      product_id,
      quantity,
      total_price,
      order_id,
      product:products(name)
    `
    )
    .in("order_id", orderIds);

  if (error) throw error;

  const map = new Map<string, TopProductReport>();

  for (const item of data ?? []) {
    const productName =
      (item.product as { name?: string } | null)?.name ?? "Producto";

    const current = map.get(productName) ?? {
      productName,
      quantity: 0,
      total: 0,
    };

    current.quantity += Number(item.quantity || 0);
    current.total += Number(item.total_price || 0);

    map.set(productName, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
}

export async function getRecentCashSessions(range: ReportRange = "today") {
  let query = supabase
    .from("cash_register_sessions")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(30);

  if (range !== "all") {
    query = applyDateRange(query, "opened_at", range);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as CashRegisterReport[];
}

export async function getCashSessionOrders(sessionId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("register_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}