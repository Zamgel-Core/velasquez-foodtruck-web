// 📍 Ruta: src/features/admin/inventory/inventory.service.ts

import { supabase } from "../../../lib/supabase";
import type {
  InventoryFormData,
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  InventoryStatus,
  InventoryStockAdjustmentForm,
} from "./inventory.types";

type InventoryPayload = {
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number | null;
};

function normalizeNumber(value: unknown): number {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeInventoryItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    current_stock: normalizeNumber(item.current_stock),
    min_stock: normalizeNumber(item.min_stock),
    cost_per_unit: item.cost_per_unit === null ? null : normalizeNumber(item.cost_per_unit),
    sort_order: item.sort_order === null ? null : normalizeNumber(item.sort_order),
  };
}

export function getInventoryStatus(
  item: Pick<InventoryItem, "current_stock" | "min_stock">,
): InventoryStatus {
  const currentStock = normalizeNumber(item.current_stock);
  const minStock = normalizeNumber(item.min_stock);

  if (currentStock <= 0) return "out";
  if (minStock > 0 && currentStock <= minStock * 0.5) return "critical";
  if (minStock > 0 && currentStock <= minStock) return "low";
  return "healthy";
}

export function createEmptyInventoryForm(): InventoryFormData {
  return {
    name: "",
    category: "proteins",
    unit: "lb",
    current_stock: "0",
    min_stock: "0",
    cost_per_unit: "",
    supplier: "",
    notes: "",
    is_active: true,
    sort_order: "",
  };
}

export function inventoryItemToForm(item: InventoryItem): InventoryFormData {
  return {
    id: item.id,
    name: item.name ?? "",
    category: item.category ?? "other",
    unit: item.unit ?? "other",
    current_stock: String(item.current_stock ?? 0),
    min_stock: String(item.min_stock ?? 0),
    cost_per_unit: item.cost_per_unit === null ? "" : String(item.cost_per_unit),
    supplier: item.supplier ?? "",
    notes: item.notes ?? "",
    is_active: item.is_active,
    sort_order: item.sort_order === null ? "" : String(item.sort_order),
  };
}

function toInventoryPayload(form: InventoryFormData): InventoryPayload {
  return {
    name: form.name.trim(),
    category: form.category,
    unit: form.unit,
    current_stock: normalizeNumber(form.current_stock),
    min_stock: normalizeNumber(form.min_stock),
    cost_per_unit: form.cost_per_unit.trim() ? normalizeNumber(form.cost_per_unit) : null,
    supplier:
      form.supplier.trim() && form.supplier.trim() !== "Sin proveedor"
        ? form.supplier.trim()
        : null,
    notes: form.notes.trim() || null,
    is_active: form.is_active,
    sort_order: form.sort_order.trim() ? normalizeNumber(form.sort_order) : null,
  };
}

async function createMovement(params: {
  itemId: string;
  itemName: string;
  movementType: InventoryMovementType;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  reason?: string;
}) {
  const { error } = await supabase.from("inventory_movements").insert({
    item_id: params.itemId,
    item_name: params.itemName,
    movement_type: params.movementType,
    quantity_change: params.quantityChange,
    stock_before: params.stockBefore,
    stock_after: params.stockAfter,
    reason: params.reason?.trim() || null,
  });

  if (error) {
    console.warn("Inventory movement was not saved:", error);
  }
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading inventory:", error);
    throw new Error("No se pudo cargar el inventario.");
  }

  return ((data ?? []) as InventoryItem[]).map(normalizeInventoryItem);
}

export async function getRecentInventoryMovements(limit = 12): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Error loading inventory movements:", error);
    return [];
  }

  return ((data ?? []) as InventoryMovement[]).map((movement) => ({
    ...movement,
    quantity_change: normalizeNumber(movement.quantity_change),
    stock_before: normalizeNumber(movement.stock_before),
    stock_after: normalizeNumber(movement.stock_after),
  }));
}

export async function saveInventoryItem(form: InventoryFormData) {
  const payload = toInventoryPayload(form);

  if (!payload.name) {
    throw new Error("El nombre del item es requerido.");
  }

  if (payload.current_stock < 0 || payload.min_stock < 0) {
    throw new Error("El stock no puede ser negativo.");
  }

  if (payload.cost_per_unit !== null && payload.cost_per_unit < 0) {
    throw new Error("El costo no puede ser negativo.");
  }

  if (form.id) {
    const { error } = await supabase
      .from("inventory_items")
      .update(payload)
      .eq("id", form.id);

    if (error) {
      console.error("Error updating inventory item:", error);
      throw new Error("No se pudo actualizar el item.");
    }

    return true;
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw new Error("No se pudo crear el item.");
  }

  if (data) {
    await createMovement({
      itemId: data.id,
      itemName: data.name,
      movementType: "initial",
      quantityChange: normalizeNumber(data.current_stock),
      stockBefore: 0,
      stockAfter: normalizeNumber(data.current_stock),
      reason: "Item creado",
    });
  }

  return true;
}

export async function toggleInventoryItemActive(item: InventoryItem) {
  const { error } = await supabase
    .from("inventory_items")
    .update({ is_active: !item.is_active })
    .eq("id", item.id);

  if (error) {
    console.error("Error toggling inventory item:", error);
    throw new Error("No se pudo cambiar el estado del item.");
  }

  return true;
}

export async function adjustInventoryStock(form: InventoryStockAdjustmentForm) {
  const amount = normalizeNumber(form.amount);

  if (amount < 0) {
    throw new Error("La cantidad no puede ser negativa.");
  }

  const stockBefore = normalizeNumber(form.item.current_stock);
  let stockAfter = stockBefore;

  if (form.mode === "add") stockAfter = stockBefore + amount;
  if (form.mode === "subtract") stockAfter = Math.max(0, stockBefore - amount);
  if (form.mode === "set") stockAfter = amount;

  const quantityChange = stockAfter - stockBefore;

  const { error } = await supabase
    .from("inventory_items")
    .update({ current_stock: stockAfter })
    .eq("id", form.item.id);

  if (error) {
    console.error("Error adjusting inventory stock:", error);
    throw new Error("No se pudo ajustar el stock.");
  }

  await createMovement({
    itemId: form.item.id,
    itemName: form.item.name,
    movementType: form.mode === "add" ? "stock_in" : form.mode === "subtract" ? "stock_out" : "correction",
    quantityChange,
    stockBefore,
    stockAfter,
    reason: form.reason,
  });

  return stockAfter;
}

export async function updateInventoryStock(item: InventoryItem, currentStock: number) {
  return adjustInventoryStock({
    item,
    mode: "set",
    amount: String(Math.max(0, currentStock)),
    reason: "Ajuste rapido",
  });
}
