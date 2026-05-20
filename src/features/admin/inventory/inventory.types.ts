// 📍 Ruta: src/features/admin/inventory/inventory.types.ts

export type InventoryCategory = string;

export type InventoryUnit =
  | "lb"
  | "oz"
  | "piece"
  | "pack"
  | "box"
  | "bag"
  | "gallon"
  | "liter"
  | "bottle"
  | "can"
  | "tray"
  | "other";

export type InventoryStatus = "healthy" | "low" | "critical" | "out";

export type InventoryMovementType =
  | "initial"
  | "manual_adjustment"
  | "stock_in"
  | "stock_out"
  | "correction";

export type InventoryCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryCategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  sort_order: string;
  is_active: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type InventoryFormData = {
  id?: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  current_stock: string;
  min_stock: string;
  cost_per_unit: string;
  supplier: string;
  notes: string;
  is_active: boolean;
  sort_order: string;
};

export type InventoryStockAdjustmentForm = {
  item: InventoryItem;
  mode: "add" | "subtract" | "set";
  amount: string;
  reason: string;
};

export type InventoryMovement = {
  id: string;
  item_id: string;
  item_name: string | null;
  movement_type: InventoryMovementType;
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
};
