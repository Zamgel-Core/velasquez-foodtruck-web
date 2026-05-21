// 📍 Ruta: src/features/admin/kaizen/kaizen.service.ts

import { supabase } from "../../../lib/supabase";
import { KAIZEN_FOOD_TRUCK_TIPS } from "./kaizen.knowledge";
import type {
  KaizenDashboardData,
  KaizenInsight,
  KaizenInventoryAlert,
  KaizenRange,
  KaizenTip,
  KaizenTopProduct,
  KaizenWasteSummary,
} from "./kaizen.types";

type RawOrder = {
  id: string;
  order_number?: string | null;
  total: number | string | null;
  payment_method?: "cash" | "card" | "pending" | string | null;
  payment_status?: string | null;
  status: string | null;
  created_at: string;
};

type RawOrderItem = {
  id: string;
  order_id: string;
  quantity: number | string | null;
  total_price: number | string | null;
  product?: { name?: string | null } | null;
};

type RawInventoryItem = {
  id: string;
  name: string | null;
  unit: string | null;
  current_stock: number | string | null;
  min_stock: number | string | null;
  cost_per_unit: number | string | null;
  is_active: boolean | null;
};

type RawWasteEvent = {
  id: string;
  reason_type: string | null;
  estimated_loss: number | string | null;
  created_at: string;
};

type RawLoyaltyCustomer = {
  id: string;
  full_name?: string | null;
  points?: number | string | null;
  visits?: number | string | null;
  lifetime_spend?: number | string | null;
  is_active?: boolean | null;
};

function normalizeNumber(value: unknown): number {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDateFromRange(range: KaizenRange): string | null {
  const now = new Date();

  if (range === "all") return null;

  if (range === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day;
    const start = new Date(now);
    start.setDate(diff);
    return startOfDay(start).toISOString();
  }

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfDay(start).toISOString();
  }

  return startOfDay(now).toISOString();
}

async function safeQuery<T>(label: string, query: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    console.warn(`Kaizen AI could not load ${label}:`, error);
    return [];
  }

  return (data ?? []) as T[];
}

async function getOrders(range: KaizenRange): Promise<RawOrder[]> {
  const fromDate = getDateFromRange(range);
  let query = supabase
    .from("orders")
    .select("id, order_number, total, payment_method, payment_status, status, created_at")
    .order("created_at", { ascending: false })
    .limit(600);

  if (fromDate) {
    query = query.gte("created_at", fromDate);
  }

  return safeQuery<RawOrder>("orders", query);
}

async function getOrderItems(orderIds: string[]): Promise<RawOrderItem[]> {
  if (orderIds.length === 0) return [];

  const { data, error } = await supabase
    .from("order_items")
    .select("id, order_id, quantity, total_price, product:products(name)")
    .in("order_id", orderIds);

  if (error) {
    console.warn("Kaizen AI could not load order items:", error);
    return [];
  }

  return (data ?? []) as RawOrderItem[];
}

async function getInventoryItems(): Promise<RawInventoryItem[]> {
  return safeQuery<RawInventoryItem>(
    "inventory_items",
    supabase
      .from("inventory_items")
      .select("id, name, unit, current_stock, min_stock, cost_per_unit, is_active")
      .eq("is_active", true)
      .order("current_stock", { ascending: true }),
  );
}

async function getWasteEvents(range: KaizenRange): Promise<RawWasteEvent[]> {
  const fromDate = getDateFromRange(range);
  let query = supabase
    .from("inventory_waste_events")
    .select("id, reason_type, estimated_loss, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (fromDate) {
    query = query.gte("created_at", fromDate);
  }

  return safeQuery<RawWasteEvent>("inventory_waste_events", query);
}

async function getLoyaltyCustomers(): Promise<RawLoyaltyCustomer[]> {
  return safeQuery<RawLoyaltyCustomer>(
    "loyalty_customers",
    supabase
      .from("loyalty_customers")
      .select("id, full_name, points, visits, lifetime_spend, is_active")
      .eq("is_active", true)
      .order("points", { ascending: false })
      .limit(100),
  );
}

function buildTopProducts(items: RawOrderItem[]): KaizenTopProduct[] {
  const map = new Map<string, KaizenTopProduct>();

  for (const item of items) {
    const productName = item.product?.name?.trim() || "Producto sin nombre";
    const current = map.get(productName) ?? {
      productName,
      quantity: 0,
      total: 0,
    };

    current.quantity += normalizeNumber(item.quantity);
    current.total += normalizeNumber(item.total_price);
    map.set(productName, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);
}

function buildInventoryAlerts(items: RawInventoryItem[]): KaizenInventoryAlert[] {
  return items
    .map((item) => {
      const currentStock = normalizeNumber(item.current_stock);
      const minStock = normalizeNumber(item.min_stock);

      if (currentStock <= 0) {
        return {
          id: item.id,
          name: item.name ?? "Item",
          currentStock,
          minStock,
          unit: item.unit ?? "",
          status: "out" as const,
        };
      }

      if (minStock > 0 && currentStock <= minStock * 0.5) {
        return {
          id: item.id,
          name: item.name ?? "Item",
          currentStock,
          minStock,
          unit: item.unit ?? "",
          status: "critical" as const,
        };
      }

      if (minStock > 0 && currentStock <= minStock) {
        return {
          id: item.id,
          name: item.name ?? "Item",
          currentStock,
          minStock,
          unit: item.unit ?? "",
          status: "low" as const,
        };
      }

      return null;
    })
    .filter((item): item is KaizenInventoryAlert => Boolean(item))
    .slice(0, 10);
}

function readableReason(reason: string | null | undefined): string {
  const labels: Record<string, string> = {
    kitchen_error: "Error de cocina",
    gift: "Regalo / cortesía",
    internal_use: "Consumo interno",
    operational_use: "Uso operativo",
    damaged: "Producto dañado",
    expired: "Producto vencido",
    spillage: "Derrame / caída",
    manual_waste: "Merma general",
  };

  return labels[reason ?? ""] ?? "Sin clasificar";
}

function buildWasteSummary(events: RawWasteEvent[]): KaizenWasteSummary {
  const reasonMap = new Map<string, number>();
  let totalEstimatedLoss = 0;
  let operationalUseEvents = 0;

  for (const event of events) {
    const reason = event.reason_type ?? "unknown";
    reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
    totalEstimatedLoss += normalizeNumber(event.estimated_loss);
    if (reason === "operational_use") operationalUseEvents += 1;
  }

  const topReason = Array.from(reasonMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    totalEvents: events.length,
    totalEstimatedLoss,
    topReason: topReason ? readableReason(topReason) : "Sin registros",
    operationalUseEvents,
  };
}

function buildTips(params: {
  inventoryAlerts: KaizenInventoryAlert[];
  wasteSummary: KaizenWasteSummary;
  topProducts: KaizenTopProduct[];
  averageTicket: number;
  loyaltyCustomers: RawLoyaltyCustomer[];
}): KaizenTip[] {
  const selected = new Map<string, KaizenTip>();

  const addById = (id: string) => {
    const tip = KAIZEN_FOOD_TRUCK_TIPS.find((item) => item.id === id);
    if (tip) selected.set(tip.id, tip);
  };

  const addByCategory = (category: KaizenTip["category"], limit = 2) => {
    const categoryTips = KAIZEN_FOOD_TRUCK_TIPS.filter((item) => item.category === category);
    for (const tip of categoryTips) {
      if ([...selected.values()].filter((item) => item.category === category).length >= limit) break;
      selected.set(tip.id, tip);
    }
  };

  if (params.inventoryAlerts.length > 0) {
    addById("inventory_001");
    addById("inventory_004");
    addByCategory("inventory", 3);
  }

  if (params.wasteSummary.totalEvents > 0) {
    addById("waste_001");
    addById("waste_020");
    addByCategory("waste", 3);
  }

  if (params.wasteSummary.operationalUseEvents > 0) {
    addById("waste_002");
    addById("waste_007");
  }

  if (params.topProducts.length > 0 || (params.averageTicket > 0 && params.averageTicket < 12)) {
    addById("sales_001");
    addById("sales_002");
    addById("sales_003");
    addByCategory("sales", 3);
  }

  if (params.loyaltyCustomers.some((customer) => normalizeNumber(customer.points) >= 20)) {
    addById("loyalty_002");
    addById("loyalty_015");
  }

  addByCategory("operations", 2);
  addByCategory("marketing", 2);

  const rotationStart = new Date().getDate() % KAIZEN_FOOD_TRUCK_TIPS.length;
  const rotatedTips = [
    ...KAIZEN_FOOD_TRUCK_TIPS.slice(rotationStart),
    ...KAIZEN_FOOD_TRUCK_TIPS.slice(0, rotationStart),
  ];

  for (const tip of rotatedTips) {
    if (selected.size >= 12) break;
    selected.set(tip.id, tip);
  }

  return Array.from(selected.values()).slice(0, 12);
}

function buildInsights(params: {
  deliveredOrders: RawOrder[];
  cancelledOrders: RawOrder[];
  totalSales: number;
  averageTicket: number;
  topProducts: KaizenTopProduct[];
  inventoryAlerts: KaizenInventoryAlert[];
  wasteSummary: KaizenWasteSummary;
  loyaltyCustomers: RawLoyaltyCustomer[];
}): KaizenInsight[] {
  const insights: KaizenInsight[] = [];

  if (params.deliveredOrders.length === 0) {
    insights.push({
      id: "no-sales-yet",
      title: "Aún no hay ventas entregadas en este rango",
      message:
        "Kaizen puede mostrar mejores recomendaciones cuando existan órdenes entregadas. Por ahora revisa inventario, preparación y promociones del día.",
      category: "operations",
      priority: "medium",
      actionLabel: "Revisar operación",
    });
  } else {
    insights.push({
      id: "sales-summary",
      title: "Resumen inteligente de ventas",
      message: `Se registraron ${params.deliveredOrders.length} órdenes entregadas con ${money(params.totalSales)} en ventas. El ticket promedio está en ${money(params.averageTicket)}.`,
      category: "sales",
      priority: "positive",
      actionLabel: "Usar como referencia",
    });
  }

  const bestProduct = params.topProducts[0];
  if (bestProduct) {
    insights.push({
      id: "top-product",
      title: `${bestProduct.productName} está liderando ventas`,
      message: `Este producto lleva ${bestProduct.quantity} unidades registradas. Considera empujarlo en combo con bebida o acompañamiento para subir el ticket promedio.`,
      category: "sales",
      priority: "positive",
      actionLabel: "Crear combo sugerido",
    });
  }

  if (params.averageTicket > 0 && params.averageTicket < 12) {
    insights.push({
      id: "low-average-ticket",
      title: "Ticket promedio con oportunidad de mejora",
      message:
        "El ticket promedio está relativamente bajo. Una sugerencia simple en caja como bebida + platillo puede mejorar ingresos sin aumentar mucho la carga de cocina.",
      category: "sales",
      priority: "medium",
      actionLabel: "Probar upsell",
    });
  }

  if (params.inventoryAlerts.length > 0) {
    const criticalCount = params.inventoryAlerts.filter((item) => item.status === "critical" || item.status === "out").length;
    insights.push({
      id: "inventory-alerts",
      title: criticalCount > 0 ? "Hay inventario crítico" : "Hay inventario bajo",
      message: `${params.inventoryAlerts.length} item(s) necesitan revisión. Prioriza los agotados/críticos antes del siguiente turno para evitar bloquear ventas.`,
      category: "inventory",
      priority: criticalCount > 0 ? "high" : "medium",
      actionLabel: "Revisar inventario",
    });
  }

  if (params.wasteSummary.totalEvents > 0) {
    insights.push({
      id: "waste-summary",
      title: "Merma registrada detectada",
      message: `Hay ${params.wasteSummary.totalEvents} registro(s) de merma. Motivo principal: ${params.wasteSummary.topReason}. Pérdida estimada: ${money(params.wasteSummary.totalEstimatedLoss)}.`,
      category: "waste",
      priority: params.wasteSummary.totalEstimatedLoss > 25 ? "high" : "medium",
      actionLabel: "Analizar merma",
    });
  }

  if (params.wasteSummary.operationalUseEvents > 0) {
    insights.push({
      id: "operational-use",
      title: "Uso operativo en movimiento",
      message:
        "Se registró uso operativo. Esto es ideal para guantes, bolsas, servilletas y limpieza. Mantenerlo separado de consumo interno hará los reportes más claros.",
      category: "operations",
      priority: "low",
      actionLabel: "Mantener categoría",
    });
  }

  if (params.cancelledOrders.length > 0) {
    insights.push({
      id: "cancelled-orders",
      title: "Órdenes canceladas detectadas",
      message: `Hay ${params.cancelledOrders.length} orden(es) canceladas en este rango. Revisa si fueron errores de captura, falta de stock o problemas de cocina.`,
      category: "operations",
      priority: "medium",
      actionLabel: "Revisar cancelaciones",
    });
  }

  const redeemableCustomers = params.loyaltyCustomers.filter((customer) => normalizeNumber(customer.points) >= 20).length;
  if (redeemableCustomers > 0) {
    insights.push({
      id: "loyalty-ready",
      title: "Clientes con puntos disponibles",
      message: `${redeemableCustomers} cliente(s) tienen puntos suficientes para recibir una recomendación de canje. Mencionarlo en caja puede aumentar regreso y satisfacción.`,
      category: "loyalty",
      priority: "positive",
      actionLabel: "Recordar en caja",
    });
  }

  return insights.slice(0, 10);
}

function buildAssistantContext(params: {
  deliveredOrders: RawOrder[];
  totalSales: number;
  averageTicket: number;
  topProducts: KaizenTopProduct[];
  inventoryAlerts: KaizenInventoryAlert[];
  wasteSummary: KaizenWasteSummary;
}): string {
  const topProduct = params.topProducts[0]?.productName ?? "sin producto líder todavía";
  const alerts = params.inventoryAlerts.length;

  return [
    `Ventas entregadas: ${params.deliveredOrders.length}`,
    `Venta total: ${money(params.totalSales)}`,
    `Ticket promedio: ${money(params.averageTicket)}`,
    `Producto líder: ${topProduct}`,
    `Alertas de inventario: ${alerts}`,
    `Mermas registradas: ${params.wasteSummary.totalEvents}`,
    `Pérdida estimada: ${money(params.wasteSummary.totalEstimatedLoss)}`,
  ].join(" · ");
}

export async function getKaizenDashboardData(range: KaizenRange = "today"): Promise<KaizenDashboardData> {
  const [orders, inventoryItems, wasteEvents, loyaltyCustomers] = await Promise.all([
    getOrders(range),
    getInventoryItems(),
    getWasteEvents(range),
    getLoyaltyCustomers(),
  ]);

  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const deliveredOrderIds = deliveredOrders.map((order) => order.id);
  const orderItems = await getOrderItems(deliveredOrderIds);

  const totalSales = deliveredOrders.reduce((sum, order) => sum + normalizeNumber(order.total), 0);
  const averageTicket = deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0;
  const cashSales = deliveredOrders
    .filter((order) => order.payment_method === "cash")
    .reduce((sum, order) => sum + normalizeNumber(order.total), 0);
  const cardSales = deliveredOrders
    .filter((order) => order.payment_method === "card")
    .reduce((sum, order) => sum + normalizeNumber(order.total), 0);

  const topProducts = buildTopProducts(orderItems);
  const inventoryAlerts = buildInventoryAlerts(inventoryItems);
  const wasteSummary = buildWasteSummary(wasteEvents);

  const insights = buildInsights({
    deliveredOrders,
    cancelledOrders,
    totalSales,
    averageTicket,
    topProducts,
    inventoryAlerts,
    wasteSummary,
    loyaltyCustomers,
  });

  const tips = buildTips({
    inventoryAlerts,
    wasteSummary,
    topProducts,
    averageTicket,
    loyaltyCustomers,
  });

  return {
    range,
    generatedAt: new Date().toISOString(),
    metrics: [
      {
        label: "Ventas",
        value: money(totalSales),
        helper: `${deliveredOrders.length} órdenes entregadas`,
      },
      {
        label: "Ticket promedio",
        value: money(averageTicket),
        helper: averageTicket > 0 && averageTicket < 12 ? "Oportunidad de upsell" : "Buen indicador operativo",
      },
      {
        label: "Cash / Card",
        value: `${money(cashSales)} / ${money(cardSales)}`,
        helper: "Separación rápida de pagos",
      },
      {
        label: "Alertas stock",
        value: String(inventoryAlerts.length),
        helper: inventoryAlerts.length > 0 ? "Revisión recomendada" : "Sin alertas críticas",
      },
      {
        label: "Merma",
        value: money(wasteSummary.totalEstimatedLoss),
        helper: `${wasteSummary.totalEvents} registro(s)`,
      },
      {
        label: "Clientes loyalty",
        value: String(loyaltyCustomers.length),
        helper: "Base activa para retención",
      },
    ],
    insights,
    tips,
    topProducts,
    inventoryAlerts,
    wasteSummary,
    assistantContext: buildAssistantContext({
      deliveredOrders,
      totalSales,
      averageTicket,
      topProducts,
      inventoryAlerts,
      wasteSummary,
    }),
  };
}

function findTipByCategory(category: KaizenTip["category"], offset = 0): KaizenTip | undefined {
  const dayOffset = new Date().getDate() + offset;
  const categoryTips = KAIZEN_FOOD_TRUCK_TIPS.filter((tip) => tip.category === category);
  return categoryTips[dayOffset % Math.max(categoryTips.length, 1)];
}

function buildTipLine(category: KaizenTip["category"], offset = 0): string {
  const tip = findTipByCategory(category, offset);
  return tip ? `\n\nTip Kaizen: ${tip.body}` : "";
}

type KaizenChatIntent =
  | "empty"
  | "loading"
  | "today_review"
  | "opening_checklist"
  | "closing_checklist"
  | "rush_time"
  | "long_line"
  | "operation_bottleneck"
  | "stock_critical"
  | "buy_soon"
  | "sensitive_inventory"
  | "inventory_organization"
  | "possible_stockout"
  | "slow_products"
  | "sales_status"
  | "raise_average_ticket"
  | "combo_recommendation"
  | "push_product"
  | "low_sales"
  | "sell_more_drinks"
  | "waste_general"
  | "reduce_waste"
  | "classify_supplies"
  | "control_courtesies"
  | "waste_priority"
  | "detect_losses"
  | "loyalty_returning_customers"
  | "use_points"
  | "cashier_loyalty_script"
  | "promote_rewards"
  | "vip_customers"
  | "post_today"
  | "tiktok"
  | "promotion"
  | "attract_customers"
  | "promote_top_product"
  | "ask_reviews"
  | "capabilities"
  | "general";

function hasAny(text: string, ...words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function classifyKaizenIntent(question: string): KaizenChatIntent {
  const normalized = question.trim().toLowerCase();

  if (!normalized) return "empty";

  if (hasAny(normalized, "funciones", "qué haces", "que haces", "para qué sirves", "para que sirves", "puedes hacer")) return "capabilities";

  if (hasAny(normalized, "antes de abrir", "abrir", "apertura")) return "opening_checklist";
  if (hasAny(normalized, "cerrar", "cierre", "al cerrar")) return "closing_checklist";
  if (hasAny(normalized, "hora pico", "rush", "reducir tiempos", "tiempos en hora pico")) return "rush_time";
  if (hasAny(normalized, "mucha fila", "fila larga", "fila")) return "long_line";
  if (hasAny(normalized, "frenando", "atorando", "cuello de botella", "lento", "operación lenta", "operacion lenta")) return "operation_bottleneck";

  if (hasAny(normalized, "stock está crítico", "stock esta critico", "stock crítico", "stock critico", "inventario crítico", "inventario critico")) return "stock_critical";
  if (hasAny(normalized, "comprar pronto", "debo comprar", "lista de compra", "compras")) return "buy_soon";
  if (hasAny(normalized, "inventario sensible", "sensible")) return "sensitive_inventory";
  if (hasAny(normalized, "organizo", "organizar", "acomodo", "acomodar")) return "inventory_organization";
  if (hasAny(normalized, "pueden agotarse", "podrían agotarse", "podrian agotarse", "agotarse")) return "possible_stockout";
  if (hasAny(normalized, "productos lentos", "producto lento", "lentos")) return "slow_products";

  if (hasAny(normalized, "cómo van las ventas", "como van las ventas", "ventas")) return "sales_status";
  if (hasAny(normalized, "ticket promedio", "subo el ticket", "aumentar ticket")) return "raise_average_ticket";
  if (hasAny(normalized, "combo", "combos")) return "combo_recommendation";
  if (hasAny(normalized, "producto debo empujar", "producto empujar", "empujar")) return "push_product";
  if (hasAny(normalized, "pocas ventas", "bajas ventas", "no hay ventas")) return "low_sales";
  if (hasAny(normalized, "vendo más bebidas", "vendo mas bebidas", "bebidas")) return "sell_more_drinks";

  if (hasAny(normalized, "clasifico guantes", "guantes y bolsas", "guantes", "bolsas", "servilletas", "vasos")) return "classify_supplies";
  if (hasAny(normalized, "reduzco desperdicio", "reducir desperdicio", "desperdicio")) return "reduce_waste";
  if (hasAny(normalized, "controlo cortesías", "controlo cortesias", "cortesías", "cortesias", "regalo", "regalos")) return "control_courtesies";
  if (hasAny(normalized, "merma debo revisar", "revisar primero")) return "waste_priority";
  if (hasAny(normalized, "pérdidas raras", "perdidas raras", "detecto pérdidas", "detecto perdidas", "pérdidas", "perdidas")) return "detect_losses";
  if (hasAny(normalized, "merma")) return "waste_general";

  if (hasAny(normalized, "clientes recurrentes", "recurrentes", "regreso")) return "loyalty_returning_customers";
  if (hasAny(normalized, "uso mejor los puntos", "puntos")) return "use_points";
  if (hasAny(normalized, "digo en caja", "caja sobre lealtad")) return "cashier_loyalty_script";
  if (hasAny(normalized, "promuevo recompensas", "recompensas")) return "promote_rewards";
  if (hasAny(normalized, "clientes debo cuidar", "vip")) return "vip_customers";
  if (hasAny(normalized, "lealtad", "loyalty", "fidelidad")) return "loyalty_returning_customers";

  if (hasAny(normalized, "qué publico hoy", "que publico hoy", "publico hoy")) return "post_today";
  if (hasAny(normalized, "tiktok")) return "tiktok";
  if (hasAny(normalized, "promoción", "promocion", "promo")) return "promotion";
  if (hasAny(normalized, "atraigo", "más clientes", "mas clientes")) return "attract_customers";
  if (hasAny(normalized, "promociono el producto líder", "promociono el producto lider", "producto líder", "producto lider")) return "promote_top_product";
  if (hasAny(normalized, "reseñas", "resenas", "review", "reviews")) return "ask_reviews";
  if (hasAny(normalized, "redes", "instagram", "marketing", "foto", "video", "publicar")) return "post_today";

  if (hasAny(normalized, "hoy", "revisar", "prioridad", "recomiendas", "recomendación", "recomendacion")) return "today_review";

  return "general";
}

function formatAlertList(alerts: KaizenInventoryAlert[], limit = 5): string {
  if (alerts.length === 0) return "sin alertas críticas visibles";
  return alerts
    .slice(0, limit)
    .map((item) => `${item.name} (${item.currentStock} ${item.unit || "u"}, mínimo ${item.minStock} ${item.unit || "u"})`)
    .join(", ");
}

function formatTopProduct(data: KaizenDashboardData): string {
  const leader = data.topProducts[0];
  return leader ? `${leader.productName} (${leader.quantity} unidades)` : "todavía sin producto líder";
}

function getMetricValue(data: KaizenDashboardData, label: string, fallback = "0"): string {
  return data.metrics.find((metric) => metric.label === label)?.value ?? fallback;
}

function buildNoDataNotice(data: KaizenDashboardData): string {
  return data.topProducts.length === 0
    ? "Como todavía no hay suficientes ventas entregadas en este rango, toma esto como checklist operativo inicial."
    : "Estoy usando ventas entregadas, inventario, merma y lealtad del rango seleccionado.";
}

function answerTodayReview(data: KaizenDashboardData): string {
  const firstInsight = data.insights[0];
  const stockText = data.inventoryAlerts.length > 0
    ? `1) Inventario: revisa ${formatAlertList(data.inventoryAlerts, 4)}.`
    : "1) Inventario: no veo alertas críticas, pero confirma tortillas, bebidas, salsas y empaques antes del rush.";
  const salesText = data.topProducts[0]
    ? `2) Ventas: usa ${formatTopProduct(data)} como producto ancla para sugerir bebida o complemento.`
    : "2) Ventas: como aún no hay líder claro, empuja un producto rápido + bebida para generar datos del día.";
  const wasteText = `3) Merma: hay ${data.wasteSummary.totalEvents} registro(s), pérdida estimada ${money(data.wasteSummary.totalEstimatedLoss)}.`;
  const insightText = firstInsight ? `\n\nPrioridad de Kaizen: ${firstInsight.title}. ${firstInsight.message}` : "";
  return `${buildNoDataNotice(data)}\n\n${stockText}\n${salesText}\n${wasteText}${insightText}${buildTipLine("operations", 1)}`;
}

function answerOpeningChecklist(data: KaizenDashboardData): string {
  return `Antes de abrir, haz una revisión rápida de 7 puntos:\n\n1) Stock crítico: ${formatAlertList(data.inventoryAlerts, 5)}.\n2) Bebidas frías listas.\n3) Salsas, limones, cebolla/cilantro y toppings preparados.\n4) Empaques: bolsas, charolas, servilletas, vasos y guantes.\n5) Caja: terminal cargada, cambio disponible y método de pago probado.\n6) Menú: productos agotados ocultos o avisados.\n7) Lealtad: cajero listo para pedir teléfono y mencionar puntos.\n\nLa apertura debe evitar sorpresas, no solo prender la cocina.${buildTipLine("operations", 2)}`;
}

function answerClosingChecklist(data: KaizenDashboardData): string {
  return `Al cerrar turno, Kaizen recomienda cerrar con evidencia:\n\n1) Cuenta inventario sensible y compara contra sistema.\n2) Registra merma real: errores, vencidos, cortesías y uso operativo.\n3) Revisa productos agotados para lista de compra.\n4) Anota qué producto se movió mejor: ${formatTopProduct(data)}.\n5) Separa cash/card y revisa órdenes canceladas.\n6) Deja notas para el siguiente turno.\n\nUn cierre de 10 minutos puede evitar compras mal hechas y faltantes mañana.${buildTipLine("inventory", 3)}`;
}

function answerRushTime(data: KaizenDashboardData): string {
  return `Para reducir tiempos en hora pico, no empieces por hacer más cosas: empieza por quitar fricción.\n\nPrioridad rápida:\n1) Empuja productos de preparación rápida.\n2) Ten bebidas frías y visibles.\n3) Deja salsas/empaques listos antes de la fila.\n4) Divide roles: caja, armado, cocina, entrega.\n5) Si algo está agotado, sácalo rápido para no perder tiempo explicando.\n\nRiesgo actual: ${data.inventoryAlerts.length} alerta(s) de inventario. Si una alerta bloquea productos populares, esa alerta se vuelve urgente.${buildTipLine("operations", 4)}`;
}

function answerLongLine(data: KaizenDashboardData): string {
  return `Si hay mucha fila, el objetivo no es vender todo: es vender lo que fluye mejor.\n\nAcción recomendada:\n1) Ofrece 2 o 3 opciones rápidas, no todo el menú.\n2) Da tiempos reales para evitar clientes molestos.\n3) Prepara bebidas/aguas como add-on rápido.\n4) Separa cobro y entrega si hay personal suficiente.\n5) Evita modificaciones complejas durante rush.\n\nProducto útil para empujar: ${formatTopProduct(data)}. Si no hay líder, empuja tacos/bebida por rapidez.${buildTipLine("sales", 4)}`;
}

function answerOperationBottleneck(data: KaizenDashboardData): string {
  return `Para detectar qué frena la operación, revisa el cuello de botella en este orden:\n\n1) Caja: ¿se tarda tomando datos, pagos o teléfono loyalty?\n2) Cocina: ¿falta mise en place o hay productos muy lentos?\n3) Inventario: ¿hay que buscar insumos durante el rush?\n4) Empaque: ¿faltan bolsas, charolas, servilletas o vasos?\n5) Entrega: ¿las órdenes listas se quedan esperando?\n\nSeñal actual: ${data.inventoryAlerts.length} alerta(s) de stock. Si el equipo busca productos durante servicio, ahí se están yendo minutos reales.${buildTipLine("operations", 5)}`;
}

function answerStockCritical(data: KaizenDashboardData): string {
  if (data.inventoryAlerts.length === 0) {
    return `No veo stock crítico en este rango. Aun así, revisa físicamente los insumos que bloquean varias ventas: tortillas, carne, masa, queso, bebidas, vasos y empaques.\n\nKaizen recomienda no esperar a cero: si un producto tiene alto impacto operativo, súbele el mínimo antes del siguiente rush.${buildTipLine("inventory", 4)}`;
  }

  const out = data.inventoryAlerts.filter((item) => item.status === "out");
  const critical = data.inventoryAlerts.filter((item) => item.status === "critical");
  const low = data.inventoryAlerts.filter((item) => item.status === "low");

  return `Stock crítico detectado:\n\nAgotados: ${out.length ? formatAlertList(out, 5) : "ninguno"}.\nCríticos: ${critical.length ? formatAlertList(critical, 5) : "ninguno"}.\nBajos: ${low.length ? formatAlertList(low, 5) : "ninguno"}.\n\nOrden de acción: primero lo agotado, luego lo que bloquea productos populares, después empaques y bebidas. No todos los bajos tienen el mismo impacto.${buildTipLine("inventory", 5)}`;
}

function answerBuySoon(data: KaizenDashboardData): string {
  const alerts = data.inventoryAlerts;
  if (alerts.length === 0) {
    return `Lista de compra sugerida: por ahora no hay alertas, pero antes de comprar revisa físicamente lo que más se mueve y lo que no se ve a simple vista: bolsas, guantes, vasos, servilletas, tapas, bebidas y salsas.\n\nNo compres solo por costumbre; compra según stock, ventas y espacio real del truck.${buildTipLine("inventory", 6)}`;
  }

  const purchaseList = alerts
    .slice(0, 8)
    .map((item, index) => `${index + 1}) ${item.name}: actual ${item.currentStock} ${item.unit || "u"}, mínimo ${item.minStock} ${item.unit || "u"}`)
    .join("\n");

  return `Compra pronto estos productos, en este orden:\n\n${purchaseList}\n\nRecomendación: separa “urgente para vender hoy” de “resurtido para la semana”. Si todo se compra como urgente, se pierde control y se gasta de más.${buildTipLine("inventory", 7)}`;
}

function answerSensitiveInventory(data: KaizenDashboardData): string {
  return `Inventario sensible para esta food truck:\n\n1) Bases de venta: tortillas, masa, carnes, queso y pan.\n2) Bebidas: horchata, Jamaica, pepino limón, Jarritos y Coca-Cola.\n3) Servicio: bolsas, charolas, vasos, tapas, servilletas y guantes.\n4) Sabor/experiencia: salsas, limón, cebolla/cilantro.\n5) Limpieza: químicos, toallas y artículos sanitarios.\n\nHoy Kaizen ve ${data.inventoryAlerts.length} alerta(s). Lo sensible no siempre es lo más caro; es lo que puede detener ventas.${buildTipLine("inventory", 8)}`;
}

function answerInventoryOrganization(data: KaizenDashboardData): string {
  return `Para organizar mejor inventario, divídelo por uso operativo, no solo por nombre:\n\n1) Ingredientes que bloquean ventas.\n2) Bebidas listas para vender.\n3) Empaques/servicio.\n4) Limpieza y seguridad.\n5) Stock de respaldo.\n\nUsa mínimos claros por item y notas en cada ajuste manual. Si un empleado cambia stock sin nota, después no sabrás si fue venta, merma, error o uso operativo.${buildTipLine("inventory", 9)}`;
}

function answerPossibleStockout(data: KaizenDashboardData): string {
  const alerts = data.inventoryAlerts.length ? formatAlertList(data.inventoryAlerts, 7) : "ninguno crítico visible";
  return `Productos con riesgo de agotarse: ${alerts}.\n\nLa regla práctica: si un item aparece bajo mínimo y además afecta varios productos, debe tratarse como prioridad máxima. Ejemplo: tortillas, carne, masa, queso, bebidas y empaques.\n\nTambién revisa productos invisibles: tapas, vasos, servilletas, guantes y bolsas suelen acabarse sin que nadie los note hasta que ya hay fila.${buildTipLine("inventory", 10)}`;
}

function answerSlowProducts(data: KaizenDashboardData): string {
  const leaders = data.topProducts.slice(0, 3).map((item) => item.productName).join(", ") || "todavía sin líderes";
  return `Para productos lentos, no los descuentos de inmediato. Primero decide si el problema es visibilidad, precio, preparación o demanda.\n\nPlan simple:\n1) Ponlos como add-on o combo con productos fuertes (${leaders}).\n2) Muéstralos mejor en redes o menú.\n3) Si siguen lentos, baja producción para no generar merma.\n4) Si ocupan mucho espacio, considera pausarlos.\n\nProducto lento no siempre es malo; malo es producirlo igual que uno popular.${buildTipLine("sales", 5)}`;
}

function answerSalesStatus(data: KaizenDashboardData): string {
  return `Ventas del rango seleccionado:\n\nVenta total: ${getMetricValue(data, "Ventas")}.\nTicket promedio: ${getMetricValue(data, "Ticket promedio")}.\nProducto líder: ${formatTopProduct(data)}.\nCash/Card: ${getMetricValue(data, "Cash / Card")}.\n\nLectura de Kaizen: si el ticket promedio está bajo, la primera mejora debe ser sugerir bebida o complemento; si no hay producto líder, todavía falta volumen de ventas entregadas para sacar patrón confiable.${buildTipLine("sales", 6)}`;
}

function answerRaiseAverageTicket(data: KaizenDashboardData): string {
  const leader = formatTopProduct(data);
  return `Para subir ticket promedio, evita empezar con descuentos. Usa upsell pequeño:\n\n1) “¿Le agrego bebida?”\n2) “¿Quiere salsa extra o complemento?”\n3) “Tenemos combo con ${leader}.”\n4) Muestra recompensas de lealtad en caja.\n\nMeta: que cada orden suba $2–$4 sin hacer más lento el servicio. En food truck, el mejor upsell es rápido, fácil de decir y fácil de preparar.${buildTipLine("sales", 7)}`;
}

function answerComboRecommendation(data: KaizenDashboardData): string {
  const leader = data.topProducts[0]?.productName ?? "un producto popular como tacos o burrito";
  return `Combo recomendado para probar: ${leader} + bebida.\n\nVariantes simples:\n1) Combo rápido: producto fuerte + Coca/Jarritos.\n2) Combo fresco: producto fuerte + agua fresca.\n3) Combo familiar: varios tacos/mini tacos + bebidas.\n\nNo compliques la cocina. Un combo debe mover inventario, subir ticket y mantener velocidad.${buildTipLine("sales", 8)}`;
}

function answerPushProduct(data: KaizenDashboardData): string {
  const leader = data.topProducts[0];
  if (!leader) {
    return `Aún no hay producto líder claro. Para decidir qué empujar hoy, elige uno que cumpla 3 cosas: buen margen, preparación rápida y buena foto/video.\n\nSi quieres datos rápidos, empuja bebida + taco/burrito durante un turno y revisa resultados al cierre.${buildTipLine("sales", 9)}`;
  }

  return `Producto a empujar: ${leader.productName}.\n\nPor qué: ya tiene movimiento (${leader.quantity} unidades), entonces el cliente lo está aceptando. Úsalo como protagonista en menú, caja y redes.\n\nCómo empujarlo sin parecer agresivo: “Hoy se está moviendo mucho ${leader.productName}, ¿se lo preparo con bebida?”${buildTipLine("marketing", 2)}`;
}

function answerLowSales(data: KaizenDashboardData): string {
  return `Si hay pocas ventas, revisa primero visibilidad y fricción:\n\n1) ¿La ubicación/horario está publicado hoy?\n2) ¿Hay foto o video real del producto?\n3) ¿El menú se entiende rápido?\n4) ¿El cliente sabe que puede ordenar/llamar/WhatsApp?\n5) ¿Hay promo simple sin matar margen?\n\nAcción de bajo costo: publica un video corto del producto + ubicación + horario + llamada directa. No esperes a tener “contenido perfecto”.${buildTipLine("marketing", 3)}`;
}

function answerSellMoreDrinks(data: KaizenDashboardData): string {
  return `Para vender más bebidas, hazlas parte natural de la orden:\n\n1) Cajero pregunta: “¿Le agrego agua fresca o Coca mexicana?”\n2) Pon bebidas visibles en menú y redes.\n3) Crea combo con producto líder: ${formatTopProduct(data)}.\n4) Mantén bebidas frías y listas; si el cliente espera, se enfría la venta.\n\nLas bebidas suelen subir ticket sin cargar tanto la cocina. Ese es un upsell ideal para food truck.${buildTipLine("sales", 10)}`;
}

function answerWasteGeneral(data: KaizenDashboardData): string {
  return `Merma actual: ${data.wasteSummary.totalEvents} registro(s), pérdida estimada ${money(data.wasteSummary.totalEstimatedLoss)}. Motivo principal: ${data.wasteSummary.topReason}.\n\nRegla de clasificación:\n- Guantes, bolsas, vasos, servilletas y limpieza: uso operativo.\n- Comida del staff: consumo interno.\n- Orden mal hecha: error de cocina.\n- Producto roto/dañado: producto dañado.\n- Producto vencido: vencido.\n\nLa meta no es culpar; es saber dónde se va el dinero.${buildTipLine("waste", 3)}`;
}

function answerReduceWaste(data: KaizenDashboardData): string {
  return `Para reducir desperdicio, ataca la causa, no solo el registro:\n\n1) Si es error de cocina: revisa capacitación y tickets claros.\n2) Si es vencido: baja producción o mejora rotación FIFO.\n3) Si es uso operativo: revisa guantes, bolsas y servilletas por turno.\n4) Si son cortesías: autoriza quién puede regalarlas.\n5) Si es derrame/caída: mejora ubicación de insumos.\n\nHoy hay ${data.wasteSummary.totalEvents} registro(s). Aunque sean pocos, registrarlos desde ahora crea historial real.${buildTipLine("waste", 4)}`;
}

function answerClassifySupplies(data: KaizenDashboardData): string {
  return `Guantes, bolsas, servilletas, vasos, tapas, popotes, químicos y limpieza deben ir como “Uso operativo”.\n\nNo los metas como consumo interno, porque consumo interno debe quedar para comida/bebida del staff. Separarlos te permite ver cuánto cuesta operar, no solo cuánto se desperdicia de comida.\n\nEjemplo práctico:\n- 1 caja de guantes usada: uso operativo.\n- Bebida para empleado: consumo interno.\n- Taco mal preparado: error de cocina.${buildTipLine("waste", 5)}`;
}

function answerControlCourtesies(data: KaizenDashboardData): string {
  return `Para controlar cortesías/regalos, define regla simple:\n\n1) Toda cortesía se registra.\n2) Debe tener motivo: cliente molesto, promoción, influencer, error compensado o dueño.\n3) Solo ciertos roles pueden autorizarla.\n4) Al cierre revisa cuántas hubo y cuánto costaron.\n\nUna cortesía bien usada puede retener clientes; una cortesía sin control se vuelve fuga de dinero.${buildTipLine("loyalty", 3)}`;
}

function answerWastePriority(data: KaizenDashboardData): string {
  return `Merma que debes revisar primero:\n\n1) La de mayor pérdida estimada.\n2) La que se repite varios turnos.\n3) La que bloquea productos importantes.\n4) La que parece “normal” pero ocurre todos los días, como empaques o guantes.\n\nAhora Kaizen ve como motivo principal: ${data.wasteSummary.topReason}. No significa que sea grave, significa que es el primer punto para observar.${buildTipLine("waste", 6)}`;
}

function answerDetectLosses(data: KaizenDashboardData): string {
  return `Para detectar pérdidas raras, busca patrones, no casos aislados:\n\n1) Stock baja pero no hay ventas equivalentes.\n2) Hay muchos ajustes manuales sin nota.\n3) Se repite merma en el mismo producto o turno.\n4) Uso operativo sube demasiado sin razón.\n5) Cortesías aparecen sin autorización clara.\n\nSi ves diferencia física vs sistema, registra ajuste con nota. Sin nota, el dato pierde valor.${buildTipLine("waste", 7)}`;
}

function answerLoyaltyReturningCustomers(data: KaizenDashboardData): string {
  return `Para aumentar clientes recurrentes, el cajero debe activar lealtad sin hacerlo complicado:\n\n1) Pide teléfono en cada compra.\n2) Menciona puntos disponibles cuando existan.\n3) Usa recompensas simples y visibles.\n4) Recuerda productos favoritos si el cliente vuelve seguido.\n\nBase actual: ${getMetricValue(data, "Clientes loyalty")} cliente(s) activos. La lealtad funciona mejor cuando el cliente siente que lo recuerdan.${buildTipLine("loyalty", 4)}`;
}

function answerUsePoints(data: KaizenDashboardData): string {
  return `Usa los puntos como gancho de regreso, no solo como descuento:\n\n1) En caja: “Tiene puntos acumulados, ¿quiere revisar recompensas?”\n2) Mantén recompensas fáciles de entender.\n3) Evita que todo sea gratis; también usa upgrades o bebidas.\n4) Mide qué recompensas realmente hacen volver al cliente.\n\nPuntos sin recordatorio se olvidan. Puntos mencionados en caja se sienten como beneficio real.${buildTipLine("loyalty", 5)}`;
}

function answerCashierLoyaltyScript(data: KaizenDashboardData): string {
  return `Script simple para caja:\n\n“¿Me regala su número para acumular puntos?”\n\nSi ya existe cliente:\n“Ya tiene puntos en el sistema. Si gusta, puedo revisar si tiene recompensa disponible.”\n\nSi no existe:\n“Lo registro rápido para que sus compras le sumen puntos.”\n\nDebe sonar natural y rápido. Si el cajero lo hace largo, frena la fila.${buildTipLine("loyalty", 6)}`;
}

function answerPromoteRewards(data: KaizenDashboardData): string {
  return `Para promover recompensas, no dependas solo de que el cliente pregunte:\n\n1) Mención breve en caja.\n2) Pequeño letrero: “Acumula puntos aquí”.\n3) Publicación semanal mostrando una recompensa.\n4) Recompensas que no compliquen cocina: bebida, descuento fijo o producto fácil.\n\nLa recompensa ideal se entiende en 3 segundos y se aplica sin detener la operación.${buildTipLine("loyalty", 7)}`;
}

function answerVipCustomers(data: KaizenDashboardData): string {
  return `Clientes que debes cuidar más:\n\n1) Los que compran seguido.\n2) Los que tienen puntos acumulados.\n3) Los que recomiendan o traen familia/amigos.\n4) Los que tuvieron un problema y recibieron buena solución.\n\nPor ahora Kaizen ve ${getMetricValue(data, "Clientes loyalty")} cliente(s) activos. Cuando haya más historial, se puede crear una lista VIP real por visitas, gasto y puntos.${buildTipLine("loyalty", 8)}`;
}

function answerPostToday(data: KaizenDashboardData): string {
  const leader = data.topProducts[0]?.productName ?? "un platillo visual fuerte";
  return `Publicación sugerida para hoy:\n\n1) Video corto de ${leader}.\n2) Texto simple: ubicación + horario + llamada a ordenar.\n3) Muestra comida real, no imagen demasiado perfecta.\n4) Agrega algo humano: preparación, vapor, salsa, entrega o reacción.\n\nEjemplo de enfoque: “Hoy estamos sirviendo ${leader}. Pasa por tu orden o mándanos mensaje.”${buildTipLine("marketing", 4)}`;
}

function answerTikTok(data: KaizenDashboardData): string {
  return `Para TikTok, piensa en escenas rápidas, no en anuncio formal:\n\n1) Toma de la plancha/cocina.\n2) Close-up de salsa o bebida.\n3) Antes/después del platillo.\n4) Cliente recibiendo orden, si se puede.\n5) Ubicación y horario en pantalla.\n\nGancho: muestra el producto en los primeros 2 segundos. Producto sugerido: ${formatTopProduct(data)}. TikTok premia contenido real y constante.${buildTipLine("marketing", 5)}`;
}

function answerPromotion(data: KaizenDashboardData): string {
  return `Promoción recomendada: hazla simple y medible.\n\nOpciones seguras:\n1) Combo producto fuerte + bebida.\n2) Happy hour corta en horario lento.\n3) Recompensa loyalty para regreso, no descuento masivo.\n4) Promo de producto lento unido a producto fuerte.\n\nEvita descuentos grandes si no conoces margen. La promo debe aumentar visitas o ticket, no solo vender barato.${buildTipLine("sales", 11)}`;
}

function answerAttractCustomers(data: KaizenDashboardData): string {
  return `Para atraer más clientes, combina visibilidad + confianza + urgencia:\n\n1) Publica ubicación exacta y horario cada día.\n2) Usa video real de comida.\n3) Muestra producto más vendido: ${formatTopProduct(data)}.\n4) Pide reseñas después de buena experiencia.\n5) Crea una razón para ir hoy: combo, especial o recompensa.\n\nEl cliente de food truck decide rápido; si no ve ubicación, horario y comida clara, se va a otra opción.${buildTipLine("marketing", 6)}`;
}

function answerPromoteTopProduct(data: KaizenDashboardData): string {
  const leader = data.topProducts[0];
  if (!leader) {
    return `Todavía no hay producto líder suficiente. Mientras tanto, elige el platillo más visual, rápido y representativo del truck. Hazle foto/video real y úsalo como “estrella del día”.${buildTipLine("marketing", 7)}`;
  }

  return `Para promocionar ${leader.productName}:\n\n1) Ponlo como protagonista visual.\n2) Muéstralo con bebida o salsa para aumentar ticket.\n3) Usa texto corto: “Hoy el favorito es ${leader.productName}”.\n4) En caja, recomiéndalo si el cliente duda.\n\nDato actual: lleva ${leader.quantity} unidades, así que ya hay señal de demanda.${buildTipLine("marketing", 8)}`;
}

function answerAskReviews(data: KaizenDashboardData): string {
  return `Para pedir reseñas sin incomodar:\n\n1) Pídela después de una buena reacción o cliente frecuente.\n2) Usa frase corta: “Si le gustó, nos ayuda mucho una reseña en Google/TikTok.”\n3) Ten QR visible.\n4) No lo pidas cuando hay problema o mucha fila.\n\nLas reseñas funcionan mejor cuando el cliente acaba de recibir buen servicio y comida caliente.${buildTipLine("marketing", 9)}`;
}

function answerCapabilities(data: KaizenDashboardData): string {
  return `Puedo ayudarte como asistente operativo local, sin API pagada.\n\nActualmente puedo revisar:\n- Ventas y ticket promedio.\n- Producto líder.\n- Stock crítico y compras próximas.\n- Merma, uso operativo y cortesías.\n- Ideas de combos, bebidas y promociones.\n- Tips de redes sociales.\n- Lealtad y puntos en caja.\n\nLimitación actual: sin recetas todavía no calculo consumo exacto de ingredientes por platillo. Pero sí puedo darte decisiones prácticas con inventario, ventas y merma disponibles.`;
}

function answerGeneral(data: KaizenDashboardData): string {
  return `Mi recomendación general para este turno:\n\n1) Revisa stock crítico: ${formatAlertList(data.inventoryAlerts, 3)}.\n2) Empuja producto fuerte: ${formatTopProduct(data)}.\n3) Sugiere bebida para subir ticket.\n4) Registra cualquier merma en el momento.\n5) Pide teléfono para lealtad en caja.\n6) Publica ubicación y horario con foto/video real.\n\nSi quieres una respuesta más precisa, pregúntame por inventario, ventas, merma, lealtad, redes o hora pico.${buildTipLine("operations", 6)}`;
}

export function getKaizenLocalAnswer(question: string, data: KaizenDashboardData | null): string {
  const intent = classifyKaizenIntent(question);

  if (intent === "empty") {
    return "Pregúntame algo como: ¿qué debo revisar hoy?, ¿qué stock está crítico?, ¿qué combo recomiendas?, ¿cómo clasifico guantes y bolsas?, ¿qué publico hoy? o ¿cómo reduzco tiempos en hora pico?";
  }

  if (!data) {
    return "Todavía estoy cargando datos. Intenta de nuevo cuando el dashboard termine de actualizarse.";
  }

  const handlers: Record<Exclude<KaizenChatIntent, "empty" | "loading">, (data: KaizenDashboardData) => string> = {
    today_review: answerTodayReview,
    opening_checklist: answerOpeningChecklist,
    closing_checklist: answerClosingChecklist,
    rush_time: answerRushTime,
    long_line: answerLongLine,
    operation_bottleneck: answerOperationBottleneck,
    stock_critical: answerStockCritical,
    buy_soon: answerBuySoon,
    sensitive_inventory: answerSensitiveInventory,
    inventory_organization: answerInventoryOrganization,
    possible_stockout: answerPossibleStockout,
    slow_products: answerSlowProducts,
    sales_status: answerSalesStatus,
    raise_average_ticket: answerRaiseAverageTicket,
    combo_recommendation: answerComboRecommendation,
    push_product: answerPushProduct,
    low_sales: answerLowSales,
    sell_more_drinks: answerSellMoreDrinks,
    waste_general: answerWasteGeneral,
    reduce_waste: answerReduceWaste,
    classify_supplies: answerClassifySupplies,
    control_courtesies: answerControlCourtesies,
    waste_priority: answerWastePriority,
    detect_losses: answerDetectLosses,
    loyalty_returning_customers: answerLoyaltyReturningCustomers,
    use_points: answerUsePoints,
    cashier_loyalty_script: answerCashierLoyaltyScript,
    promote_rewards: answerPromoteRewards,
    vip_customers: answerVipCustomers,
    post_today: answerPostToday,
    tiktok: answerTikTok,
    promotion: answerPromotion,
    attract_customers: answerAttractCustomers,
    promote_top_product: answerPromoteTopProduct,
    ask_reviews: answerAskReviews,
    capabilities: answerCapabilities,
    general: answerGeneral,
  };

  return handlers[intent](data);
}
