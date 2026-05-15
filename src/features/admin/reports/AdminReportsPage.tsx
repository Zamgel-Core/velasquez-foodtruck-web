// 📍 Ruta: src/features/admin/reports/AdminReportsPage.tsx

import React from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  DollarSign,
  Package,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  getCashSessionOrders,
  getRecentCashSessions,
  getReportsSummary,
  getTopProducts,
  type CashRegisterReport,
  type ReportOrder,
  type ReportRange,
  type TopProductReport,
} from "./admin-reports.service";

const rangeOptions: { value: ReportRange; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "all", label: "Todo" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSessionExpectedCash(session: CashRegisterReport) {
  return Number(
    session.expected_cash ??
      Number(session.starting_cash || 0) + Number(session.cash_sales || 0)
  );
}

function getSessionDifference(session: CashRegisterReport) {
  if (session.cash_difference !== null && session.cash_difference !== undefined) {
    return Number(session.cash_difference || 0);
  }

  if (session.ending_cash === null || session.ending_cash === undefined) {
    return 0;
  }

  return Number(session.ending_cash || 0) - getSessionExpectedCash(session);
}

export default function AdminReportsPage() {
  const [range, setRange] = React.useState<ReportRange>("today");
  const [summary, setSummary] = React.useState({
    rangeLabel: "Hoy",
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    ordersCount: 0,
    cancelledCount: 0,
    averageTicket: 0,
    deliveredOrders: [] as ReportOrder[],
  });

  const [topProducts, setTopProducts] = React.useState<TopProductReport[]>([]);
  const [sessions, setSessions] = React.useState<CashRegisterReport[]>([]);
  const [selectedSession, setSelectedSession] =
    React.useState<CashRegisterReport | null>(null);
  const [selectedSessionOrders, setSelectedSessionOrders] = React.useState<
    ReportOrder[]
  >([]);

  const [loading, setLoading] = React.useState(true);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryData, productsData, sessionsData] = await Promise.all([
        getReportsSummary(range),
        getTopProducts(range),
        getRecentCashSessions(range),
      ]);

      setSummary(summaryData);
      setTopProducts(productsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function openSessionDetails(session: CashRegisterReport) {
    try {
      setSelectedSession(session);
      setDetailsLoading(true);

      const orders = await getCashSessionOrders(session.id);
      setSelectedSessionOrders(orders);
    } catch (err) {
      console.error(err);
      setSelectedSessionOrders([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  const topProduct = topProducts[0];
  const cashPercent =
    summary.totalSales > 0 ? (summary.cashSales / summary.totalSales) * 100 : 0;
  const cardPercent =
    summary.totalSales > 0 ? (summary.cardSales / summary.totalSales) * 100 : 0;

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </div>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Reportes <span className="text-orange-500">Velasquez</span>
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  Ventas, cortes, productos top y resumen operativo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRange(option.value)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                        range === option.value
                          ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-white/10 bg-black/20 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={loadReports}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/[0.10]"
                  type="button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/50">
              Cargando reportes...
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReportCard
                  icon={DollarSign}
                  label={`Ventas ${summary.rangeLabel}`}
                  value={formatMoney(summary.totalSales)}
                  tone="orange"
                />

                <ReportCard
                  icon={WalletCards}
                  label="Cash"
                  value={formatMoney(summary.cashSales)}
                  sub={`${cashPercent.toFixed(0)}% del total`}
                  tone="green"
                />

                <ReportCard
                  icon={CreditCard}
                  label="Card"
                  value={formatMoney(summary.cardSales)}
                  sub={`${cardPercent.toFixed(0)}% del total`}
                  tone="blue"
                />

                <ReportCard
                  icon={ReceiptText}
                  label="Órdenes"
                  value={String(summary.ordersCount)}
                  sub={`Canceladas: ${summary.cancelledCount}`}
                  tone="white"
                />
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <ReportCard
                  icon={TrendingUp}
                  label="Ticket promedio"
                  value={formatMoney(summary.averageTicket)}
                  tone="blue"
                />

                <ReportCard
                  icon={Package}
                  label="Producto #1"
                  value={topProduct ? topProduct.productName : "—"}
                  sub={
                    topProduct
                      ? `${topProduct.quantity} vendidos · ${formatMoney(topProduct.total)}`
                      : "Sin ventas"
                  }
                  tone="orange"
                />

                <ReportCard
                  icon={CalendarDays}
                  label="Rango activo"
                  value={summary.rangeLabel}
                  sub="Filtro aplicado"
                  tone="green"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <Package className="h-6 w-6 text-orange-300" />
                    <h2 className="text-2xl font-black">
                      Productos top {summary.rangeLabel.toLowerCase()}
                    </h2>
                  </div>

                  {topProducts.length === 0 ? (
                    <p className="text-sm font-bold text-white/40">
                      No hay productos entregados en este rango.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div
                          key={product.productName}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-black">
                                #{index + 1} {product.productName}
                              </p>
                              <p className="text-xs font-bold text-white/45">
                                Cantidad: {product.quantity}
                              </p>
                            </div>

                            <p className="text-lg font-black text-orange-300">
                              {formatMoney(product.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <WalletCards className="h-6 w-6 text-green-300" />
                    <h2 className="text-2xl font-black">Cortes recientes</h2>
                  </div>

                  {sessions.length === 0 ? (
                    <p className="text-sm font-bold text-white/40">
                      No hay cortes registrados en este rango.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => {
                        const diff = getSessionDifference(session);

                        return (
                          <button
                            key={session.id}
                            onClick={() => openSessionDetails(session)}
                            className="w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-orange-500/40 hover:bg-orange-500/[0.06]"
                            type="button"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-black">
                                  {formatDateTime(session.opened_at)}
                                </p>

                                <p className="text-xs font-bold text-white/45">
                                  Cierre: {formatDateTime(session.closed_at)}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xl font-black text-orange-300">
                                  {formatMoney(Number(session.total_sales))}
                                </p>

                                <p
                                  className={`text-xs font-black ${
                                    session.status === "open"
                                      ? "text-green-300"
                                      : "text-white/45"
                                  }`}
                                >
                                  {session.status === "open" ? "ABIERTA" : "CERRADA"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid gap-2 text-xs font-bold text-white/50 sm:grid-cols-5">
                              <span>Cash: {formatMoney(Number(session.cash_sales))}</span>
                              <span>Card: {formatMoney(Number(session.card_sales))}</span>
                              <span>Órdenes: {session.order_count}</span>
                              <span
                                className={
                                  diff < 0
                                    ? "text-red-300"
                                    : diff > 0
                                      ? "text-yellow-300"
                                      : "text-green-300"
                                }
                              >
                                Dif: {formatMoney(diff)}
                              </span>
                              <span className="text-red-300">
                                Canceladas: {session.cancelled_count}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {selectedSession && (
          <SessionDetailsModal
            session={selectedSession}
            orders={selectedSessionOrders}
            loading={detailsLoading}
            onClose={() => {
              setSelectedSession(null);
              setSelectedSessionOrders([]);
            }}
          />
        )}
      </main>
    </>
  );
}

function SessionDetailsModal({
  session,
  orders,
  loading,
  onClose,
}: {
  session: CashRegisterReport;
  orders: ReportOrder[];
  loading: boolean;
  onClose: () => void;
}) {
  const expectedCash = getSessionExpectedCash(session);
  const diff = getSessionDifference(session);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black text-green-300">
              <WalletCards className="h-4 w-4" />
              Detalle de corte
            </div>

            <h2 className="text-3xl font-black">
              Corte {session.status === "open" ? "abierto" : "cerrado"}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Apertura: {formatDateTime(session.opened_at)}
            </p>
            <p className="text-sm text-white/50">
              Cierre: {formatDateTime(session.closed_at)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <MiniMetric label="Total" value={formatMoney(Number(session.total_sales))} />
          <MiniMetric label="Cash" value={formatMoney(Number(session.cash_sales))} />
          <MiniMetric label="Card" value={formatMoney(Number(session.card_sales))} />
          <MiniMetric label="Órdenes" value={String(session.order_count)} />
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <MiniMetric
            label="Efectivo inicial"
            value={formatMoney(Number(session.starting_cash))}
          />
          <MiniMetric label="Efectivo esperado" value={formatMoney(expectedCash)} />
          <MiniMetric
            label="Efectivo contado"
            value={
              session.ending_cash === null || session.ending_cash === undefined
                ? "—"
                : formatMoney(Number(session.ending_cash))
            }
          />
          <MiniMetric
            label="Diferencia"
            value={formatMoney(diff)}
            tone={diff < 0 ? "red" : diff > 0 ? "yellow" : "green"}
          />
        </div>

        {session.notes && (
          <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-orange-300">
              Notas
            </p>
            <p className="mt-1 text-sm font-bold text-white/80">{session.notes}</p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-xl font-black">Órdenes del corte</h3>

          {loading ? (
            <p className="mt-3 text-sm font-bold text-white/40">
              Cargando órdenes...
            </p>
          ) : orders.length === 0 ? (
            <p className="mt-3 text-sm font-bold text-white/40">
              No hay órdenes ligadas a este corte.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black">Orden #{order.order_number}</p>
                    <p className="text-xs font-bold text-white/45">
                      {formatDateTime(order.created_at)} · {order.status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-black text-orange-300">
                      {formatMoney(Number(order.total))}
                    </p>
                    <p className="text-xs font-bold text-white/45">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: "white" | "green" | "yellow" | "red";
}) {
  const toneClass = {
    white: "text-white",
    green: "text-green-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className={`mt-1 text-xl font-black ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}

function ReportCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: "orange" | "green" | "blue" | "white";
}) {
  const styles = {
    orange: "border-orange-500/20 bg-orange-500/[0.06] text-orange-300",
    green: "border-green-500/20 bg-green-500/[0.06] text-green-300",
    blue: "border-blue-500/20 bg-blue-500/[0.06] text-blue-300",
    white: "border-white/10 bg-white/[0.04] text-white/60",
  };

  return (
    <div className={`rounded-3xl border p-5 ${styles[tone]}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      </div>

      <p className="text-3xl font-black text-white">{value}</p>

      {sub && (
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-white/45">
          {sub.includes("Canceladas") && <XCircle className="h-4 w-4 text-red-300" />}
          {sub}
        </p>
      )}
    </div>
  );
}