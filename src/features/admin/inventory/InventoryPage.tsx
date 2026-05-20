// 📍 Ruta: src/features/admin/inventory/InventoryPage.tsx

import React from "react";
import ExcelJS from "exceljs";
import type { Borders, Fill } from "exceljs";
import AdminTopbar from "../components/AdminTopbar";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Gauge,
  History,
  Package,
  PackageCheck,
  PackageMinus,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  INVENTORY_CATEGORY_LABELS,
  INVENTORY_CATEGORY_OPTIONS,
  INVENTORY_SUPPLIER_OPTIONS,
  INVENTORY_UNIT_LABELS,
  INVENTORY_UNIT_OPTIONS,
} from "./inventory.constants";
import type {
  InventoryCategory,
  InventoryCategoryFormData,
  InventoryCategoryRecord,
  InventoryFormData,
  InventoryItem,
  InventoryMovement,
  InventoryStatus,
  InventoryStockAdjustmentForm,
} from "./inventory.types";
import {
  adjustInventoryStock,
  createEmptyCategoryForm,
  createEmptyInventoryForm,
  getInventoryCategories,
  getInventoryItems,
  getInventoryStatus,
  getRecentInventoryMovements,
  inventoryCategoryToForm,
  inventoryItemToForm,
  saveInventoryCategory,
  saveInventoryItem,
  toggleInventoryCategoryActive,
  toggleInventoryItemActive,
  updateInventoryStock,
  deleteInventoryCategory,
} from "./inventory.service";

const STATUS_STYLES: Record<InventoryStatus, string> = {
  healthy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  low: "border-yellow-500/25 bg-yellow-500/10 text-yellow-200",
  critical: "border-orange-500/35 bg-orange-500/15 text-orange-200",
  out: "border-red-500/35 bg-red-500/15 text-red-200",
};

const CATEGORY_ICONS = {
  package: Package,
} as const;

function getCategoryIcon(icon?: string | null) {
  return CATEGORY_ICONS[icon as keyof typeof CATEGORY_ICONS] || Package;
}

const STATUS_LABELS: Record<InventoryStatus, string> = {
  healthy: "Saludable",
  low: "Bajo",
  critical: "Critico",
  out: "Agotado",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number | null) {
  if (value === null) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat("es-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCategoryLabel(
  category: string,
  categories: InventoryCategoryRecord[] = [],
) {
  return (
    categories.find((item) => item.slug === category)?.name ??
    INVENTORY_CATEGORY_LABELS[category] ??
    category
  );
}

function getCategoryOptions(categories: InventoryCategoryRecord[] = []) {
  if (categories.length > 0) {
    return categories
      .filter((category) => category.is_active)
      .map((category) => ({ value: category.slug, label: category.name }));
  }

  return INVENTORY_CATEGORY_OPTIONS;
}

async function assetToDataUri(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) return "";
    const blob = await response.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getProgress(item: InventoryItem) {
  if (item.min_stock <= 0) return 100;
  return Math.min(
    100,
    Math.max(0, (item.current_stock / item.min_stock) * 100),
  );
}

function StatCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "default" | "orange" | "red" | "green";
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-500/25 bg-orange-500/10 text-orange-200"
      : tone === "red"
        ? "border-red-500/25 bg-red-500/10 text-red-200"
        : tone === "green"
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/[0.035] text-white";

  return (
    <div
      className={`rounded-3xl border p-5 shadow-2xl shadow-black/30 ${toneClass}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm opacity-65">{helper}</p>
    </div>
  );
}

function InventoryFormModal({
  categories,
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  categories: InventoryCategoryRecord[];
  form: InventoryFormData;
  saving: boolean;
  onChange: (form: InventoryFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id ? "Editar item" : "Nuevo item"}
            </h2>
            <p className="text-sm text-white/50">
              Controla stock, minimos, unidad, proveedor, costo y notas
              internas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Nombre
            </span>
            <input
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Ej. Fajita, tortilla, vasos..."
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Categoria
            </span>
            <select
              value={form.category}
              onChange={(event) =>
                onChange({
                  ...form,
                  category: event.target.value as InventoryCategory,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            >
              {getCategoryOptions(categories).map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-black"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Unidad
            </span>
            <select
              value={form.unit}
              onChange={(event) =>
                onChange({
                  ...form,
                  unit: event.target.value as InventoryFormData["unit"],
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            >
              {INVENTORY_UNIT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-black"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Stock actual
            </span>
            <input
              value={form.current_stock}
              onChange={(event) =>
                onChange({ ...form, current_stock: event.target.value })
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Stock minimo
            </span>
            <input
              value={form.min_stock}
              onChange={(event) =>
                onChange({ ...form, min_stock: event.target.value })
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Costo por unidad
            </span>
            <input
              value={form.cost_per_unit}
              onChange={(event) =>
                onChange({ ...form, cost_per_unit: event.target.value })
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Opcional"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Orden visual
            </span>
            <input
              value={form.sort_order}
              onChange={(event) =>
                onChange({ ...form, sort_order: event.target.value })
              }
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Opcional"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Proveedor
            </span>
            <input
              value={form.supplier}
              onChange={(event) =>
                onChange({ ...form, supplier: event.target.value })
              }
              list="inventory-suppliers"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Restaurant Depot, Costco, Sam's Club..."
            />
            <datalist id="inventory-suppliers">
              {INVENTORY_SUPPLIER_OPTIONS.map((supplier) => (
                <option key={supplier} value={supplier} />
              ))}
            </datalist>
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Notas internas
            </span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                onChange({ ...form, notes: event.target.value })
              }
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Marca preferida, donde comprar, presentacion, etc."
            />
          </label>

          <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="font-black">Item activo</p>
              <p className="text-sm text-white/45">
                Si esta apagado, queda oculto sin borrar historial.
              </p>
            </div>
            <input
              checked={form.is_active}
              onChange={(event) =>
                onChange({ ...form, is_active: event.target.checked })
              }
              type="checkbox"
              className="h-5 w-5 accent-orange-500"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar item
          </button>
        </div>
      </div>
    </div>
  );
}

function StockAdjustmentModal({
  adjustment,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  adjustment: InventoryStockAdjustmentForm;
  saving: boolean;
  onChange: (adjustment: InventoryStockAdjustmentForm) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Ajustar stock</h2>
            <p className="text-sm text-white/50">
              {adjustment.item.name} tiene{" "}
              {formatNumber(adjustment.item.current_stock)}{" "}
              {INVENTORY_UNIT_LABELS[adjustment.item.unit]}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            {(
              [
                ["add", "Entrada"],
                ["subtract", "Salida"],
                ["set", "Fijar"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => onChange({ ...adjustment, mode })}
                className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                  adjustment.mode === mode
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Cantidad
            </span>
            <input
              value={adjustment.amount}
              onChange={(event) =>
                onChange({ ...adjustment, amount: event.target.value })
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Motivo / nota
            </span>
            <textarea
              value={adjustment.reason}
              onChange={(event) =>
                onChange({ ...adjustment, reason: event.target.value })
              }
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Compra, merma, conteo fisico, correccion..."
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            Aplicar ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: InventoryCategoryFormData;
  saving: boolean;
  onChange: (form: InventoryCategoryFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id ? "Editar categoria" : "Nueva categoria"}
            </h2>
            <p className="text-sm text-white/50">
              Administra categorias del inventario sin tocar productos
              existentes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Nombre
            </span>
            <input
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                onChange({
                  ...form,
                  name,
                  slug: form.id ? form.slug : name,
                });
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Ej. Mariscos, Cocina, Postres..."
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Clave interna
            </span>
            <input
              value={form.slug}
              onChange={(event) =>
                onChange({ ...form, slug: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Se genera automatico"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Icono
            </span>
            <input
              value={form.icon}
              onChange={(event) =>
                onChange({ ...form, icon: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="📦"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Color
            </span>
            <input
              value={form.color}
              onChange={(event) =>
                onChange({ ...form, color: event.target.value })
              }
              type="color"
              className="h-[50px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-orange-500"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Orden visual
            </span>
            <input
              value={form.sort_order}
              onChange={(event) =>
                onChange({ ...form, sort_order: event.target.value })
              }
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Opcional"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="font-black">Categoria activa</p>
              <p className="text-sm text-white/45">
                Si se apaga, no aparece al crear nuevos items.
              </p>
            </div>
            <input
              checked={form.is_active}
              onChange={(event) =>
                onChange({ ...form, is_active: event.target.checked })
              }
              type="checkbox"
              className="h-5 w-5 accent-orange-500"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Descripcion
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Uso interno de la categoria..."
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar categoria
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryManagerModal({
  categories,
  itemCountsByCategory,
  saving,
  onClose,
  onCreate,
  onDelete,
  onEdit,
  onToggle,
}: {
  categories: InventoryCategoryRecord[];
  itemCountsByCategory: Record<string, number>;
  saving: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDelete: (category: InventoryCategoryRecord) => void;
  onEdit: (category: InventoryCategoryRecord) => void;
  onToggle: (category: InventoryCategoryRecord) => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Administrar categorias</h2>
            <p className="text-sm text-white/50">
              Edita, activa/desactiva o elimina categorias vacias sin afectar el
              inventario del cliente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              onClose();

              window.setTimeout(() => {
                onCreate();
              }, 80);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" /> Nueva categoria
          </button>
        </div>

        <div className="grid gap-3">
          {categories.map((category) => {
            const itemCount = itemCountsByCategory[category.slug] ?? 0;
            return (
              <div
                key={category.id}
                className={`rounded-2xl border p-4 transition ${
                  category.is_active
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-xl"
                      style={{
                        backgroundColor: `${category.color ?? "#f97316"}22`,
                      }}
                    >
                      {(() => {
                        const Icon = getCategoryIcon(category.icon);
                        return <Icon className="h-5 w-5 text-orange-200" />;
                      })()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">{category.name}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-white/45">
                          {category.slug}
                        </span>
                        <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-100">
                          {itemCount} items
                        </span>
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-white/45">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        onClose();

                        window.setTimeout(() => {
                          onEdit(category);
                        }, 80);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
                    >
                      <Edit3 className="h-4 w-4" /> Editar
                    </button>
                    <button
                      onClick={() => onToggle(category)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100 disabled:opacity-50"
                    >
                      {category.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {category.is_active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      disabled={saving || itemCount > 0}
                      title={
                        itemCount > 0
                          ? "No se puede eliminar si tiene items"
                          : "Eliminar categoria"
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-black text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExportReportModal({
  activeCount,
  alertCount,
  exporting,
  inactiveCount,
  itemCount,
  onClose,
  onDownload,
  totalValue,
}: {
  activeCount: number;
  alertCount: number;
  exporting: boolean;
  inactiveCount: number;
  itemCount: number;
  onClose: () => void;
  onDownload: () => void;
  totalValue: number;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080808] p-5 text-white shadow-2xl shadow-black">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Exportar inventario</h2>
            <p className="mt-1 text-sm text-white/55">
              Genera un reporte profesional compatible con Excel, con logos,
              resumen y tabla completa.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
            aria-label="Cerrar exportacion"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-orange-500/25 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-center justify-between gap-4">
                <img
                  src="/images/velasquez-logo.png"
                  alt="Velasquez Food Truck"
                  className="h-24 w-24 object-contain"
                />
                <div className="text-center">
                  <p className="text-xl font-black uppercase tracking-wide">
                    Velasquez Food Truck
                  </p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-orange-200">
                    Control de inventario
                  </p>
                  <p className="mt-3 text-xs text-white/55">
                    Generado el: {formatReportDate()}
                  </p>
                  <p className="text-xs text-white/55">
                    Generado por: Zamgel Admin
                  </p>
                </div>
                <img
                  src="/images/zamgelcore-zc-logo.png"
                  alt="Zamgel Core"
                  className="h-20 w-20 object-contain"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Total items", itemCount],
                ["Activos", activeCount],
                ["Inactivos", inactiveCount],
                ["Valor total", formatMoney(totalValue)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-black">El archivo incluira</p>
              <div className="mt-3 grid gap-2 text-sm text-white/65">
                {[
                  "Encabezado con identidad de marca",
                  "Resumen ejecutivo de metricas",
                  "Stock, minimos, costos y valor total",
                  "Categoria, proveedor, estado y ultima actualizacion",
                  "Firma de desarrollo Zamgel Core (ZC)",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                  Vista previa
                </p>
                <p className="text-sm text-white/50">
                  Formato .xls compatible con Excel.
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200">
                Excel
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-black shadow-2xl">
              <div className="bg-[#107c41] px-4 py-2 text-sm font-black text-white">
                Inventario Velasquez
              </div>
              <div className="bg-[#101010] p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <img
                    src="/images/velasquez-logo.png"
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                  <div className="text-center">
                    <p className="text-lg font-black uppercase">
                      Velasquez Food Truck
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
                      Control de inventario
                    </p>
                  </div>
                  <img
                    src="/images/zamgelcore-zc-logo.png"
                    alt=""
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-black/10 text-center text-xs font-black uppercase">
                <div className="p-3">
                  Items
                  <br />
                  <span className="text-lg">{itemCount}</span>
                </div>
                <div className="p-3">
                  Activos
                  <br />
                  <span className="text-lg">{activeCount}</span>
                </div>
                <div className="p-3">
                  Alertas
                  <br />
                  <span className="text-lg">{alertCount}</span>
                </div>
                <div className="p-3">
                  Valor
                  <br />
                  <span className="text-lg">{formatMoney(totalValue)}</span>
                </div>
              </div>
              <div className="grid grid-cols-5 bg-orange-500 text-[10px] font-black uppercase text-white">
                <div className="p-2">Item</div>
                <div className="p-2">Categoria</div>
                <div className="p-2">Stock</div>
                <div className="p-2">Estado</div>
                <div className="p-2">Valor</div>
              </div>
              <div className="p-4 text-center text-xs text-black/55">
                El archivo descargado incluye la tabla completa del inventario
                filtrado actualmente.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onDownload}
            disabled={exporting || itemCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar reporte Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [categories, setCategories] = React.useState<InventoryCategoryRecord[]>(
    [],
  );
  const [movements, setMovements] = React.useState<InventoryMovement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<InventoryCategory | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = React.useState<
    InventoryStatus | "all"
  >("all");
  const [showInactive, setShowInactive] = React.useState(false);
  const [form, setForm] = React.useState<InventoryFormData | null>(null);
  const [categoryForm, setCategoryForm] =
    React.useState<InventoryCategoryFormData | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = React.useState(false);
  const [adjustment, setAdjustment] =
    React.useState<InventoryStockAdjustmentForm | null>(null);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [inventoryItems, inventoryCategories, recentMovements] =
        await Promise.all([
          getInventoryItems(),
          getInventoryCategories(),
          getRecentInventoryMovements(10),
        ]);
      setItems(inventoryItems);
      setCategories(inventoryCategories);
      setMovements(recentMovements);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Error cargando inventario.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleItems = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const status = getInventoryStatus(item);
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.supplier ?? "").toLowerCase().includes(normalizedSearch) ||
        (item.notes ?? "").toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesActive = showInactive || item.is_active;

      return matchesSearch && matchesCategory && matchesStatus && matchesActive;
    });
  }, [category, items, search, showInactive, statusFilter]);

  const activeItems = React.useMemo(
    () => items.filter((item) => item.is_active),
    [items],
  );
  const alertItems = React.useMemo(
    () => activeItems.filter((item) => getInventoryStatus(item) !== "healthy"),
    [activeItems],
  );
  const outItems = React.useMemo(
    () => activeItems.filter((item) => getInventoryStatus(item) === "out"),
    [activeItems],
  );
  const estimatedValue = React.useMemo(
    () =>
      activeItems.reduce((total, item) => {
        return (
          total +
          Number(item.current_stock ?? 0) * Number(item.cost_per_unit ?? 0)
        );
      }, 0),
    [activeItems],
  );

  const itemCountsByCategory = React.useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const handleSaveCategory = async () => {
    if (!categoryForm) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveInventoryCategory(categoryForm);
      setSuccess("Categoria guardada correctamente.");
      setCategoryForm(null);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la categoria.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (
    categoryToToggle: InventoryCategoryRecord,
  ) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await toggleInventoryCategoryActive(categoryToToggle);
      setSuccess(
        categoryToToggle.is_active
          ? "Categoria desactivada."
          : "Categoria activada.",
      );
      await loadData();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar la categoria.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (
    categoryToDelete: InventoryCategoryRecord,
  ) => {
    const itemCount = itemCountsByCategory[categoryToDelete.slug] ?? 0;

    if (itemCount > 0) {
      setError(
        "No se puede eliminar una categoria con items. Desactivala o mueve los items primero.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Eliminar categoria ${categoryToDelete.name}? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await deleteInventoryCategory(categoryToDelete);
      setSuccess("Categoria eliminada correctamente.");
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la categoria.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveInventoryItem(form);
      setSuccess("Inventario actualizado correctamente.");
      setForm(null);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustmentSave = async () => {
    if (!adjustment) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adjustInventoryStock(adjustment);
      setSuccess("Stock ajustado correctamente.");
      setAdjustment(null);
      await loadData();
    } catch (adjustError) {
      setError(
        adjustError instanceof Error
          ? adjustError.message
          : "No se pudo ajustar stock.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: InventoryItem) => {
    setError("");
    setSuccess("");

    try {
      await toggleInventoryItemActive(item);
      setSuccess(item.is_active ? "Item desactivado." : "Item activado.");
      await loadData();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar el estado.",
      );
    }
  };

  const handleQuickStock = async (item: InventoryItem, nextStock: number) => {
    const safeStock = Math.max(0, nextStock);
    setError("");
    setSuccess("");

    try {
      await updateInventoryStock(item, safeStock);
      setSuccess("Stock actualizado.");
      await loadData();
    } catch (stockError) {
      setError(
        stockError instanceof Error
          ? stockError.message
          : "No se pudo actualizar stock.",
      );
    }
  };

  const exportProfessionalReport = async () => {
    if (visibleItems.length === 0) {
      setError("No hay items visibles para exportar.");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const generatedAt = new Date();
      const fileDate = generatedAt
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, "");
      const [velasquezLogo, zamgelLogo] = await Promise.all([
        assetToDataUri("/images/velasquez-logo.png"),
        assetToDataUri("/images/zamgelcore-zc-logo.png"),
      ]);

      const activeCount = visibleItems.filter((item) => item.is_active).length;
      const inactiveCount = visibleItems.length - activeCount;
      const alertCount = visibleItems.filter(
        (item) => getInventoryStatus(item) !== "healthy",
      ).length;
      const outCount = visibleItems.filter(
        (item) => getInventoryStatus(item) === "out",
      ).length;
      const reportValue = visibleItems.reduce((total, item) => {
        return (
          total +
          Number(item.current_stock ?? 0) * Number(item.cost_per_unit ?? 0)
        );
      }, 0);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Zamgel Core";
      workbook.lastModifiedBy = "Zamgel Core";
      workbook.created = generatedAt;
      workbook.modified = generatedAt;
      workbook.subject = "Control de inventario Velasquez Food Truck";
      workbook.title = "Inventario Velasquez Food Truck";
      workbook.company = "Zamgel Core";

      const sheet = workbook.addWorksheet("Inventario", {
        properties: {
          defaultRowHeight: 22,
          tabColor: { argb: "FFF97316" },
        },
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.25,
            right: 0.25,
            top: 0.35,
            bottom: 0.35,
            header: 0.2,
            footer: 0.2,
          },
        },
      });

      sheet.views = [{ state: "frozen", ySplit: 13 }];
      sheet.columns = [
        { key: "index", width: 7 },
        { key: "name", width: 28 },
        { key: "category", width: 18 },
        { key: "unit", width: 14 },
        { key: "stock", width: 12 },
        { key: "minimum", width: 12 },
        { key: "unitCost", width: 16 },
        { key: "totalValue", width: 16 },
        { key: "status", width: 14 },
        { key: "supplier", width: 22 },
        { key: "active", width: 12 },
        { key: "updated", width: 18 },
        { key: "notes", width: 42 },
      ];

      const ORANGE = "FFF97316";
      const ORANGE_DARK = "FFB45309";
      const BLACK = "FF080808";
      const DARK = "FF151515";
      const MID = "FF262626";
      const WHITE = "FFFFFFFF";
      const MUTED = "FFD1D5DB";
      const GREEN = "FF16A34A";
      const RED = "FFDC2626";
      const YELLOW = "FFEAB308";
      const GRAY = "FF6B7280";

      const fill = (argb: string): Fill => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb },
      });

      const border = (argb = "FFE5E7EB"): Partial<Borders> => ({
        top: { style: "thin", color: { argb } },
        left: { style: "thin", color: { argb } },
        bottom: { style: "thin", color: { argb } },
        right: { style: "thin", color: { argb } },
      });

      const setRangeFill = (range: string, argb: string) => {
        const cells = range.split(":");
        const startCell = sheet.getCell(cells[0]);
        const endCell = sheet.getCell(cells[1]);
        for (let row = startCell.row; row <= endCell.row; row += 1) {
          for (
            let col = Number(startCell.col);
            col <= Number(endCell.col);
            col += 1
          ) {
            sheet.getCell(row, col).fill = fill(argb);
          }
        }
      };

      // Header premium
      sheet.mergeCells("A1:M6");
      setRangeFill("A1:M6", BLACK);
      sheet.getCell("A1").border = {
        top: { style: "medium", color: { argb: ORANGE_DARK } },
        left: { style: "medium", color: { argb: ORANGE_DARK } },
        bottom: { style: "medium", color: { argb: ORANGE } },
        right: { style: "medium", color: { argb: ORANGE_DARK } },
      };

      if (velasquezLogo) {
        const velasquezImage = workbook.addImage({
          base64: velasquezLogo,
          extension: "png",
        });
        sheet.addImage(velasquezImage, {
          tl: { col: 0.25, row: 0.45 },
          br: { col: 2.2, row: 5.6 },
          editAs: "oneCell",
        });
      }

      if (zamgelLogo) {
        const zamgelImage = workbook.addImage({
          base64: zamgelLogo,
          extension: "png",
        });
        sheet.addImage(zamgelImage, {
          tl: { col: 10.45, row: 0.55 },
          br: { col: 12.35, row: 2.95 },
          editAs: "oneCell",
        });
      }

      sheet.mergeCells("D1:J1");
      sheet.getCell("D1").value = "VELASQUEZ FOOD TRUCK";
      sheet.getCell("D1").font = {
        name: "Arial",
        size: 24,
        bold: true,
        color: { argb: WHITE },
      };
      sheet.getCell("D1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.mergeCells("D2:J2");
      sheet.getCell("D2").value = "CONTROL DE INVENTARIO";
      sheet.getCell("D2").font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: ORANGE },
      };
      sheet.getCell("D2").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.mergeCells("D3:J3");
      sheet.getCell("D3").value =
        `Generado el: ${formatReportDate(generatedAt)}`;
      sheet.getCell("D3").font = {
        name: "Arial",
        size: 11,
        color: { argb: MUTED },
      };
      sheet.getCell("D3").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.mergeCells("D4:J4");
      sheet.getCell("D4").value = "Generado por: Zamgel Admin";
      sheet.getCell("D4").font = {
        name: "Arial",
        size: 11,
        color: { argb: MUTED },
      };
      sheet.getCell("D4").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.mergeCells("D5:J5");
      sheet.getCell("D5").value =
        "Reporte profesional de stock, proveedores, costos y alertas";
      sheet.getCell("D5").font = {
        name: "Arial",
        size: 10,
        color: { argb: MUTED },
      };
      sheet.getCell("D5").alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      sheet.mergeCells("K4:M4");
      sheet.getCell("K4").value = "Desarrollado por";
      sheet.getCell("K4").font = {
        name: "Arial",
        size: 9,
        color: { argb: MUTED },
      };
      sheet.getCell("K4").alignment = { horizontal: "center" };
      sheet.mergeCells("K5:M5");
      sheet.getCell("K5").value = "Zamgel Core (ZC)";
      sheet.getCell("K5").font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: WHITE },
      };
      sheet.getCell("K5").alignment = { horizontal: "center" };

      // Resumen
      sheet.mergeCells("A7:M7");
      sheet.getCell("A7").value = "RESUMEN GENERAL";
      sheet.getCell("A7").font = {
        name: "Arial",
        size: 13,
        bold: true,
        color: { argb: ORANGE },
      };
      sheet.getCell("A7").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      sheet.getCell("A7").fill = fill("FF111111");

      const summaryCards = [
        {
          range: "A8:B10",
          label: "TOTAL DE ITEMS",
          value: visibleItems.length,
          helper: "Registros",
        },
        {
          range: "C8:D10",
          label: "ACTIVOS",
          value: activeCount,
          helper: "Items",
        },
        {
          range: "E8:F10",
          label: "INACTIVOS",
          value: inactiveCount,
          helper: "Items",
        },
        {
          range: "G8:H10",
          label: "ALERTAS",
          value: alertCount,
          helper: "Bajo / critico / agotado",
        },
        {
          range: "I8:J10",
          label: "AGOTADOS",
          value: outCount,
          helper: "Stock en cero",
        },
        {
          range: "K8:M10",
          label: "VALOR TOTAL",
          value: reportValue,
          helper: "USD estimado",
          money: true,
        },
      ];

      summaryCards.forEach((card) => {
        sheet.mergeCells(card.range);
        const cell = sheet.getCell(card.range.split(":")[0]);
        cell.value = {
          richText: [
            {
              text: `${card.label}\n`,
              font: {
                name: "Arial",
                size: 9,
                bold: true,
                color: { argb: MUTED },
              },
            },
            {
              text: `${card.money ? formatMoney(Number(card.value)) : card.value}\n`,
              font: {
                name: "Arial",
                size: 21,
                bold: true,
                color: { argb: WHITE },
              },
            },
            {
              text: card.helper,
              font: { name: "Arial", size: 9, color: { argb: MUTED } },
            },
          ],
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.fill = fill(DARK);
        cell.border = border("FF3A3A3A");
      });

      // Tabla
      const tableHeaderRow = 12;
      const headers = [
        "#",
        "Nombre",
        "Categoria",
        "Unidad",
        "Stock",
        "Minimo",
        "Costo unitario",
        "Valor total",
        "Estado",
        "Proveedor",
        "Activo",
        "Actualizado",
        "Notas",
      ];
      const header = sheet.getRow(tableHeaderRow);
      header.values = headers;
      header.height = 34;
      header.eachCell((cell) => {
        cell.fill = fill(ORANGE);
        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: WHITE },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = border("FFDD6B20");
      });

      visibleItems.forEach((item, index) => {
        const status = getInventoryStatus(item);
        const itemValue =
          Number(item.current_stock ?? 0) * Number(item.cost_per_unit ?? 0);
        const row = sheet.addRow([
          index + 1,
          item.name,
          getCategoryLabel(item.category, categories),
          INVENTORY_UNIT_LABELS[item.unit] ?? item.unit,
          Number(item.current_stock ?? 0),
          Number(item.min_stock ?? 0),
          Number(item.cost_per_unit ?? 0),
          itemValue,
          STATUS_LABELS[status],
          item.supplier || "Sin proveedor",
          item.is_active ? "Activo" : "Inactivo",
          formatDateTime(item.updated_at),
          item.notes || "",
        ]);

        row.height = 24;
        row.eachCell((cell, colNumber) => {
          cell.fill = fill(index % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB");
          cell.font = { name: "Arial", size: 10, color: { argb: "FF111827" } };
          cell.alignment = {
            horizontal:
              colNumber >= 5 && colNumber <= 8
                ? "right"
                : colNumber === 1
                  ? "center"
                  : "left",
            vertical: "middle",
            wrapText: colNumber === 13,
          };
          cell.border = border("FFE5E7EB");
        });

        row.getCell(2).font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: "FF111827" },
        };
        row.getCell(7).numFmt = "$#,##0.00";
        row.getCell(8).numFmt = "$#,##0.00";

        const statusCell = row.getCell(9);
        const statusColor =
          status === "healthy"
            ? GREEN
            : status === "low"
              ? YELLOW
              : status === "critical"
                ? ORANGE_DARK
                : RED;
        statusCell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: statusColor },
        };
        statusCell.alignment = { horizontal: "center", vertical: "middle" };
      });

      const lastRow = sheet.lastRow?.number ?? tableHeaderRow;
      sheet.autoFilter = {
        from: { row: tableHeaderRow, column: 1 },
        to: { row: lastRow, column: 13 },
      };

      // Footer
      const footerRow = lastRow + 2;
      sheet.mergeCells(`A${footerRow}:H${footerRow}`);
      sheet.getCell(`A${footerRow}`).value =
        "Reporte generado automaticamente por Velasquez Food Truck - Control de Inventario";
      sheet.getCell(`A${footerRow}`).font = {
        name: "Arial",
        size: 10,
        color: { argb: MUTED },
      };
      sheet.getCell(`A${footerRow}`).alignment = { vertical: "middle" };
      sheet.getCell(`A${footerRow}`).fill = fill(BLACK);
      sheet.mergeCells(`I${footerRow}:M${footerRow}`);
      sheet.getCell(`I${footerRow}`).value =
        "Desarrollado por Zamgel Core (ZC)";
      sheet.getCell(`I${footerRow}`).font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: WHITE },
      };
      sheet.getCell(`I${footerRow}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      sheet.getCell(`I${footerRow}`).fill = fill(BLACK);
      sheet.getRow(footerRow).height = 26;

      // Hoja de movimientos recientes
      const movementSheet = workbook.addWorksheet("Movimientos", {
        properties: { tabColor: { argb: "FF22C55E" } },
      });
      movementSheet.columns = [
        { key: "date", width: 20 },
        { key: "item", width: 28 },
        { key: "type", width: 20 },
        { key: "before", width: 14 },
        { key: "change", width: 14 },
        { key: "after", width: 14 },
        { key: "reason", width: 42 },
      ];
      movementSheet.mergeCells("A1:G3");
      movementSheet.getCell("A1").value = "MOVIMIENTOS RECIENTES DE INVENTARIO";
      movementSheet.getCell("A1").font = {
        name: "Arial",
        size: 18,
        bold: true,
        color: { argb: WHITE },
      };
      movementSheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      movementSheet.getCell("A1").fill = fill(BLACK);
      movementSheet.getCell("A1").border = border(ORANGE);

      const movementHeader = movementSheet.getRow(5);
      movementHeader.values = [
        "Fecha",
        "Item",
        "Tipo",
        "Stock anterior",
        "Cambio",
        "Stock final",
        "Motivo",
      ];
      movementHeader.eachCell((cell) => {
        cell.fill = fill(ORANGE);
        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: WHITE },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = border("FFDD6B20");
      });

      if (movements.length > 0) {
        movements.forEach((movement) => {
          const row = movementSheet.addRow([
            formatDateTime(movement.created_at),
            movement.item_name || "Item sin nombre",
            movement.movement_type,
            movement.stock_before,
            movement.quantity_change,
            movement.stock_after,
            movement.reason || "Sin nota",
          ]);
          row.eachCell((cell, colNumber) => {
            cell.border = border("FFE5E7EB");
            cell.alignment = {
              horizontal: colNumber >= 4 && colNumber <= 6 ? "right" : "left",
              vertical: "middle",
              wrapText: true,
            };
            cell.font = {
              name: "Arial",
              size: 10,
              color: { argb: "FF111827" },
            };
          });
          row.getCell(5).font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: movement.quantity_change >= 0 ? GREEN : RED },
          };
        });
      } else {
        movementSheet.addRow([
          "Sin movimientos recientes",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }

      const xlsxBuffer = await workbook.xlsx.writeBuffer();
      downloadBlob(
        new Blob([xlsxBuffer as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `inventario_velasquez_food_truck_${fileDate}.xlsx`,
      );
      setSuccess("Reporte Excel profesional exportado correctamente.");
      setExportModalOpen(false);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "No se pudo exportar el reporte.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-[1800px] px-4 pb-12">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                <Sparkles className="h-4 w-4" />
                Inventario V2 operativo
              </div>
              <h1 className="max-w-none text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                Control de stock
              </h1>
              <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-white/60 sm:text-base">
                Inventario simple, limpio y listo para prueba del cliente.
                Controla entradas, salidas, minimos, costos, proveedores y
                alertas sin afectar POS ni Home.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:flex xl:flex-row">
              <button
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/75 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>

              <button
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/75 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 font-black text-orange-100 transition hover:bg-orange-500/20"
              >
                <Tags className="h-4 w-4" />
                Administrar categorias
              </button>

              <button
                onClick={() => setCategoryForm(createEmptyCategoryForm())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 font-black text-orange-100 transition hover:bg-orange-500/20"
              >
                <Plus className="h-4 w-4" />
                Nueva categoria
              </button>

              <button
                onClick={() => setForm(createEmptyInventoryForm())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                <Plus className="h-4 w-4" />
                Nuevo item
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Items activos"
            value={activeItems.length}
            helper="Ingredientes y suministros"
            tone="green"
          />
          <StatCard
            label="Alertas"
            value={alertItems.length}
            helper="Bajo, critico o agotado"
            tone="orange"
          />
          <StatCard
            label="Agotados"
            value={outItems.length}
            helper="Stock en cero"
            tone="red"
          />
          <StatCard
            label="Valor estimado"
            value={formatMoney(estimatedValue)}
            helper="Segun costo capturado"
          />
        </div>

        {(error || success) && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
              error
                ? "border-red-500/25 bg-red-500/10 text-red-200"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/30">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-orange-500"
                placeholder="Buscar item, proveedor o nota..."
              />
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as InventoryCategory | "all")
              }
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-black">
                Todas las categorias
              </option>
              {getCategoryOptions(categories).map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-black"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as InventoryStatus | "all")
              }
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-black">
                Todos los estados
              </option>
              <option value="healthy" className="bg-black">
                Saludable
              </option>
              <option value="low" className="bg-black">
                Bajo
              </option>
              <option value="critical" className="bg-black">
                Critico
              </option>
              <option value="out" className="bg-black">
                Agotado
              </option>
            </select>

            <button
              onClick={() => setShowInactive((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                showInactive
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-200"
                  : "border-white/10 bg-black/25 text-white/55 hover:text-white"
              }`}
            >
              {showInactive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Inactivos
            </button>
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div>
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
                <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-orange-300" />
                Cargando inventario...
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <PackageMinus className="mx-auto mb-3 h-10 w-10 text-white/25" />
                <h2 className="text-xl font-black">
                  No hay items para mostrar
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  Ajusta filtros o agrega el primer item de inventario.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {visibleItems.map((item) => {
                  const status = getInventoryStatus(item);
                  const progress = getProgress(item);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-3xl border bg-white/[0.035] p-5 shadow-2xl shadow-black/25 transition hover:border-orange-500/35 ${
                        item.is_active
                          ? "border-white/10"
                          : "border-white/5 opacity-55"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}
                            >
                              {status === "healthy" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              )}
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                              {getCategoryLabel(item.category, categories)}
                            </span>
                          </div>

                          <h2 className="text-2xl font-black tracking-tight">
                            {item.name}
                          </h2>
                          <p className="mt-1 text-sm text-white/45">
                            Proveedor: {item.supplier || "Sin proveedor"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setForm(inventoryItemToForm(item))}
                            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(item)}
                            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
                            title={item.is_active ? "Desactivar" : "Activar"}
                          >
                            {item.is_active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                            Stock
                          </p>
                          <p className="mt-2 text-2xl font-black">
                            {formatNumber(item.current_stock)}{" "}
                            <span className="text-sm text-white/35">
                              {INVENTORY_UNIT_LABELS[item.unit]}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                            Minimo
                          </p>
                          <p className="mt-2 text-2xl font-black">
                            {formatNumber(item.min_stock)}{" "}
                            <span className="text-sm text-white/35">
                              {INVENTORY_UNIT_LABELS[item.unit]}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                            Valor
                          </p>
                          <p className="mt-2 text-2xl font-black">
                            {formatMoney(
                              (item.cost_per_unit ?? 0) * item.current_stock,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/40">
                          <span className="inline-flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5" /> Nivel vs minimo
                          </span>
                          <span>{formatNumber(progress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-orange-500 shadow-lg shadow-orange-500/30"
                            style={{ width: `${Math.max(3, progress)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white/35">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" /> Actualizado{" "}
                          {formatDateTime(item.updated_at)}
                        </span>
                        <span>
                          Costo unitario {formatMoney(item.cost_per_unit)}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-relaxed text-white/45">
                          {item.notes}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuickStock(item, item.current_stock - 1)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/65 transition hover:bg-white/10"
                        >
                          <TrendingDown className="h-4 w-4" /> -1
                        </button>
                        <button
                          onClick={() =>
                            handleQuickStock(item, item.current_stock + 1)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/65 transition hover:bg-white/10"
                        >
                          <TrendingUp className="h-4 w-4" /> +1
                        </button>
                        <button
                          onClick={() =>
                            setAdjustment({
                              item,
                              mode: "add",
                              amount: "1",
                              reason: "",
                            })
                          }
                          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-black text-orange-200 transition hover:bg-orange-500/20"
                        >
                          <PackageCheck className="h-4 w-4" />
                          Ajustar stock
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/25 2xl:sticky 2xl:top-5 2xl:self-start">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Movimientos</h2>
                <p className="text-sm text-white/45">
                  Ultimos ajustes de stock.
                </p>
              </div>
              <History className="h-5 w-5 text-orange-300" />
            </div>

            <div className="space-y-3">
              {movements.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
                  Todavia no hay movimientos registrados.
                </div>
              ) : (
                movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">
                          {movement.item_name || "Item"}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          {formatDateTime(movement.created_at)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${movement.quantity_change >= 0 ? "bg-emerald-500/10 text-emerald-200" : "bg-red-500/10 text-red-200"}`}
                      >
                        {movement.quantity_change >= 0 ? "+" : ""}
                        {formatNumber(movement.quantity_change)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/45">
                      {formatNumber(movement.stock_before)} -{" "}
                      {formatNumber(movement.stock_after)}
                    </p>
                    {movement.reason && (
                      <p className="mt-2 text-sm text-white/55">
                        {movement.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>

      {form && (
        <InventoryFormModal
          categories={categories}
          form={form}
          saving={saving}
          onChange={setForm}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}

      {adjustment && (
        <StockAdjustmentModal
          adjustment={adjustment}
          saving={saving}
          onChange={setAdjustment}
          onClose={() => setAdjustment(null)}
          onSave={handleAdjustmentSave}
        />
      )}

      {categoryForm && (
        <CategoryFormModal
          form={categoryForm}
          saving={saving}
          onChange={setCategoryForm}
          onClose={() => setCategoryForm(null)}
          onSave={handleSaveCategory}
        />
      )}

      {categoryManagerOpen && (
        <CategoryManagerModal
          categories={categories}
          itemCountsByCategory={itemCountsByCategory}
          saving={saving}
          onClose={() => setCategoryManagerOpen(false)}
          onCreate={() => setCategoryForm(createEmptyCategoryForm())}
          onEdit={(categoryToEdit) =>
            setCategoryForm(inventoryCategoryToForm(categoryToEdit))
          }
          onToggle={handleToggleCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {exportModalOpen && (
        <ExportReportModal
          activeCount={visibleItems.filter((item) => item.is_active).length}
          alertCount={
            visibleItems.filter(
              (item) => getInventoryStatus(item) !== "healthy",
            ).length
          }
          exporting={exporting}
          inactiveCount={visibleItems.filter((item) => !item.is_active).length}
          itemCount={visibleItems.length}
          onClose={() => setExportModalOpen(false)}
          onDownload={exportProfessionalReport}
          totalValue={visibleItems.reduce(
            (total, item) =>
              total +
              Number(item.current_stock ?? 0) * Number(item.cost_per_unit ?? 0),
            0,
          )}
        />
      )}
    </main>
  );
}
