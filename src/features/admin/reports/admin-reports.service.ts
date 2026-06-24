// 📍 Ruta: src/features/admin/reports/admin-reports.service.ts

import { supabase } from "../../../lib/supabase";

export type ReportRange = "today" | "yesterday" | "week" | "month" | "all" | "custom";

export type ReportDateFilter = {
  range: ReportRange;
  from?: string;
  to?: string;
};

export type ReportOrder = {
  id: string;
  order_number: string;
  subtotal: number;
  tax: number;
  fee_amount: number;
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

function parseLocalDate(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatRangeLabel(from?: string, to?: string) {
  if (!from && !to) return "Rango personalizado";
  const formatter = new Intl.DateTimeFormat("es-US", { month: "short", day: "2-digit", year: "numeric" });
  const fromDate = parseLocalDate(from);
  const toDate = parseLocalDate(to);
  if (fromDate && toDate) return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`;
  if (fromDate) return `Desde ${formatter.format(fromDate)}`;
  if (toDate) return `Hasta ${formatter.format(toDate)}`;
  return "Rango personalizado";
}

export function getReportDateRange(filter: ReportRange | ReportDateFilter) {
  const range = typeof filter === "string" ? filter : filter.range;
  const now = new Date();

  if (range === "custom") {
    const customFilter = typeof filter === "string" ? {} : filter;
    const fromDate = parseLocalDate(customFilter.from);
    const toDate = parseLocalDate(customFilter.to);

    return {
      from: fromDate ? startOfDay(fromDate).toISOString() : null,
      to: toDate ? endOfDay(toDate).toISOString() : null,
      label: formatRangeLabel(customFilter.from, customFilter.to),
    };
  }

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

function applyDateRange(query: any, column: string, filter: ReportRange | ReportDateFilter) {
  const dates = getReportDateRange(filter);

  let next = query;

  if (dates.from) {
    next = next.gte(column, dates.from);
  }

  if (dates.to) {
    next = next.lte(column, dates.to);
  }

  return next;
}

async function getDeliveredOrdersByRange(filter: ReportRange | ReportDateFilter) {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, subtotal, tax, fee_amount, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("status", "delivered")
    .order("created_at", { ascending: false });

  query = applyDateRange(query, "created_at", filter);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}

async function getCancelledOrdersByRange(filter: ReportRange | ReportDateFilter) {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, subtotal, tax, fee_amount, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("status", "cancelled")
    .order("created_at", { ascending: false });

  query = applyDateRange(query, "created_at", filter);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}

export async function getReportsSummary(filter: ReportRange | ReportDateFilter = "today") {
  const [deliveredOrders, cancelledOrders] = await Promise.all([
    getDeliveredOrdersByRange(filter),
    getCancelledOrdersByRange(filter),
  ]);

  const totalSales = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const subtotalSales = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.subtotal || 0),
    0
  );

  const taxTotal = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.tax || 0),
    0
  );

  const cashSales = deliveredOrders
    .filter((order) => order.payment_method === "cash")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const cardSales = deliveredOrders
    .filter((order) => order.payment_method === "card")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  return {
    rangeLabel: getReportDateRange(filter).label,
    deliveredOrders,
    totalSales,
    subtotalSales,
    taxTotal,
    cashSales,
    cardSales,
    ordersCount: deliveredOrders.length,
    cancelledCount: cancelledOrders.length,
    cancelledOrders,
    averageTicket:
      deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0,
  };
}

export async function getTopProducts(filter: ReportRange | ReportDateFilter = "today") {
  const orders = await getDeliveredOrdersByRange(filter);
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

export async function getRecentCashSessions(filter: ReportRange | ReportDateFilter = "today") {
  const range = typeof filter === "string" ? filter : filter.range;
  let query = supabase
    .from("cash_register_sessions")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(30);

  if (range !== "all") {
    query = applyDateRange(query, "opened_at", filter);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as CashRegisterReport[];
}

export async function getCashSessionOrders(sessionId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, subtotal, tax, fee_amount, total, payment_method, payment_status, status, created_at, register_session_id"
    )
    .eq("register_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as ReportOrder[];
}