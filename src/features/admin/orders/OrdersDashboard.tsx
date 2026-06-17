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
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { useRealtimeOrders } from "./useRealtimeOrders";
import { useOrderAlerts } from "./useOrderAlerts";
import type { AdminOrder, OrderStatus } from "./admin-orders.types";
import { printOrderTicket } from "../printing/ticket-printing";

function playUiSound(src: string, volume = 0.6) {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    void audio.play();
  } catch (error) {
    console.warn("No se pudo reproducir el sonido:", error);
  }
}

type OrderFilter = "active" | "all" | OrderStatus;
type DateFilter = "today" | "yesterday" | "7d" | "30d" | "all";

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

const dateFilterOptions: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Todo" },
];

function isSameLocalDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function matchesDateFilter(order: AdminOrder, filter: DateFilter) {
  if (filter === "all") return true;

  const createdAt = new Date(order.created_at);
  const now = new Date();

  if (filter === "today") {
    return isSameLocalDay(createdAt, now);
  }

  if (filter === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return isSameLocalDay(createdAt, yesterday);
  }

  const days = filter === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return createdAt.getTime() >= start.getTime();
}

function sortByNewest(a: AdminOrder, b: AdminOrder) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

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
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
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
  if (minutes >= 3)
    return "border-yellow-500/50 bg-yellow-500/15 text-yellow-200";

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

function EmptyColumn({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm font-bold text-white/35">
      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
  const isTerminalStatus = order.status === "delivered" || order.status === "cancelled";

  const handleStatus = async (status: OrderStatus) => {
    if (status === "cancelled") {
      const confirmed = window.confirm(
        `¿Seguro que quieres cancelar la orden #${order.order_number}?`,
      );

      if (!confirmed) return;
    }

    try {
      setUpdating(true);
      await onChangeStatus(order.id, status);

      if (status === "ready") {
        playUiSound("/sounds/Pedido_listo.mp3", 0.65);
      }
    } catch (error) {
      console.error("Error al cambiar estado de orden:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la orden. Intenta actualizar la página.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintCustomerTicket = () => {
    printOrderTicket({
      order,
      type: "customer",
      language: "es",
    });
  };

  const handlePrintKitchenTicket = () => {
    printOrderTicket({
      order,
      type: "kitchen",
      language: "es",
    });
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
      className={`max-w-[470px] rounded-3xl border shadow-2xl transition-all duration-500 ${
        isKitchenMode ? "p-4" : "p-5"
      } ${getUrgencyClasses(order)}`}
    >
      {isExtremeLate && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-400/50 bg-red-500/20 px-3 py-2 text-xs font-black text-red-100">
          <AlertTriangle className="h-5 w-5" />
          Alerta: orden sin atender por más de 10 minutos
        </div>
      )}

      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={`${
                isKitchenMode ? "text-3xl" : "text-2xl"
              } font-black text-white`}
            >
              Orden #{order.order_number}
            </h2>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${getMinutePillClasses(
                    order,
                  )}`}
                >
                  <Clock className="h-4 w-4" />
                  {minutesAgo < 1 ? "0 MIN" : `${minutesAgo} MIN`}
                </span>

                <span className={`text-sm font-bold ${getUrgencyBadge(order)}`}>
                  {getTimeAgoLabel(order.created_at)}
                </span>

                <span className="text-sm text-orange-200">
                  · {formatTime(order.created_at)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-black text-white">
                {order.customer?.name ?? "Cliente"}
              </p>

              {order.customer?.phone && (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-sm font-bold text-orange-300 hover:text-orange-200"
                >
                  {order.customer.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-white/50">Total</p>

          <p
            className={`${
              isKitchenMode ? "text-4xl" : "text-2xl"
            } font-black text-orange-400`}
          >
            {formatMoney(order.total)}
          </p>

          <div className="mt-2 flex flex-col items-start gap-2 sm:items-end">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
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

      <div className="mt-3 space-y-2">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5"
          >
            <div>
              <p
                className={`${
                  isKitchenMode ? "text-xl" : "text-base"
                } font-bold text-white`}
              >
                {item.quantity}x {item.product_name}
              </p>

              {item.notes && item.notes !== item.product_name && (
                <p className="text-xs text-white/50">{item.notes}</p>
              )}
            </div>

            <p className="font-bold text-white/80">
              {formatMoney(item.total_price)}
            </p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-300">
            Notas importantes
          </p>

          <p className="mt-1 text-sm font-bold text-white/90">{order.notes}</p>
        </div>
      )}

      {!isTerminalStatus && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            disabled={updating}
            onClick={() => handleStatus("preparing")}
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-2 py-2 text-xs font-bold text-yellow-100 transition hover:bg-yellow-500/20 disabled:opacity-50"
          >
            <ChefHat className="mx-auto mb-0.5 h-4 w-4" />
            Preparar
          </button>

          <button
            disabled={updating}
            onClick={() => handleStatus("ready")}
            className="rounded-2xl border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm font-bold text-green-100 transition hover:bg-green-500/20 disabled:opacity-50"
          >
            <PackageCheck className="mx-auto mb-1 h-5 w-5" />
            Listo
          </button>

          <button
            disabled={updating}
            onClick={() => handleStatus("delivered")}
            className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-3 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50"
          >
            <Truck className="mx-auto mb-1 h-5 w-5" />
            Entregado
          </button>

          <button
            disabled={updating}
            onClick={() => handleStatus("cancelled")}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <XCircle className="mx-auto mb-1 h-5 w-5" />
            Cancelar
          </button>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handlePrintCustomerTicket}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 shadow-lg shadow-red-500/10 transition hover:border-red-400/60 hover:bg-red-500/20 hover:shadow-red-500/20"
        >
          <Printer className="h-5 w-5" />
          Imprimir cliente
        </button>

        <button
          type="button"
          onClick={handlePrintKitchenTicket}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 shadow-lg shadow-red-500/10 transition hover:border-red-400/60 hover:bg-red-500/20 hover:shadow-red-500/20"
        >
          <ChefHat className="h-5 w-5" />
          Imprimir cocina
        </button>
      </div>

      {whatsAppLink && (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-black text-green-100 transition hover:bg-green-500/20"
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
  const { soundEnabled, enableSound } = useOrderAlerts(orders);

  const [filter, setFilter] = React.useState<OrderFilter>("active");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("30d");
  const [nowTick, setNowTick] = React.useState(0);
  const [kitchenTab, setKitchenTab] = React.useState<
    "received" | "preparing" | "ready"
  >("received");

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick((value) => value + 1);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const isKitchenMode = window.location.search.includes("kitchen=true");

  const pendingOrders = orders.filter((order) => order.status === "received");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  );
  const readyOrders = orders.filter((order) => order.status === "ready");

  const filteredOrders = orders
    .filter((order) => {
      if (filter === "active") {
        return order.status !== "delivered" && order.status !== "cancelled";
      }

      if (filter === "all") return true;

      return order.status === filter;
    })
    .filter((order) => matchesDateFilter(order, dateFilter))
    .filter((order) => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) return true;

      const orderNumber = order.order_number.toLowerCase();
      const customerName = order.customer?.name?.toLowerCase() ?? "";
      const customerPhone = order.customer?.phone?.toLowerCase() ?? "";
      const normalizedPhone = normalizePhone(order.customer?.phone);
      const itemNames = order.items
        .map((item) => `${item.product_name} ${item.notes ?? ""}`.toLowerCase())
        .join(" ");

      return (
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        normalizedPhone.includes(query.replace(/\D/g, "")) ||
        itemNames.includes(query)
      );
    })
    .sort(filter === "active" ? sortByKitchenPriority : sortByNewest);

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

  const showColumns = filter === "active" && !searchTerm.trim();

  return (
    <main
      className={`bg-[#050505] px-4 text-white ${
        isKitchenMode
          ? "h-[100dvh] overflow-hidden py-3 sm:px-4 lg:px-6"
          : "min-h-screen py-6 sm:px-6 lg:px-10"
      }`}
    >
      <section
        className={`mx-auto ${
          isKitchenMode
            ? "flex h-full max-w-[2400px] flex-col overflow-hidden"
            : "max-w-7xl"
        }`}
      >
        <div
          className={`flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between ${
            isKitchenMode ? "mb-4 shrink-0" : "mb-6"
          }`}
        >
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                <Clock className="h-4 w-4" />
                Panel en tiempo real
              </div>

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
                isKitchenMode ? "text-3xl lg:text-4xl" : "text-3xl sm:text-4xl"
              } font-black`}
            >
              Órdenes <span className="text-red-500">Velasquez</span>
            </h1>

            {!isKitchenMode && (
              <p className="mt-1 text-sm text-white/60">
                Administra pedidos recibidos, preparación, listos y entregados.
              </p>
            )}
            {!isKitchenMode && (
              <a
                href="/admin"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-white/45 transition hover:border-orange-500/30 hover:border-orange-500/20 hover:text-orange-200"
              >
                ← Volver al Portal
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={enableSound}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black text-white shadow-lg transition ${
                soundEnabled
                  ? "bg-green-600 shadow-green-600/20"
                  : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-500"
              }`}
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
            >
              <Maximize className="h-5 w-5" />
              Pantalla Completa
            </button>

            <button
              onClick={reload}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
            >
              <RefreshCw className="h-5 w-5" />
              Actualizar
            </button>
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
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {dateFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${
                      dateFilter === option.value
                        ? "border-red-500 bg-red-500/20 text-red-100"
                        : "border-white/10 bg-black/20 text-white/55 hover:bg-white/10 hover:text-white"
                    }`}
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
                  placeholder="Buscar orden, cliente, teléfono o producto..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-red-500/60"
                />
              </div>
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

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />

            <h2 className="text-xl font-black">No hay órdenes para mostrar</h2>

            <p className="mt-1 text-white/60">
              Cambia el filtro o espera una nueva orden.
            </p>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && showColumns && (
          <>
            {isKitchenMode ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mb-1.5 grid shrink-0 grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/[0.015] p-1">
                  {(["received", "preparing", "ready"] as const).map(
                    (status) => {
                      const config = columnConfig[status];
                      const count =
                        status === "received"
                          ? pendingOrders.length
                          : status === "preparing"
                            ? preparingOrders.length
                            : readyOrders.length;

                      const isActive = kitchenTab === status;

                      return (
                        <button
                          key={status}
                          onClick={() => setKitchenTab(status)}
                          className={`rounded-md border px-2 py-1 text-left transition ${
                            isActive
                              ? `${config.wrapper} border-current shadow-lg`
                              : "border-white/10 bg-black/30 text-white/45 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-lg font-black">
                              {config.label}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-sm font-black ${
                                isActive
                                  ? config.badge
                                  : "bg-white/10 text-white/60"
                              }`}
                            >
                              {count}
                            </span>
                          </div>

                          <p className="mt-px text-[9px] font-bold leading-none text-white/20">
                            {config.description}
                          </p>
                        </button>
                      );
                    },
                  )}
                </div>

                {(() => {
                  const config = columnConfig[kitchenTab];
                  const tabOrders = filteredOrders.filter(
                    (order) => order.status === kitchenTab,
                  );

                  return (
                    <section
                      className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border p-4 ${config.wrapper}`}
                    >
                      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-black leading-none">
                            {config.label}
                          </h2>
                          <p className="text-xs font-bold text-white/35">
                            {config.description}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-0.5 text-sm font-black ${config.badge}`}
                        >
                          {tabOrders.length}
                        </span>
                      </div>

                      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {tabOrders.length === 0 ? (
                          <div className="col-span-2">
                            <EmptyColumn message={config.empty} />
                          </div>
                        ) : (
                          tabOrders.map((order) => (
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
                })()}
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-3">
                {(["received", "preparing", "ready"] as const).map((status) => {
                  const columnOrders = filteredOrders.filter(
                    (order) => order.status === status,
                  );

                  const config = columnConfig[status];

                  return (
                    <section
                      key={status}
                      className={`rounded-3xl border p-4 ${config.wrapper}`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-black">{config.label}</h2>
                          <p className="text-xs font-bold text-white/35">
                            {config.description}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-black ${config.badge}`}
                        >
                          {columnOrders.length}
                        </span>
                      </div>

                      <div className="space-y-5">
                        {columnOrders.length === 0 ? (
                          <EmptyColumn message={config.empty} />
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
          </>
        )}

        {!loading && !error && filteredOrders.length > 0 && !showColumns && (
          <div
            className={`grid gap-5 ${
              isKitchenMode
                ? "min-h-0 flex-1 overflow-y-auto pr-2 xl:grid-cols-3"
                : "lg:grid-cols-2"
            }`}
          >
            {filteredOrders.map((order) => (
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
    </main>
  );
}
