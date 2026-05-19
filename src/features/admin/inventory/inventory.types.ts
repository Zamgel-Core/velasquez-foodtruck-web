// 📍 Ruta: src/features/admin/inventory/inventory.types.ts

export type InventoryCategory =
  | "proteins"
  | "tortillas"
  | "vegetables"
  | "salsas"
  | "drinks"
  | "extras"
  | "disposables"
  | "cleaning"
  | "other";

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
