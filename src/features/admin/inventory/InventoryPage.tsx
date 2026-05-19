// 📍 Ruta: src/features/admin/inventory/InventoryPage.tsx

import React from "react";
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
  PackageCheck,
  PackageMinus,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
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
  InventoryFormData,
  InventoryItem,
  InventoryMovement,
  InventoryStatus,
  InventoryStockAdjustmentForm,
} from "./inventory.types";
import {
  adjustInventoryStock,
  createEmptyInventoryForm,
  getInventoryItems,
  getInventoryStatus,
  getRecentInventoryMovements,
  inventoryItemToForm,
  saveInventoryItem,
  toggleInventoryItemActive,
  updateInventoryStock,
} from "./inventory.service";

const STATUS_STYLES: Record<InventoryStatus, string> = {
  healthy: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  low: "border-yellow-500/25 bg-yellow-500/10 text-yellow-200",
  critical: "border-orange-500/35 bg-orange-500/15 text-orange-200",
  out: "border-red-500/35 bg-red-500/15 text-red-200",
};

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

function getProgress(item: InventoryItem) {
  if (item.min_stock <= 0) return 100;
  return Math.min(100, Math.max(0, (item.current_stock / item.min_stock) * 100));
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
    <div className={`rounded-3xl border p-5 shadow-2xl shadow-black/30 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm opacity-65">{helper}</p>
    </div>
  );
}

function InventoryFormModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
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
              Controla stock, minimos, unidad, proveedor, costo y notas internas.
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
              onChange={(event) => onChange({ ...form, name: event.target.value })}
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
              {INVENTORY_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-black">
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
                onChange({ ...form, unit: event.target.value as InventoryFormData["unit"] })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            >
              {INVENTORY_UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-black">
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
              onChange={(event) => onChange({ ...form, min_stock: event.target.value })}
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
              onChange={(event) => onChange({ ...form, sort_order: event.target.value })}
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
              onChange={(event) => onChange({ ...form, supplier: event.target.value })}
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
              onChange={(event) => onChange({ ...form, notes: event.target.value })}
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
              onChange={(event) => onChange({ ...form, is_active: event.target.checked })}
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
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
              {adjustment.item.name} tiene {formatNumber(adjustment.item.current_stock)} {INVENTORY_UNIT_LABELS[adjustment.item.unit]}.
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
            {([
              ["add", "Entrada"],
              ["subtract", "Salida"],
              ["set", "Fijar"],
            ] as const).map(([mode, label]) => (
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
              onChange={(event) => onChange({ ...adjustment, amount: event.target.value })}
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
              onChange={(event) => onChange({ ...adjustment, reason: event.target.value })}
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
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SlidersHorizontal className="h-4 w-4" />}
            Aplicar ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [movements, setMovements] = React.useState<InventoryMovement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<InventoryCategory | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<InventoryStatus | "all">("all");
  const [showInactive, setShowInactive] = React.useState(false);
  const [form, setForm] = React.useState<InventoryFormData | null>(null);
  const [adjustment, setAdjustment] = React.useState<InventoryStockAdjustmentForm | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [inventoryItems, recentMovements] = await Promise.all([
        getInventoryItems(),
        getRecentInventoryMovements(10),
      ]);
      setItems(inventoryItems);
      setMovements(recentMovements);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Error cargando inventario.");
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

  const activeItems = React.useMemo(() => items.filter((item) => item.is_active), [items]);
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
        return total + Number(item.current_stock ?? 0) * Number(item.cost_per_unit ?? 0);
      }, 0),
    [activeItems],
  );

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
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el item.");
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
      setError(adjustError instanceof Error ? adjustError.message : "No se pudo ajustar stock.");
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
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo cambiar el estado.");
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
      setError(stockError instanceof Error ? stockError.message : "No se pudo actualizar stock.");
    }
  };

  const exportCsv = () => {
    const rows = visibleItems.map((item) => ({
      name: item.name,
      category: INVENTORY_CATEGORY_LABELS[item.category] ?? item.category,
      status: STATUS_LABELS[getInventoryStatus(item)],
      stock: item.current_stock,
      min_stock: item.min_stock,
      unit: INVENTORY_UNIT_LABELS[item.unit] ?? item.unit,
      cost_per_unit: item.cost_per_unit ?? "",
      supplier: item.supplier ?? "",
      active: item.is_active ? "yes" : "no",
      updated_at: item.updated_at,
    }));

    const header = Object.keys(rows[0] ?? { name: "" });
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key as keyof typeof row] ?? "").replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "velasquez-inventario.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-[1800px] px-4 pb-12">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                <Sparkles className="h-4 w-4" />
                Inventario V2 operativo
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Control de stock
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
                Inventario simple, limpio y listo para prueba del cliente. Controla entradas, salidas, minimos, costos, proveedores y alertas sin afectar POS ni Home.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={exportCsv}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/75 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>

              <button
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white/75 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
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
          <StatCard label="Items activos" value={activeItems.length} helper="Ingredientes y suministros" tone="green" />
          <StatCard label="Alertas" value={alertItems.length} helper="Bajo, critico o agotado" tone="orange" />
          <StatCard label="Agotados" value={outItems.length} helper="Stock en cero" tone="red" />
          <StatCard label="Valor estimado" value={formatMoney(estimatedValue)} helper="Segun costo capturado" />
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
              onChange={(event) => setCategory(event.target.value as InventoryCategory | "all")}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-black">Todas las categorias</option>
              {INVENTORY_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-black">
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as InventoryStatus | "all")}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-black">Todos los estados</option>
              <option value="healthy" className="bg-black">Saludable</option>
              <option value="low" className="bg-black">Bajo</option>
              <option value="critical" className="bg-black">Critico</option>
              <option value="out" className="bg-black">Agotado</option>
            </select>

            <button
              onClick={() => setShowInactive((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                showInactive
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-200"
                  : "border-white/10 bg-black/25 text-white/55 hover:text-white"
              }`}
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                <h2 className="text-xl font-black">No hay items para mostrar</h2>
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
                        item.is_active ? "border-white/10" : "border-white/5 opacity-55"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}>
                              {status === "healthy" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                              {INVENTORY_CATEGORY_LABELS[item.category] ?? item.category}
                            </span>
                          </div>

                          <h2 className="text-2xl font-black tracking-tight">{item.name}</h2>
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
                            {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Stock</p>
                          <p className="mt-2 text-2xl font-black">
                            {formatNumber(item.current_stock)} <span className="text-sm text-white/35">{INVENTORY_UNIT_LABELS[item.unit]}</span>
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Minimo</p>
                          <p className="mt-2 text-2xl font-black">
                            {formatNumber(item.min_stock)} <span className="text-sm text-white/35">{INVENTORY_UNIT_LABELS[item.unit]}</span>
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Valor</p>
                          <p className="mt-2 text-2xl font-black">{formatMoney((item.cost_per_unit ?? 0) * item.current_stock)}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/40">
                          <span className="inline-flex items-center gap-2"><Gauge className="h-3.5 w-3.5" /> Nivel vs minimo</span>
                          <span>{formatNumber(progress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-orange-500 shadow-lg shadow-orange-500/30" style={{ width: `${Math.max(3, progress)}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white/35">
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Actualizado {formatDateTime(item.updated_at)}</span>
                        <span>Costo unitario {formatMoney(item.cost_per_unit)}</span>
                      </div>

                      {item.notes && (
                        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-relaxed text-white/45">
                          {item.notes}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleQuickStock(item, item.current_stock - 1)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/65 transition hover:bg-white/10"
                        >
                          <TrendingDown className="h-4 w-4" /> -1
                        </button>
                        <button
                          onClick={() => handleQuickStock(item, item.current_stock + 1)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/65 transition hover:bg-white/10"
                        >
                          <TrendingUp className="h-4 w-4" /> +1
                        </button>
                        <button
                          onClick={() => setAdjustment({ item, mode: "add", amount: "1", reason: "" })}
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
                <p className="text-sm text-white/45">Ultimos ajustes de stock.</p>
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
                  <div key={movement.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{movement.item_name || "Item"}</p>
                        <p className="mt-1 text-xs text-white/40">{formatDateTime(movement.created_at)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${movement.quantity_change >= 0 ? "bg-emerald-500/10 text-emerald-200" : "bg-red-500/10 text-red-200"}`}>
                        {movement.quantity_change >= 0 ? "+" : ""}{formatNumber(movement.quantity_change)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/45">
                      {formatNumber(movement.stock_before)} - {formatNumber(movement.stock_after)}
                    </p>
                    {movement.reason && <p className="mt-2 text-sm text-white/55">{movement.reason}</p>}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>

      {form && (
        <InventoryFormModal
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
    </main>
  );
}
