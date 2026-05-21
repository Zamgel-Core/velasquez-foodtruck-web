// 📍 Ruta: src/features/admin/kaizen/kaizen.types.ts

export type KaizenRange = "today" | "week" | "month" | "all";

export type KaizenChatIntent =
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


export type KaizenInsightPriority = "high" | "medium" | "low" | "positive";

export type KaizenInsightCategory =
  | "sales"
  | "inventory"
  | "waste"
  | "loyalty"
  | "operations"
  | "marketing";

export type KaizenInsight = {
  id: string;
  title: string;
  message: string;
  category: KaizenInsightCategory;
  priority: KaizenInsightPriority;
  actionLabel?: string;
};

export type KaizenTip = {
  id: string;
  title: string;
  body: string;
  category: KaizenInsightCategory;
  level: "basic" | "pro";
};

export type KaizenMetric = {
  label: string;
  value: string;
  helper: string;
};

export type KaizenTopProduct = {
  productName: string;
  quantity: number;
  total: number;
};

export type KaizenInventoryAlert = {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: "out" | "critical" | "low";
};

export type KaizenWasteSummary = {
  totalEvents: number;
  totalEstimatedLoss: number;
  topReason: string;
  operationalUseEvents: number;
};

export type KaizenDashboardData = {
  range: KaizenRange;
  generatedAt: string;
  metrics: KaizenMetric[];
  insights: KaizenInsight[];
  tips: KaizenTip[];
  topProducts: KaizenTopProduct[];
  inventoryAlerts: KaizenInventoryAlert[];
  wasteSummary: KaizenWasteSummary;
  assistantContext: string;
};
