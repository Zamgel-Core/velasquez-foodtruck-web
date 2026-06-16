// 📍 Ruta: src/features/admin/loyalty/LoyaltyPage.tsx

import React from "react";
import {
  BadgeCheck,
  Cake,
  CalendarDays,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Gift,
  History,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Settings,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import { getProducts } from "../../../services/products.service";
import {
  LOYALTY_REWARD_TYPE_HELPER,
  LOYALTY_REWARD_TYPE_LABELS,
  LOYALTY_TIERS,
  getLoyaltyTier,
  getTierProgress,
} from "./loyalty.constants";
import type {
  LoyaltyCustomer,
  LoyaltyCustomerFormData,
  LoyaltyMovement,
  LoyaltyPointsFormData,
  LoyaltyReward,
  LoyaltyRewardFormData,
  LoyaltySettings,
  LoyaltySettingsFormData,
} from "./loyalty.types";
import {
  createDefaultLoyaltySettingsForm,
  createEmptyLoyaltyCustomerForm,
  createEmptyLoyaltyRewardForm,
  createEmptyPointsForm,
  deleteLoyaltyReward,
  formatPhoneForDisplay,
  getLoyaltyCustomers,
  getLoyaltyRewards,
  getLoyaltySettings,
  getRecentLoyaltyMovements,
  loyaltyCustomerToForm,
  loyaltyRewardToForm,
  loyaltySettingsToForm,
  saveLoyaltyCustomer,
  saveLoyaltyPointsMovement,
  saveLoyaltyReward,
  saveLoyaltySettings,
  toggleLoyaltyCustomerActive,
  toggleLoyaltyRewardActive,
} from "./loyalty.service";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatDate(value: string): string {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}


function getBirthdayInfo(birthDate?: string | null): { daysUntil: number; dateLabel: string } | null {
  if (!birthDate) return null;

  const [year, month, day] = birthDate.split("-").map(Number);

  if (!month || !day) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBirthday = new Date(today.getFullYear(), month - 1, day);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
  }

  const daysUntil = Math.round(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const dateLabel = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    day: "numeric",
  }).format(nextBirthday);

  return { daysUntil, dateLabel };
}

function BirthdayPreviewCard({ customers }: { customers: LoyaltyCustomer[] }) {
  const upcomingBirthdays = customers
    .map((customer) => ({
      customer,
      birthday: getBirthdayInfo(customer.birth_date),
    }))
    .filter(
      (item): item is { customer: LoyaltyCustomer; birthday: { daysUntil: number; dateLabel: string } } =>
        Boolean(item.birthday) && item.birthday.daysUntil <= 7,
    )
    .sort((a, b) => a.birthday.daysUntil - b.birthday.daysUntil)
    .slice(0, 6);

  return (
    <div className="mb-6 overflow-hidden rounded-[2rem] border border-red-500/20 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_34%),rgba(255,255,255,0.035)] p-5 shadow-2xl shadow-black/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-100 shadow-lg shadow-red-500/10">
            <Cake className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-200">
              Cumpleaños próximos
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Clientes con cumpleaños en los siguientes 7 días
            </h2>
            <p className="mt-1 text-sm text-white/45">
              La fecha solo la registra el admin para evitar cambios indebidos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black text-white/70">
          <CalendarDays className="h-4 w-4 text-red-200" />
          {upcomingBirthdays.length} próximos
        </div>
      </div>

      {upcomingBirthdays.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-semibold text-white/45">
          No hay cumpleaños registrados para esta semana.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {upcomingBirthdays.map(({ customer, birthday }) => (
            <div
              key={customer.id}
              className={`rounded-2xl border p-4 ${
                birthday.daysUntil === 0
                  ? "border-red-400/40 bg-red-500/15 shadow-lg shadow-red-500/10"
                  : "border-white/10 bg-black/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{customer.full_name}</p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {formatPhoneForDisplay(customer.phone)}
                  </p>
                </div>
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-100">
                  {birthday.daysUntil === 0 ? "Hoy 🎂" : `${birthday.daysUntil} días`}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-red-100">
                {birthday.dateLabel}
              </p>
              <p className="mt-1 text-xs text-white/40">
                Sugerencia: validar en ventanilla antes de entregar cortesía.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerFormModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: LoyaltyCustomerFormData;
  saving: boolean;
  onChange: (form: LoyaltyCustomerFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#090909] shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-red-500/10 p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">
              <UserPlus className="h-3.5 w-3.5" />
              Cliente lealtad
            </div>
            <h2 className="mt-3 text-2xl font-black">
              {form.id ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Registro manual para mostrar el potencial del programa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Nombre
            </span>
            <input
              value={form.full_name}
              onChange={(event) =>
                onChange({ ...form, full_name: event.target.value })
              }
              placeholder="Ej. Maria Lopez"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Telefono
            </span>
            <input
              value={form.phone}
              onChange={(event) =>
                onChange({ ...form, phone: event.target.value })
              }
              placeholder="3464019676"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Email opcional
            </span>
            <input
              value={form.email}
              onChange={(event) =>
                onChange({ ...form, email: event.target.value })
              }
              placeholder="cliente@email.com"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
              <CalendarDays className="h-3.5 w-3.5 text-red-200" />
              Cumpleaños
            </span>
            <input
              type="date"
              value={form.birth_date}
              onChange={(event) =>
                onChange({ ...form, birth_date: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
            <p className="text-[11px] font-semibold text-white/35">
              Solo visible para admin. Util para futuras promociones de cumpleaños.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Puntos iniciales
            </span>
            <input
              type="number"
              min="0"
              value={form.points}
              onChange={(event) =>
                onChange({ ...form, points: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Visitas
            </span>
            <input
              type="number"
              min="0"
              value={form.visits}
              onChange={(event) =>
                onChange({ ...form, visits: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Gasto estimado
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.lifetime_spend}
              onChange={(event) =>
                onChange({ ...form, lifetime_spend: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Notas
            </span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                onChange({ ...form, notes: event.target.value })
              }
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <button
            type="button"
            onClick={() => onChange({ ...form, is_active: !form.is_active })}
            className={`sm:col-span-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
              form.is_active
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {form.is_active ? "Cliente activo" : "Cliente inactivo"}
          </button>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PointsModal({
  form,
  customers,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: LoyaltyPointsFormData;
  customers: LoyaltyCustomer[];
  saving: boolean;
  onChange: (form: LoyaltyPointsFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#090909] shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-red-500/10 p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">
              <Star className="h-3.5 w-3.5" />
              Ajuste manual
            </div>
            <h2 className="mt-3 text-2xl font-black">Modificar puntos</h2>
            <p className="mt-1 text-sm text-white/55">
              Por ahora los puntos se controlan manualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Cliente
            </span>
            <select
              value={form.customer_id}
              onChange={(event) =>
                onChange({ ...form, customer_id: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {formatPhoneForDisplay(customer.phone)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "add", label: "Sumar" },
              { value: "subtract", label: "Restar" },
              { value: "set", label: "Fijar" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...form,
                    movement_type:
                      option.value as LoyaltyPointsFormData["movement_type"],
                  })
                }
                className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                  form.movement_type === option.value
                    ? "border-orange-500/50 bg-orange-500 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Puntos
            </span>
            <input
              type="number"
              min="0"
              value={form.points}
              onChange={(event) =>
                onChange({ ...form, points: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Motivo
            </span>
            <input
              value={form.reason}
              onChange={(event) =>
                onChange({ ...form, reason: event.target.value })
              }
              placeholder="Ej. visita, ajuste manual, cortesia"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar puntos"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RewardFormModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: LoyaltyRewardFormData;
  saving: boolean;
  onChange: (form: LoyaltyRewardFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const isFreeItem = form.reward_type === "free_item";
  const isPercent = form.reward_type === "percent_discount";
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();

        setProducts(data.filter((product: any) => product.is_active !== false));
      } catch (error) {
        console.error(error);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#090909] text-white shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-red-500/10 p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">
              <Gift className="h-3.5 w-3.5" />
              Recompensa
            </div>
            <h2 className="mt-3 text-2xl font-black">
              {form.id ? "Editar recompensa" : "Nueva recompensa"}
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Configura premios para canjear en ventanilla desde el POS.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[72vh] gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Nombre de recompensa
            </span>
            <input
              value={form.title}
              onChange={(event) =>
                onChange({ ...form, title: event.target.value })
              }
              placeholder="Ej. Horchata gratis"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Tipo
            </span>
            <select
              value={form.reward_type}
              onChange={(event) =>
                onChange({
                  ...form,
                  reward_type: event.target
                    .value as LoyaltyRewardFormData["reward_type"],
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            >
              {Object.entries(LOYALTY_REWARD_TYPE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
            <p className="text-xs font-semibold text-white/40">
              {LOYALTY_REWARD_TYPE_HELPER[form.reward_type]}
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Puntos requeridos
            </span>
            <input
              type="number"
              min="0"
              value={form.points_required}
              onChange={(event) =>
                onChange({ ...form, points_required: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Nivel minimo
            </span>
            <select
              value={form.min_tier}
              onChange={(event) =>
                onChange({
                  ...form,
                  min_tier: event.target
                    .value as LoyaltyRewardFormData["min_tier"],
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            >
              {Object.entries(LOYALTY_TIERS).map(([value, tier]) => (
                <option key={value} value={value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </label>

          {isFreeItem && (
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                Producto conectado
              </span>

              <select
                value={(form as any).reward_product_id ?? ""}
                onChange={(event) => {
                  const product = products.find(
                    (item) => item.id === event.target.value,
                  );

                  onChange({
                    ...form,
                    reward_product_id: event.target.value,
                    reward_product_name: product?.name ?? "",
                    title: product?.name
                      ? `${product.name} gratis`
                      : form.title,
                    description: product?.description ?? form.description,
                  } as any);
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
              >
                <option value="">Selecciona producto</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              {isFreeItem
                ? "Producto / premio gratis"
                : isPercent
                  ? "Porcentaje"
                  : "Descuento"}
            </span>
            {isFreeItem ? (
              <input
                value={form.product_label}
                onChange={(event) =>
                  onChange({ ...form, product_label: event.target.value })
                }
                placeholder="Ej. Bebida de horchata"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
              />
            ) : (
              <input
                type="number"
                min="0"
                step={isPercent ? "1" : "0.01"}
                value={form.value_amount}
                onChange={(event) =>
                  onChange({ ...form, value_amount: event.target.value })
                }
                placeholder={isPercent ? "5" : "5.00"}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
              />
            )}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Orden visual
            </span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(event) =>
                onChange({ ...form, sort_order: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Descripcion
            </span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              placeholder="Ej. Canje valido en ventanilla. No combinable con otras promociones."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
            <div>
              <p className="font-black">Recompensa activa</p>
              <p className="text-sm text-white/45">
                Si esta apagada, no aparece como opcion de canje.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                onChange({ ...form, is_active: event.target.checked })
              }
              className="h-5 w-5 accent-orange-500"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar recompensa"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoyaltySettingsModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: LoyaltySettingsFormData;
  saving: boolean;
  onChange: (form: LoyaltySettingsFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#090909] text-white shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-red-500/10 p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">
              <Settings className="h-3.5 w-3.5" />
              Ajustes de lealtad
            </div>
            <h2 className="mt-3 text-2xl font-black">
              Configuracion del programa
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Regla actual: puntos por dolar con redondeo desde 0.80.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
            <div>
              <p className="font-black">Programa activo</p>
              <p className="text-sm text-white/45">
                Permite sumar puntos cuando el pedido queda listo o entregado.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.is_enabled}
              onChange={(event) =>
                onChange({ ...form, is_enabled: event.target.checked })
              }
              className="h-5 w-5 accent-orange-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Puntos por dolar
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.points_per_dollar}
              onChange={(event) =>
                onChange({ ...form, points_per_dollar: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Redondeo desde
            </span>
            <input
              type="number"
              min="0"
              max="0.99"
              step="0.01"
              value={form.rounding_threshold}
              onChange={(event) =>
                onChange({ ...form, rounding_threshold: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-red-500/60"
            />
            <p className="text-xs font-semibold text-white/40">
              Ej. 0.80: $3.80 suma 4 puntos, $3.79 suma 3.
            </p>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <p className="font-black">Crear clientes automaticamente</p>
              <p className="text-sm text-white/45">
                Si el telefono no existe, se crea al comprar.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.auto_create_customers}
              onChange={(event) =>
                onChange({
                  ...form,
                  auto_create_customers: event.target.checked,
                })
              }
              className="h-5 w-5 accent-orange-500"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="font-black">Sumar puntos cuando</p>
            <div className="mt-3 space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm font-bold text-white/70">
                Pedido listo
                <input
                  type="checkbox"
                  checked={form.earn_on_ready}
                  onChange={(event) =>
                    onChange({ ...form, earn_on_ready: event.target.checked })
                  }
                  className="h-5 w-5 accent-orange-500"
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-bold text-white/70">
                Pedido entregado
                <input
                  type="checkbox"
                  checked={form.earn_on_delivered}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      earn_on_delivered: event.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-orange-500"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar ajustes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoyaltyPage() {
  const [customers, setCustomers] = React.useState<LoyaltyCustomer[]>([]);
  const [movements, setMovements] = React.useState<LoyaltyMovement[]>([]);
  const [rewards, setRewards] = React.useState<LoyaltyReward[]>([]);
  const [settings, setSettings] = React.useState<LoyaltySettings | null>(null);
  const [query, setQuery] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [customerForm, setCustomerForm] =
    React.useState<LoyaltyCustomerFormData | null>(null);
  const [pointsForm, setPointsForm] =
    React.useState<LoyaltyPointsFormData | null>(null);
  const [rewardForm, setRewardForm] =
    React.useState<LoyaltyRewardFormData | null>(null);
  const [settingsForm, setSettingsForm] =
    React.useState<LoyaltySettingsFormData | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);

    try {
      const [customersData, movementsData, rewardsData, settingsData] =
        await Promise.all([
          getLoyaltyCustomers(),
          getRecentLoyaltyMovements(),
          getLoyaltyRewards(),
          getLoyaltySettings(),
        ]);

      setCustomers(customersData);
      setMovements(movementsData);
      setRewards(rewardsData);
      setSettings(settingsData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleCustomers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!showInactive && !customer.is_active) return false;
      if (!normalizedQuery) return true;

      return [
        customer.full_name,
        customer.phone,
        customer.email ?? "",
        customer.notes ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [customers, query, showInactive]);

  const activeCustomers = customers.filter((customer) => customer.is_active);
  const totalPoints = activeCustomers.reduce(
    (sum, customer) => sum + customer.points,
    0,
  );
  const totalVisits = activeCustomers.reduce(
    (sum, customer) => sum + customer.visits,
    0,
  );
  const vipCount = activeCustomers.filter(
    (customer) => getLoyaltyTier(customer.points) === "vip",
  ).length;
  const topCustomer = activeCustomers[0] ?? null;

  const handleSaveCustomer = async () => {
    if (!customerForm) return;

    setSaving(true);

    try {
      await saveLoyaltyCustomer(customerForm);
      setCustomerForm(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleSavePoints = async () => {
    if (!pointsForm) return;

    setSaving(true);

    try {
      await saveLoyaltyPointsMovement(pointsForm);
      setPointsForm(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustomer = async (customer: LoyaltyCustomer) => {
    await toggleLoyaltyCustomerActive(customer);
    await loadData();
  };

  const handleSaveReward = async () => {
    if (!rewardForm) return;

    setSaving(true);

    try {
      await saveLoyaltyReward(rewardForm);
      setRewardForm(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReward = async (reward: LoyaltyReward) => {
    await toggleLoyaltyRewardActive(reward);
    await loadData();
  };

  const handleDeleteReward = async (reward: LoyaltyReward) => {
    const confirmed = window.confirm(
      `Eliminar recompensa "${reward.title}"? Esta accion no afecta clientes ni puntos existentes.`,
    );

    if (!confirmed) return;

    await deleteLoyaltyReward(reward);
    await loadData();
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;

    setSaving(true);

    try {
      await saveLoyaltySettings(settingsForm);
      setSettingsForm(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const activeRewards = rewards.filter((reward) => reward.is_active);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-[1800px] px-4 pb-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-red-500/20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-200">
                <Gift className="h-4 w-4" />
                Lealtad V4 canjes POS
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                Clientes frecuentes
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
                Programa de puntos conectado a POS, recompensas configurables y
                canjes reales en ventanilla.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:flex xl:flex-row">
              <button
                type="button"
                onClick={() =>
                  setCustomerForm(createEmptyLoyaltyCustomerForm())
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                Nuevo cliente
              </button>

              <button
                type="button"
                onClick={() => setPointsForm(createEmptyPointsForm())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-orange-100 transition hover:bg-orange-500/20"
              >
                <Star className="h-4 w-4" />
                Ajustar puntos
              </button>

              <button
                type="button"
                onClick={() => setRewardForm(createEmptyLoyaltyRewardForm())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-orange-100 transition hover:bg-orange-500/20"
              >
                <Gift className="h-4 w-4" />
                Nueva recompensa
              </button>

              <button
                type="button"
                onClick={() =>
                  setSettingsForm(
                    settings
                      ? loyaltySettingsToForm(settings)
                      : createDefaultLoyaltySettingsForm(),
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
                Ajustes
              </button>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refrescar
              </button>
            </div>
          </div>
        </div>

        <BirthdayPreviewCard customers={activeCustomers} />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Clientes activos",
              value: activeCustomers.length,
              icon: Users,
              helper: `${customers.length} registros totales`,
            },
            {
              label: "Puntos activos",
              value: totalPoints,
              icon: Star,
              helper: "Puntos disponibles manuales",
            },
            {
              label: "Visitas",
              value: totalVisits,
              icon: Trophy,
              helper: "Visitas acumuladas registradas",
            },
            {
              label: "Clientes VIP",
              value: vipCount,
              icon: Crown,
              helper: topCustomer
                ? `Top: ${topCustomer.full_name}`
                : "Sin clientes todavia",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/25"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-black">{metric.value}</p>
                <p className="mt-1 text-xs font-semibold text-white/45">
                  {metric.helper}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/25 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black">Clientes de lealtad</h2>
                <p className="mt-1 text-sm text-white/45">
                  Puntos conectados a POS. Canjes en ventanilla activos desde el
                  POS Admin.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-red-500/60 sm:w-72"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowInactive((value) => !value)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    showInactive
                      ? "border-orange-500/40 bg-red-500/10 text-orange-100"
                      : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10"
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

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-center text-sm font-bold text-white/45">
                Cargando lealtad...
              </div>
            ) : visibleCustomers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-red-500/30 bg-orange-500/5 p-8 text-center">
                <Gift className="mx-auto mb-4 h-10 w-10 text-orange-300" />
                <h3 className="text-xl font-black">Sin clientes registrados</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                  Agrega clientes manualmente para mostrar niveles, puntos y
                  progreso visual.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleCustomers.map((customer) => {
                  const tierKey = getLoyaltyTier(customer.points);
                  const tier = LOYALTY_TIERS[tierKey];
                  const progress = getTierProgress(customer.points);

                  return (
                    <div
                      key={customer.id}
                      className={`overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${tier.gradient} p-5 shadow-2xl shadow-black/25`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                            {tier.badge}
                          </div>
                          <div>
                            <h3 className="font-black leading-tight">
                              {customer.full_name}
                            </h3>
                            <p className="text-xs font-semibold text-white/50">
                              {formatPhoneForDisplay(customer.phone)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tier.chip}`}
                        >
                          {tier.label}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                            Puntos
                          </p>
                          <p className="mt-1 text-xl font-black">
                            {customer.points}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                            Visitas
                          </p>
                          <p className="mt-1 text-xl font-black">
                            {customer.visits}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                            Gasto
                          </p>
                          <p className="mt-1 text-sm font-black">
                            {formatMoney(customer.lifetime_spend)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/55">
                          <span>Progreso de nivel</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-black/40">
                          <div
                            className="h-full rounded-full bg-orange-400 shadow-lg shadow-orange-500/30"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPointsForm(createEmptyPointsForm(customer.id))
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/20"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Puntos
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomerForm(loyaltyCustomerToForm(customer))
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCustomer(customer)}
                          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition ${
                            customer.is_active
                              ? "border-red-500/30 bg-red-500/10 text-red-200"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                          }`}
                        >
                          {customer.is_active ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Activar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 shadow-2xl shadow-black/25">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-red-200" />
                  <h2 className="text-lg font-black">Recompensas</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRewardForm(createEmptyLoyaltyRewardForm())}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nueva
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      Programa
                    </p>
                    <p className="mt-1 font-black">
                      {settings?.is_enabled === false ? "Pausado" : "Activo"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      Regla
                    </p>
                    <p className="mt-1 text-sm font-black text-red-200">
                      ${settings?.points_per_dollar ?? 1} punto / $1
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-white/45">
                  Canje en POS/ventanilla. Descuentos se aplican antes del cargo
                  por tarjeta.
                </p>
              </div>

              <div className="space-y-3">
                {rewards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-red-500/30 bg-black/25 p-4 text-sm text-white/50">
                    Todavia no hay recompensas. Crea ejemplos como Horchata
                    gratis, $5 off o 5% de descuento.
                  </div>
                ) : (
                  rewards.map((reward) => {
                    const tier = LOYALTY_TIERS[reward.min_tier];

                    return (
                      <div
                        key={reward.id}
                        className={`rounded-2xl border p-4 ${
                          reward.is_active
                            ? "border-white/10 bg-black/25"
                            : "border-white/5 bg-black/10 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black">{reward.title}</h3>
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-200">
                                {reward.points_required} pts
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-white/45">
                              {LOYALTY_REWARD_TYPE_LABELS[reward.reward_type]} ·{" "}
                              {tier.label}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                            {reward.is_active ? "Activa" : "Inactiva"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white/50">
                          {reward.reward_type === "free_item"
                            ? reward.product_label || "Producto gratis"
                            : reward.reward_type === "fixed_discount"
                              ? `${formatMoney(reward.value_amount)} de descuento`
                              : `${reward.value_amount}% de descuento`}
                        </p>

                        {reward.description && (
                          <p className="mt-2 text-xs text-white/40">
                            {reward.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setRewardForm(loyaltyRewardToForm(reward))
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleReward(reward)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/20"
                          >
                            {reward.is_active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReward(reward)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/25">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-red-200" />
                <h2 className="text-lg font-black">Movimientos recientes</h2>
              </div>

              <div className="space-y-3">
                {movements.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
                    Todavia no hay movimientos de puntos.
                  </p>
                ) : (
                  movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">
                            {movement.customer?.full_name ?? "Cliente"}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {formatDate(movement.created_at)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-black ${
                            movement.points_delta >= 0
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-red-500/30 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {movement.points_delta >= 0 ? "+" : ""}
                          {movement.points_delta}
                        </span>
                      </div>
                      {movement.reason && (
                        <p className="mt-2 text-xs text-white/45">
                          {movement.reason}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {customerForm && (
        <CustomerFormModal
          form={customerForm}
          saving={saving}
          onChange={setCustomerForm}
          onClose={() => setCustomerForm(null)}
          onSave={handleSaveCustomer}
        />
      )}

      {pointsForm && (
        <PointsModal
          form={pointsForm}
          customers={activeCustomers}
          saving={saving}
          onChange={setPointsForm}
          onClose={() => setPointsForm(null)}
          onSave={handleSavePoints}
        />
      )}

      {rewardForm && (
        <RewardFormModal
          form={rewardForm}
          saving={saving}
          onChange={setRewardForm}
          onClose={() => setRewardForm(null)}
          onSave={handleSaveReward}
        />
      )}

      {settingsForm && (
        <LoyaltySettingsModal
          form={settingsForm}
          saving={saving}
          onChange={setSettingsForm}
          onClose={() => setSettingsForm(null)}
          onSave={handleSaveSettings}
        />
      )}
    </main>
  );
}
