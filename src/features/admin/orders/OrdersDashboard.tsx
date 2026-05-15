// 📍 Ruta: src/features/admin/orders/OrdersDashboard.tsx

import React from "react";
import AdminTopbar from "../components/AdminTopbar";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ChefHat,
  Clock,
  CreditCard,
  DollarSign,
  Expand,
  Maximize,
  MessageCircle,
  Minimize,
  MonitorUp,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { useRealtimeOrders } from "./useRealtimeOrders";
import { useOrderAlerts } from "./useOrderAlerts";
import type { AdminOrder, OrderStatus } from "./admin-orders.types";

type OrderFilter = "active" | "all" | OrderStatus;

const statusLabels: Record<OrderStatus, string> = {
  received: "Recibido",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusClasses: Record<OrderStatus, string> = {
  received: "border-orange-500/40 bg-orange-500/10 text-orange-200",
  preparing: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  ready: "border-green-500/40 bg-green-500/10 text-green-200",
  delivered: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-200",
};

const filterOptions: { value: OrderFilter; label: string }[] = [
  { value: "active", label: "Activas" },
  { value: "all", label: "Todas" },
  { value: "received", label: "Recibidas" },
  { value: "preparing", label: "Preparando" },
  { value: "ready", label: "Listas" },
  { value: "delivered", label: "Entregadas" },
  { value: "cancelled", label: "Canceladas" },
];

const columnConfig: Record<
  "received" | "preparing" | "ready",
  {
    label: string;
    description: string;
    wrapper: string;
    badge: string;
    empty: string;
  }
> = {
  received: {
    label: "Nuevas",
    description: "Pedidos recién recibidos",
    wrapper: "border-orange-500/20 bg-orange-500/[0.03] text-orange-200",
    badge: "bg-orange-500/20 text-orange-100",
    empty: "No hay pedidos nuevos.",
  },
  preparing: {
    label: "Preparando",
    description: "Pedidos en cocina",
    wrapper: "border-yellow-500/20 bg-yellow-500/[0.03] text-yellow-200",
    badge: "bg-yellow-500/20 text-yellow-100",
    empty: "Nada en preparación.",
  },
  ready: {
    label: "Listas",
    description: "Pedidos para entregar",
    wrapper: "border-green-500/20 bg-green-500/[0.03] text-green-200",
    badge: "bg-green-500/20 text-green-100",
    empty: "No hay órdenes listas.",
  },
};

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

function getMinutesAgo(value: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  );
}

function getTimeAgoLabel(value: string) {
  const minutes = getMinutesAgo(value);

  if (minutes < 1) return "Ahora mismo";
  if (minutes === 1) return "Hace 1 min";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "Hace 1 hora";

  return `Hace ${hours} horas`;
}

function getUrgencyClasses(order: AdminOrder) {
  if (order.status !== "received") {
    return "border-white/10 bg-white/[0.04] shadow-orange-950/20";
  }

  const minutes = getMinutesAgo(order.created_at);

  if (minutes >= 10) {
    return "border-red-400 bg-red-500/[0.14] shadow-red-500/40 animate-pulse";
  }

  if (minutes >= 6) {
    return "border-red-500 bg-red-500/[0.10] shadow-red-500/30 animate-pulse";
  }

  if (minutes >= 3) {
    return "border-yellow-500 bg-yellow-500/[0.10] shadow-yellow-500/30 animate-pulse";
  }

  return "border-orange-500 bg-orange-500/[0.08] shadow-orange-500/25 animate-pulse";
}

function getUrgencyBadge(order: AdminOrder) {
  if (order.status !== "received") return "text-white/60";

  const minutes = getMinutesAgo(order.created_at);

  if (minutes >= 10) return "text-red-200";
  if (minutes >= 6) return "text-red-300";
  if (minutes >= 3) return "text-yellow-300";

  return "text-orange-300";
}

function getMinutePillClasses(order: AdminOrder) {
  if (order.status !== "received") {
    return "border-white/10 bg-white/5 text-white/60";
  }

  const minutes = getMinutesAgo(order.created_at);

  if (minutes >= 10) return "border-red-400/60 bg-red-500/20 text-red-100";
  if (minutes >= 6) return "border-red-500/50 bg-red-500/15 text-red-200";
  if (minutes >= 3) return "border-yellow-500/50 bg-yellow-500/15 text-yellow-200";

  return "border-orange-500/50 bg-orange-500/15 text-orange-200";
}

function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

function getWhatsAppLink(order: AdminOrder) {
  const phone = normalizePhone(order.customer?.phone);

  if (!phone) return "";

  const message = `Hola ${order.customer?.name ?? ""}!

Tu orden #${order.order_number} ya esta lista para entregar en Velasquez Food Truck.

Gracias por tu preferencia.`;

  return `https://wa.me/1${phone}?text=${encodeURIComponent(message)}`;
}

function sortByKitchenPriority(a: AdminOrder, b: AdminOrder) {
  const statusPriority: Record<OrderStatus, number> = {
    received: 1,
    preparing: 2,
    ready: 3,
    delivered: 4,
    cancelled: 5,
  };

  const priorityDiff = statusPriority[a.status] - statusPriority[b.status];

  if (priorityDiff !== 0) return priorityDiff;

  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function EmptyColumn({
  message,
  isKitchenMode = false,
}: {
  message: string;
  isKitchenMode?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-white/10 bg-black/20 text-center font-bold text-white/35 ${
        isKitchenMode ? "p-10 text-lg" : "p-6 text-sm"
      }`}
    >
      <CheckCircle2
        className={`mx-auto mb-2 opacity-50 ${
          isKitchenMode ? "h-12 w-12" : "h-8 w-8"
        }`}
      />
      {message}
    </div>
  );
}

function OrderCard({
  order,
  isKitchenMode,
  onChangeStatus,
}: {
  order: AdminOrder;
  isKitchenMode: boolean;
  onChangeStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = React.useState(false);
  const minutesAgo = getMinutesAgo(order.created_at);
  const isExtremeLate = order.status === "received" && minutesAgo >= 10;
  const whatsAppLink = getWhatsAppLink(order);

  const handleStatus = async (status: OrderStatus) => {
    if (status === "cancelled") {
      const confirmed = window.confirm(
        `¿Seguro que quieres cancelar la orden #${order.order_number}?`
      );

      if (!confirmed) return;
    }

    try {
      setUpdating(true);
      await onChangeStatus(order.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: isExtremeLate ? [0, -4, 4, -3, 3, 0] : 0,
      }}
      transition={{
        layout: { duration: 0.25 },
        x: isExtremeLate
          ? { duration: 0.55, repeat: Infinity, repeatDelay: 7 }
          : undefined,
      }}
      className={`rounded-3xl border shadow-2xl transition-all duration-500 ${
        isKitchenMode ? "p-7" : "p-5"
      } ${getUrgencyClasses(order)}`}
    >
      {isExtremeLate && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-2xl border border-red-400/50 bg-red-500/20 px-4 py-3 font-black text-red-100 ${
            isKitchenMode ? "text-lg" : "text-sm"
          }`}
        >
          <AlertTriangle className={isKitchenMode ? "h-7 w-7" : "h-5 w-5"} />
          Alerta: orden sin atender por más de 10 minutos
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={`${
                isKitchenMode ? "text-5xl leading-none" : "text-2xl"
              } font-black text-white`}
            >
              Orden #{order.order_number}
            </h2>

            <span
              className={`rounded-full border px-3 py-1 font-bold ${
                isKitchenMode ? "text-sm" : "text-xs"
              } ${statusClasses[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-black ${getMinutePillClasses(
                order
              )} ${isKitchenMode ? "text-lg" : "text-xs"}`}
            >
              <Clock className={isKitchenMode ? "h-5 w-5" : "h-4 w-4"} />
              {minutesAgo < 1 ? "0 MIN" : `${minutesAgo} MIN`}
            </span>

            <span
              className={`font-bold ${getUrgencyBadge(order)} ${
                isKitchenMode ? "text-lg" : "text-sm"
              }`}
            >
              {getTimeAgoLabel(order.created_at)}
            </span>

            <span className={isKitchenMode ? "text-base text-white/45" : "text-sm text-white/45"}>
              · {formatTime(order.created_at)}
            </span>
          </div>

          <p
            className={`mt-3 text-white/70 ${
              isKitchenMode ? "text-xl font-black" : "text-sm"
            }`}
          >
            {order.customer?.name ?? "Cliente sin nombre"}
          </p>

          {order.customer?.phone && (
            <a
              href={`tel:${order.customer.phone}`}
              className={`mt-1 inline-block font-semibold text-orange-300 hover:text-orange-200 ${
                isKitchenMode ? "text-xl" : "text-sm"
              }`}
            >
              {order.customer.phone}
            </a>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-white/50">Total</p>

          <p
            className={`${
              isKitchenMode ? "text-5xl" : "text-2xl"
            } font-black text-orange-400`}
          >
            {formatMoney(order.total)}
          </p>

          <div className="mt-2 flex flex-col items-start gap-2 sm:items-end">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-black ${
                isKitchenMode ? "text-sm" : "text-xs"
              } ${
                order.payment_method === "card"
                  ? "border-orange-500/50 bg-orange-500/15 text-orange-200"
                  : "border-green-500/50 bg-green-500/15 text-green-200"
              }`}
            >
              {order.payment_method === "card" ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  Tarjeta
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Efectivo
                </>
              )}
            </div>

            {order.payment_method === "card" && order.fee_amount > 0 && (
              <p className="text-xs font-bold text-orange-300">
                Cargo: {formatMoney(order.fee_amount)}
              </p>
            )}

            <p className="text-xs text-white/50">
              Pago: {order.payment_status}
            </p>
          </div>
        </div>
      </div>

      <div className={isKitchenMode ? "mt-5 space-y-4" : "mt-4 space-y-3"}>
        {order.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 ${
              isKitchenMode ? "p-5" : "p-3"
            }`}
          >
            <div>
              <p
                className={`${
                  isKitchenMode ? "text-3xl" : "text-base"
                } font-bold text-white`}
              >
                {item.quantity}x {item.product_name}
              </p>

              {item.notes && item.notes !== item.product_name && (
                <p className={isKitchenMode ? "mt-2 text-lg text-white/55" : "text-xs text-white/50"}>
                  {item.notes}
                </p>
              )}
            </div>

            <p className={isKitchenMode ? "text-2xl font-black text-white/85" : "font-bold text-white/80"}>
              {formatMoney(item.total_price)}
            </p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div
          className={`mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 ${
            isKitchenMode ? "p-5" : "p-3"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-orange-300">
            Notas importantes
          </p>

          <p
            className={`mt-1 font-bold text-white/90 ${
              isKitchenMode ? "text-xl" : "text-sm"
            }`}
          >
            {order.notes}
          </p>
        </div>
      )}

      <div className={`mt-5 grid gap-2 ${isKitchenMode ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        <button
          disabled={updating}
          onClick={() => handleStatus("preparing")}
          className={`rounded-2xl border border-yellow-500/30 bg-yellow-500/10 font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-50 ${
            isKitchenMode ? "px-4 py-5 text-lg" : "px-3 py-3 text-sm"
          }`}
        >
          <ChefHat className={`mx-auto mb-1 ${isKitchenMode ? "h-7 w-7" : "h-5 w-5"}`} />
          Preparar
        </button>

        <button
          disabled={updating}
          onClick={() => handleStatus("ready")}
          className={`rounded-2xl border border-green-500/30 bg-green-500/10 font-bold text-green-100 transition hover:bg-green-500/20 disabled:opacity-50 ${
            isKitchenMode ? "px-4 py-5 text-lg" : "px-3 py-3 text-sm"
          }`}
        >
          <PackageCheck className={`mx-auto mb-1 ${isKitchenMode ? "h-7 w-7" : "h-5 w-5"}`} />
          Listo
        </button>

        <button
          disabled={updating}
          onClick={() => handleStatus("delivered")}
          className={`rounded-2xl border border-blue-500/30 bg-blue-500/10 font-bold text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50 ${
            isKitchenMode ? "px-4 py-5 text-lg" : "px-3 py-3 text-sm"
          }`}
        >
          <Truck className={`mx-auto mb-1 ${isKitchenMode ? "h-7 w-7" : "h-5 w-5"}`} />
          Entregado
        </button>

        <button
          disabled={updating}
          onClick={() => handleStatus("cancelled")}
          className={`rounded-2xl border border-red-500/30 bg-red-500/10 font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-50 ${
            isKitchenMode ? "px-4 py-5 text-lg" : "px-3 py-3 text-sm"
          }`}
        >
          <XCircle className={`mx-auto mb-1 ${isKitchenMode ? "h-7 w-7" : "h-5 w-5"}`} />
          Cancelar
        </button>
      </div>

      {whatsAppLink && !isKitchenMode && (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-black text-green-100 transition hover:bg-green-500/20"
        >
          <MessageCircle className="h-5 w-5" />
          Avisar por WhatsApp
        </a>
      )}
    </motion.article>
  );
}

export default function OrdersDashboard() {
  const { orders, loading, error, reload, changeStatus } = useRealtimeOrders();
  const { soundEnabled, enableSound, disableSound } = useOrderAlerts(orders);

  const [filter, setFilter] = React.useState<OrderFilter>("active");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [nowTick, setNowTick] = React.useState(0);
  const [showSoundWarning, setShowSoundWarning] = React.useState(false);

  const isKitchenMode = window.location.search.includes("kitchen=true");

  const wakeLockRef = React.useRef<any>(null);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick((value) => value + 1);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!isKitchenMode) return;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake lock no disponible:", err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockRef.current?.release?.();
      wakeLockRef.current = null;
    };
  }, [isKitchenMode]);

  const pendingOrders = orders.filter((order) => order.status === "received");
  const preparingOrders = orders.filter((order) => order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready");
  const activeOrders = orders
    .filter((order) => order.status !== "delivered" && order.status !== "cancelled")
    .sort(sortByKitchenPriority);

  const filteredOrders = orders
    .filter((order) => {
      if (filter === "active") {
        return order.status !== "delivered" && order.status !== "cancelled";
      }

      if (filter === "all") return true;

      return order.status === filter;
    })
    .filter((order) => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) return true;

      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.phone?.toLowerCase().includes(query)
      );
    })
    .sort(sortByKitchenPriority);

  const visibleOrders = isKitchenMode ? activeOrders : filteredOrders;

  const toggleKitchenMode = () => {
    if (isKitchenMode) {
      window.history.pushState({}, "", "/admin/orders");
      window.location.reload();
    } else {
      window.history.pushState({}, "", "/admin/orders?kitchen=true");
      window.location.reload();
    }
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("No se pudo activar pantalla completa:", err);
    }
  };

  const showColumns = isKitchenMode || (filter === "active" && !searchTerm.trim());

  return (
    <>
      {!isKitchenMode && <AdminTopbar />}

      <main
        className={`min-h-screen bg-[#050505] text-white ${
          isKitchenMode ? "px-4 py-4 sm:px-6 lg:px-8" : "px-4 py-6 sm:px-6 lg:px-10"
        }`}
      >
        <section
          className={isKitchenMode ? "mx-auto max-w-[2400px]" : "mx-auto max-w-7xl"}
        >
          <div
            className={`mb-6 rounded-3xl border border-white/10 bg-white/[0.04] ${
              isKitchenMode ? "p-6" : "p-5"
            }`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                    <Clock className="h-4 w-4" />
                    Panel en tiempo real
                  </div>

                  {isKitchenMode && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-200">
                      <MonitorUp className="h-4 w-4" />
                      Cocina PRO
                    </div>
                  )}

                  {pendingOrders.length > 0 && (
                    <div className="inline-flex animate-pulse items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200">
                      <Bell className="h-4 w-4" />
                      {pendingOrders.length} pendiente
                      {pendingOrders.length === 1 ? "" : "s"}
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-200">
                    <ChefHat className="h-4 w-4" />
                    {preparingOrders.length} preparando
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black text-green-200">
                    <PackageCheck className="h-4 w-4" />
                    {readyOrders.length} listas
                  </div>
                </div>

                <h1
                  className={`${
                    isKitchenMode ? "text-5xl lg:text-6xl" : "text-3xl sm:text-4xl"
                  } font-black`}
                >
                  Órdenes <span className="text-orange-500">Velasquez</span>
                </h1>

                <p className={`${isKitchenMode ? "mt-2 text-lg" : "mt-1 text-sm"} text-white/60`}>
                  {isKitchenMode
                    ? "Vista grande para cocina: nuevas, en preparación y listas."
                    : "Administra pedidos recibidos, preparación, listos y entregados."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (soundEnabled) {
                      setShowSoundWarning(true);
                    } else {
                      enableSound();
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black text-white shadow-lg transition ${
                    soundEnabled
                      ? "bg-green-600 shadow-green-600/20"
                      : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-500"
                  }`}
                  type="button"
                >
                  {soundEnabled ? (
                    <>
                      <Bell className="h-5 w-5" />
                      Sonido Activado
                    </>
                  ) : (
                    <>
                      <BellOff className="h-5 w-5" />
                      Activar Sonido
                    </>
                  )}
                </button>

                <button
                  onClick={toggleKitchenMode}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black text-white shadow-lg transition hover:bg-white/[0.10]"
                  type="button"
                >
                  {isKitchenMode ? (
                    <>
                      <Minimize className="h-5 w-5" />
                      Modo Normal
                    </>
                  ) : (
                    <>
                      <Expand className="h-5 w-5" />
                      Modo Cocina
                    </>
                  )}
                </button>

                <button
                  onClick={enterFullscreen}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black text-white shadow-lg transition hover:bg-white/[0.10]"
                  type="button"
                >
                  <Maximize className="h-5 w-5" />
                  Pantalla Completa
                </button>

                <button
                  onClick={reload}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
                  type="button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          {!isKitchenMode && (
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                        filter === option.value
                          ? "border-orange-500 bg-orange-500/20 text-orange-100"
                          : "border-white/10 bg-black/20 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar orden, cliente o teléfono..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/60"
                  />
                </div>
              </div>
            </div>
          )}

          {isKitchenMode && (
            <div className="mb-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-orange-500/25 bg-orange-500/[0.06] p-5">
                <p className="text-sm font-black uppercase tracking-wide text-orange-300">
                  Nuevas
                </p>
                <p className="mt-2 text-5xl font-black text-white">
                  {pendingOrders.length}
                </p>
              </div>

              <div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/[0.06] p-5">
                <p className="text-sm font-black uppercase tracking-wide text-yellow-300">
                  En cocina
                </p>
                <p className="mt-2 text-5xl font-black text-white">
                  {preparingOrders.length}
                </p>
              </div>

              <div className="rounded-3xl border border-green-500/25 bg-green-500/[0.06] p-5">
                <p className="text-sm font-black uppercase tracking-wide text-green-300">
                  Listas
                </p>
                <p className="mt-2 text-5xl font-black text-white">
                  {readyOrders.length}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/70">
              Cargando órdenes...
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && visibleOrders.length === 0 && (
            <div
              className={`rounded-3xl border border-white/10 bg-white/[0.04] text-center ${
                isKitchenMode ? "p-14" : "p-8"
              }`}
            >
              <CheckCircle2
                className={`mx-auto mb-3 text-green-400 ${
                  isKitchenMode ? "h-16 w-16" : "h-10 w-10"
                }`}
              />

              <h2 className={isKitchenMode ? "text-4xl font-black" : "text-xl font-black"}>
                No hay órdenes para mostrar
              </h2>

              <p className={isKitchenMode ? "mt-3 text-xl text-white/60" : "mt-1 text-white/60"}>
                {isKitchenMode
                  ? "La cocina está libre por ahora."
                  : "Cambia el filtro o espera una nueva orden."}
              </p>
            </div>
          )}

          {!loading && !error && visibleOrders.length > 0 && showColumns && (
            <div
              className={`grid gap-5 ${
                isKitchenMode ? "2xl:grid-cols-3" : "xl:grid-cols-3"
              }`}
            >
              {(["received", "preparing", "ready"] as const).map((status) => {
                const columnOrders = visibleOrders.filter(
                  (order) => order.status === status
                );

                const config = columnConfig[status];

                return (
                  <section
                    key={status}
                    className={`rounded-3xl border ${
                      isKitchenMode ? "p-5" : "p-4"
                    } ${config.wrapper}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className={isKitchenMode ? "text-4xl font-black" : "text-xl font-black"}>
                          {config.label}
                        </h2>
                        <p className={isKitchenMode ? "text-base font-bold text-white/35" : "text-xs font-bold text-white/35"}>
                          {config.description}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 font-black ${config.badge} ${
                          isKitchenMode ? "text-2xl" : "text-sm"
                        }`}
                      >
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className={isKitchenMode ? "space-y-6" : "space-y-5"}>
                      {columnOrders.length === 0 ? (
                        <EmptyColumn message={config.empty} isKitchenMode={isKitchenMode} />
                      ) : (
                        columnOrders.map((order) => (
                          <OrderCard
                            key={`${order.id}-${nowTick}`}
                            order={order}
                            isKitchenMode={isKitchenMode}
                            onChangeStatus={changeStatus}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {!loading && !error && visibleOrders.length > 0 && !showColumns && (
            <div
              className={`grid gap-5 ${
                isKitchenMode ? "xl:grid-cols-3" : "lg:grid-cols-2"
              }`}
            >
              {visibleOrders.map((order) => (
                <OrderCard
                  key={`${order.id}-${nowTick}`}
                  order={order}
                  isKitchenMode={isKitchenMode}
                  onChangeStatus={changeStatus}
                />
              ))}
            </div>
          )}
        </section>

        {showSoundWarning && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#111] p-6 text-white shadow-2xl">
              <h2 className="text-2xl font-black text-red-100">
                Silenciar alertas
              </h2>

              <p className="mt-3 text-sm font-semibold text-white/60">
                Si desactivas el sonido, no escucharás alertas cuando lleguen nuevas órdenes.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowSoundWarning(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-black text-white transition hover:bg-white/10"
                  type="button"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    disableSound();
                    setShowSoundWarning(false);
                  }}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white transition hover:bg-red-500"
                  type="button"
                >
                  Sí, silenciar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}