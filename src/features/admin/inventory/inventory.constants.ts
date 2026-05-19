// 📍 Ruta: src/features/admin/inventory/inventory.constants.ts

import type { InventoryCategory, InventoryUnit } from "./inventory.types";

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
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
}> = [
  { value: "proteins", label: INVENTORY_CATEGORY_LABELS.proteins },
  { value: "tortillas", label: INVENTORY_CATEGORY_LABELS.tortillas },
  { value: "vegetables", label: INVENTORY_CATEGORY_LABELS.vegetables },
  { value: "salsas", label: INVENTORY_CATEGORY_LABELS.salsas },
  { value: "drinks", label: INVENTORY_CATEGORY_LABELS.drinks },
  { value: "extras", label: INVENTORY_CATEGORY_LABELS.extras },
  { value: "disposables", label: INVENTORY_CATEGORY_LABELS.disposables },
  { value: "cleaning", label: INVENTORY_CATEGORY_LABELS.cleaning },
  { value: "other", label: INVENTORY_CATEGORY_LABELS.other },
];

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
