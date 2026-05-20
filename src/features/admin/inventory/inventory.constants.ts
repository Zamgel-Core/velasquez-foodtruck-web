// 📍 Ruta: src/features/admin/inventory/inventory.constants.ts

import type {
  InventoryCategory,
  InventoryUnit,
  InventoryWasteReason,
} from "./inventory.types";

export const INVENTORY_CATEGORY_LABELS: Record<string, string> = {
  proteins: "Proteinas",
  tortillas: "Tortillas",
  vegetables: "Verduras",
  salsas: "Salsas",
  drinks: "Bebidas",
  extras: "Extras",
  disposables: "Desechables",
  cleaning: "Limpieza",
  other: "Otros",
};

export const INVENTORY_CATEGORY_OPTIONS: Array<{
  value: InventoryCategory;
  label: string;
}> = Object.entries(INVENTORY_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const INVENTORY_UNIT_LABELS: Record<InventoryUnit, string> = {
  lb: "lb",
  oz: "oz",
  piece: "pieza",
  pack: "paquete",
  box: "caja",
  bag: "bolsa",
  gallon: "galon",
  liter: "litro",
  bottle: "botella",
  can: "lata",
  tray: "charola",
  other: "otro",
};

export const INVENTORY_UNIT_OPTIONS: Array<{
  value: InventoryUnit;
  label: string;
}> = [
  { value: "lb", label: "lb" },
  { value: "oz", label: "oz" },
  { value: "piece", label: "pieza" },
  { value: "pack", label: "paquete" },
  { value: "box", label: "caja" },
  { value: "bag", label: "bolsa" },
  { value: "gallon", label: "galon" },
  { value: "liter", label: "litro" },
  { value: "bottle", label: "botella" },
  { value: "can", label: "lata" },
  { value: "tray", label: "charola" },
  { value: "other", label: "otro" },
];

export const INVENTORY_SUPPLIER_OPTIONS = [
  "Sin proveedor",
  "Restaurant Depot",
  "Costco",
  "Sam's Club",
  "Walmart",
  "HEB",
  "Sysco",
  "Proveedor local",
];

export const INVENTORY_WASTE_REASON_LABELS: Record<
  InventoryWasteReason,
  string
> = {
  kitchen_error: "Error de cocina",
  gift: "Regalo / cortesia",
  internal_use: "Consumo interno",
  operational_use: "Uso operativo",
  damaged: "Producto dañado",
  expired: "Producto vencido",
  spillage: "Derrame / caida",
  manual_waste: "Merma general",
};

export const INVENTORY_WASTE_REASON_OPTIONS: Array<{
  value: InventoryWasteReason;
  label: string;
}> = Object.entries(INVENTORY_WASTE_REASON_LABELS).map(([value, label]) => ({
  value: value as InventoryWasteReason,
  label,
}));
