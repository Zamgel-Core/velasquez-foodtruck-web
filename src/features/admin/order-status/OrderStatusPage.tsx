// 📍 Ruta: src/features/order-status/OrderStatusPage.tsx

import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Flame,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  findOrderById,
  findOrderByNumberOrPhone,
  type PublicOrder,
  type PublicOrderStatus,
} from "./order-status.service";
import { useBusinessSettings } from "../../hooks/useBusinessSettings";
import { getBusinessStatus } from "../../utils/businessStatus";
import { buildWhatsAppUrl } from "../admin/settings/admin-settings.service";

const STORAGE_KEY = "velasquez_last_order";
const STORAGE_TTL_MS = 30 * 60 * 1000;

const language =
  typeof window !== "undefined" && localStorage.getItem("lang") === "en"
    ? "en"
    : "es";

const isEnglish = language === "en";

const statusSteps = (isEnglish: boolean) => [
  {
    key: "received" as PublicOrderStatus,
    label: isEnglish ? "Received" : "Recibido",
    description: isEnglish
      ? "Your order arrived in the kitchen."
      : "Tu orden llegó a cocina.",
    icon: Clock3,
  },
  {
    key: "preparing" as PublicOrderStatus,
    label: isEnglish ? "Preparing" : "Preparando",
    description: isEnglish
      ? "We are preparing your food."
      : "Estamos preparando tu comida.",
    icon: Flame,
  },
  {
    key: "ready" as PublicOrderStatus,
    label: isEnglish ? "Ready" : "Listo",
    description: isEnglish
      ? "Your order is ready for pickup."
      : "Tu pedido está listo para recoger.",
    icon: PackageCheck,
  },
  {
    key: "delivered" as PublicOrderStatus,
    label: isEnglish ? "Delivered" : "Entregado",
    description: isEnglish
      ? "Order delivered. Thank you!"
      : "Pedido entregado. ¡Gracias!",
    icon: Truck,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status: PublicOrderStatus, isEnglish: boolean) {
  const labels: Record<PublicOrderStatus, string> = {
    received: isEnglish ? "Received" : "Recibido",
    preparing: isEnglish ? "Preparing" : "Preparando",
    ready: isEnglish ? "Ready" : "Listo",
    delivered: isEnglish ? "Delivered" : "Entregado",
    cancelled: isEnglish ? "Cancelled" : "Cancelado",
  };

  return labels[status] ?? status;
}

function saveLastOrder(order: PublicOrder) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
      expiresAt: Date.now() + STORAGE_TTL_MS,
    }),
  );
}

function readLastOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      orderId?: string;
      orderNumber?: string;
      expiresAt?: number;
    };

    if (
      (!parsed.orderId && !parsed.orderNumber) ||
      !parsed.expiresAt ||
      parsed.expiresAt < Date.now()
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export default function OrderStatusPage() {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [autoLoading, setAutoLoading] = React.useState(true);
  const [order, setOrder] = React.useState<PublicOrder | null>(null);
  const [error, setError] = React.useState("");
  const { settings } = useBusinessSettings();
  const businessStatus = React.useMemo(
    () => getBusinessStatus(language, settings.business_hours),
    [settings.business_hours],
  );

  const translatedStatusSteps = statusSteps(isEnglish);

  const loadOrderById = React.useCallback(async (orderId: string) => {
    const result = await findOrderById(orderId);

    if (result) {
      setOrder(result);
      saveLastOrder(result);
    }
  }, []);

  React.useEffect(() => {
    const saved = readLastOrder();

    const params = new URLSearchParams(window.location.search);
    const queryOrder = params.get("order") || params.get("orden");

    if (queryOrder) {
      setSearch(queryOrder);
      findOrderByNumberOrPhone(queryOrder)
        .then((result) => {
          if (result) {
            setOrder(result);
            saveLastOrder(result);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setAutoLoading(false));
      return;
    }

    if (!saved?.orderId && !saved?.orderNumber) {
      setAutoLoading(false);
      return;
    }

    const request = saved.orderId
      ? loadOrderById(saved.orderId)
      : findOrderByNumberOrPhone(saved.orderNumber ?? "").then((result) => {
          if (result) {
            setOrder(result);
            saveLastOrder(result);
          }
        });

    request
      .catch((err) => {
        console.error(err);
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setAutoLoading(false));
  }, [loadOrderById]);

  React.useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`public-order-status-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        async () => {
          const updated = await findOrderById(order.id);
          if (updated) {
            setOrder(updated);
            saveLastOrder(updated);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  async function handleSearch() {
    const query = search.trim();

    if (!query) {
      setError(
        isEnglish
          ? "Enter your order number or phone."
          : "Escribe tu número de orden o teléfono.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await findOrderByNumberOrPhone(query);

      if (!result) {
        setOrder(null);
        setError(
          isEnglish
            ? "We couldn't find any orders with those details."
            : "No encontramos ninguna orden con esos datos.",
        );
        return;
      }

      setOrder(result);
      saveLastOrder(result);
    } catch (err) {
      console.error(err);
      setError(
        isEnglish
          ? "Error searching for the order. Try again."
          : "Error buscando la orden. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshOrder() {
    if (!order?.id) return;

    try {
      setLoading(true);
      await loadOrderById(order.id);
    } catch (err) {
      console.error(err);
      setError(
        isEnglish
          ? "Could not refresh your order."
          : "No se pudo actualizar tu orden.",
      );
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = order
    ? translatedStatusSteps.findIndex((step) => step.key === order.status)
    : -1;

  const isCancelled = order?.status === "cancelled";

  if (!settings.tracking_page_enabled) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-3xl">
          <a
            href="/"
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEnglish ? "Back to menu" : "Volver al menú"}
          </a>

          <div className="rounded-[2rem] border border-orange-500/25 bg-zinc-950 p-8 text-center shadow-2xl shadow-orange-950/20">
            <p className="mx-auto mb-4 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              {isEnglish ? "Tracking paused" : "Tracking pausado"}
            </p>
            <h1 className="text-4xl font-black sm:text-5xl">
              {isEnglish ? "Order tracking is temporarily unavailable" : "El seguimiento está temporalmente desactivado"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-white/55 sm:text-base">
              {isEnglish
                ? "Please contact the food truck directly and we will help you with your order status."
                : "Por favor contacta directamente al food truck y te ayudamos con el estado de tu pedido."}
            </p>
            <a
              href={buildWhatsAppUrl(settings.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex rounded-full bg-orange-600 px-7 py-4 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
            >
              WhatsApp: {settings.whatsapp}
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <section className="mx-auto max-w-4xl">
        <a
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglish ? "Back to menu" : "Volver al menú"}
        </a>

        <div className="rounded-[2rem] border border-orange-500/25 bg-zinc-950 p-6 shadow-2xl shadow-orange-950/20 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300">
                {isEnglish ? "Live tracking" : "Seguimiento en vivo"}
              </p>

              <h1 className="text-4xl font-black sm:text-5xl">
                {isEnglish ? (
                  <>
                    My <span className="text-orange-500">Order</span>
                  </>
                ) : (
                  <>
                    Mi <span className="text-orange-500">Pedido</span>
                  </>
                )}
              </h1>

              <p className="mt-2 text-sm font-semibold text-zinc-400 sm:text-base">
                {isEnglish
                  ? "Check your order status using your order number or phone."
                  : "Consulta el estado con tu número de orden o teléfono."}
              </p>

              <p
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                  businessStatus.isOpen
                    ? "border-green-500/30 bg-green-500/10 text-green-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200"
                }`}
              >
                {businessStatus.label} · {businessStatus.todayLabel}
              </p>
            </div>

            {order && (
              <button
                onClick={refreshOrder}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-black transition hover:bg-white/[0.10] disabled:opacity-60"
                type="button"
              >
                <RefreshCw className="h-5 w-5" />
                {isEnglish ? "Refresh" : "Actualizar"}
              </button>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder={
                isEnglish
                  ? "Order number or phone"
                  : "Número de orden o teléfono"
              }
              className="min-h-16 flex-1 rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 text-lg font-bold outline-none transition placeholder:text-white/35 focus:border-orange-500/70"
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 text-lg font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 disabled:opacity-60"
              type="button"
            >
              <Search className="h-6 w-6" />
              {loading
                ? isEnglish
                  ? "Searching..."
                  : "Buscando..."
                : isEnglish
                  ? "Search"
                  : "Buscar"}
            </button>
          </div>

          {autoLoading && (
            <p className="mt-4 text-sm font-bold text-white/40">
              {isEnglish
                ? "Checking for recent orders..."
                : "Revisando si tienes un pedido reciente..."}
            </p>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {order && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/45 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white/45">
                    {isEnglish ? "Order" : "Orden"}
                  </p>
                  <h2 className="text-4xl font-black text-orange-400">
                    #{order.order_number}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-white/45">
                    {order.customer?.name ??
                      (isEnglish ? "Customer" : "Cliente")}{" "}
                    · {formatTime(order.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 px-5 py-4 sm:text-right">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-300">
                    {isEnglish ? "Current status" : "Estado actual"}
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {getStatusLabel(order.status, isEnglish)}
                  </p>
                </div>
              </div>

              {isCancelled ? (
                <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-300" />
                    <div>
                      <p className="text-xl font-black text-red-200">
                        {isEnglish ? "Order cancelled" : "Pedido cancelado"}
                      </p>
                      <p className="text-sm font-bold text-red-200/70">
                        {isEnglish
                          ? "Contact the food truck if you have any questions."
                          : "Contacta al food truck si tienes dudas."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-3">
                  {translatedStatusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const active = index <= currentStepIndex;
                    const current = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                          active
                            ? "border-orange-500/45 bg-orange-500/10"
                            : "border-white/10 bg-white/[0.04]"
                        }`}
                      >
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                            active
                              ? "bg-orange-600 text-white"
                              : "bg-zinc-800 text-zinc-500"
                          } ${current ? "shadow-lg shadow-orange-500/30" : ""}`}
                        >
                          {active ? (
                            <CheckCircle2 className="h-7 w-7" />
                          ) : (
                            <Icon className="h-7 w-7" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-black text-white">
                            {step.label}
                          </p>
                          <p className="text-sm font-semibold text-white/45">
                            {current
                              ? isEnglish
                                ? "Current status"
                                : "Estado actual"
                              : active
                                ? isEnglish
                                  ? "Completed"
                                  : "Completado"
                                : step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xl font-black">
                  {isEnglish ? "Order details" : "Detalle del pedido"}
                </h3>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <div>
                        <p className="font-black">
                          {item.quantity}x {item.product_name}
                        </p>

                        {item.notes && item.notes !== item.product_name && (
                          <p className="mt-1 text-sm font-semibold text-white/45">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <p className="font-black text-orange-300">
                        {formatMoney(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <p className="text-lg font-black text-white/60">
                    {isEnglish ? "Total" : "Total"}
                  </p>
                  <p className="text-3xl font-black text-orange-400">
                    {formatMoney(order.total)}
                  </p>
                </div>

                <p className="mt-4 text-center text-xs font-bold text-white/35">
                  {isEnglish
                    ? "This information updates automatically when the food truck changes the order status."
                    : "Esta información se actualiza automáticamente cuando el food truck cambia el estado."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
