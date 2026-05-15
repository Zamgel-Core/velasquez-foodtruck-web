// 📍 Ruta: src/features/admin/register/AdminRegisterPage.tsx

import React from "react";
import { DollarSign, Lock, RefreshCw, Unlock, WalletCards } from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import { useStaffAuth } from "../auth/useStaffAuth";
import {
  closeRegisterSession,
  getOpenRegisterSession,
  getRegisterSessionHistory,
  getRegisterSessionTotals,
  openRegisterSession,
  type CashRegisterSession,
} from "./admin-register.service";

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

export default function AdminRegisterPage() {
  const { profile } = useStaffAuth();

  const [openSession, setOpenSession] =
    React.useState<CashRegisterSession | null>(null);
  const [history, setHistory] = React.useState<CashRegisterSession[]>([]);
  const [totals, setTotals] = React.useState({
    cashSales: 0,
    cardSales: 0,
    pendingSales: 0,
    totalSales: 0,
    orderCount: 0,
    cancelledCount: 0,
  });

  const [startingCash, setStartingCash] = React.useState("");
  const [endingCash, setEndingCash] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const loadRegister = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const session = await getOpenRegisterSession();
      const sessionHistory = await getRegisterSessionHistory();

      setOpenSession(session);
      setHistory(sessionHistory);

      if (session) {
        setTotals(await getRegisterSessionTotals(session.id));
      } else {
        setTotals({
          cashSales: 0,
          cardSales: 0,
          pendingSales: 0,
          totalSales: 0,
          orderCount: 0,
          cancelledCount: 0,
        });
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la caja.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRegister();
  }, [loadRegister]);

  async function handleOpenRegister(event: React.FormEvent) {
    event.preventDefault();

    if (!profile) {
      setError("No se encontró el perfil del usuario.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await openRegisterSession({
        staffProfileId: profile.id,
        startingCash: Number(startingCash || 0),
        notes,
      });

      setStartingCash("");
      setNotes("");
      setSuccess("Caja abierta correctamente.");
      await loadRegister();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo abrir la caja.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCloseRegister(event: React.FormEvent) {
    event.preventDefault();

    if (!profile || !openSession) {
      setError("No hay caja abierta para cerrar.");
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que quieres cerrar la caja? Después de cerrar, las órdenes nuevas irán a un nuevo corte."
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await closeRegisterSession({
        sessionId: openSession.id,
        staffProfileId: profile.id,
        endingCash: Number(endingCash || 0),
        notes,
      });

      setEndingCash("");
      setNotes("");
      setSuccess("Caja cerrada correctamente.");
      await loadRegister();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo cerrar la caja.");
    } finally {
      setSaving(false);
    }
  }

  const expectedCash = openSession
    ? Number(openSession.starting_cash || 0) + totals.cashSales
    : 0;

  const cashDifference =
    endingCash.trim() && openSession
      ? Number(endingCash || 0) - expectedCash
      : 0;

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
        <section className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <WalletCards className="h-4 w-4" />
                  Corte de caja
                </div>

                <h1 className="text-3xl font-black sm:text-4xl">
                  Caja <span className="text-orange-500">Velasquez</span>
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  Abre caja, cierra corte y revisa ventas del turno.
                </p>
              </div>

              <button
                onClick={loadRegister}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/[0.10]"
                type="button"
              >
                <RefreshCw className="h-5 w-5" />
                Actualizar
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-200">
              {success}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/50">
              Cargando caja...
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-300">
                    Total ventas
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {formatMoney(totals.totalSales)}
                  </p>
                </div>

                <div className="rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-green-300">
                    Cash
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {formatMoney(totals.cashSales)}
                  </p>
                </div>

                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.06] p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-blue-300">
                    Card
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {formatMoney(totals.cardSales)}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-white/45">
                    Órdenes
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {totals.orderCount}
                  </p>
                  <p className="mt-1 text-xs font-bold text-red-300">
                    Canceladas: {totals.cancelledCount}
                  </p>
                </div>
              </div>

              {!openSession ? (
                <form
                  onSubmit={handleOpenRegister}
                  className="mb-6 rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-200">
                      <Unlock className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black">Abrir caja</h2>
                      <p className="text-sm text-white/55">
                        Registra el efectivo inicial antes de comenzar ventas.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-white/60">
                        Efectivo inicial
                      </span>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                        <input
                          value={startingCash}
                          onChange={(event) => setStartingCash(event.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="150.00"
                          className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 font-bold outline-none focus:border-green-500/60"
                        />
                      </div>
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-bold text-white/60">
                        Notas opcionales
                      </span>
                      <input
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Ej. turno de mañana, evento, etc."
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-bold outline-none focus:border-green-500/60"
                      />
                    </label>
                  </div>

                  <button
                    disabled={saving}
                    className="mt-4 rounded-2xl bg-green-600 px-5 py-3 font-black text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                  >
                    {saving ? "Abriendo..." : "Abrir caja"}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleCloseRegister}
                  className="mb-6 rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-200">
                      <Lock className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black">Caja abierta</h2>
                      <p className="text-sm text-white/55">
                        Abierta: {formatDateTime(openSession.opened_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs font-bold text-white/45">
                        Efectivo inicial
                      </p>
                      <p className="text-xl font-black">
                        {formatMoney(Number(openSession.starting_cash))}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs font-bold text-white/45">
                        Efectivo esperado
                      </p>
                      <p className="text-xl font-black text-green-300">
                        {formatMoney(expectedCash)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs font-bold text-white/45">
                        Diferencia
                      </p>
                      <p
                        className={`text-xl font-black ${
                          cashDifference < 0
                            ? "text-red-300"
                            : cashDifference > 0
                              ? "text-yellow-300"
                              : "text-white"
                        }`}
                      >
                        {formatMoney(cashDifference)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-white/60">
                        Efectivo final contado
                      </span>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                        <input
                          value={endingCash}
                          onChange={(event) => setEndingCash(event.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={expectedCash.toFixed(2)}
                          className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 font-bold outline-none focus:border-orange-500/60"
                        />
                      </div>
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-bold text-white/60">
                        Notas del cierre
                      </span>
                      <input
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Ej. sobrante, faltante, evento lento..."
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-bold outline-none focus:border-orange-500/60"
                      />
                    </label>
                  </div>

                  <button
                    disabled={saving}
                    className="mt-4 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                  >
                    {saving ? "Cerrando..." : "Cerrar caja"}
                  </button>
                </form>
              )}

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-2xl font-black">Historial de cortes</h2>

                <div className="mt-4 grid gap-3">
                  {history.length === 0 ? (
                    <p className="text-sm text-white/45">
                      Todavía no hay cortes registrados.
                    </p>
                  ) : (
                    history.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
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

                        <div className="mt-3 grid gap-2 text-xs font-bold text-white/50 sm:grid-cols-4">
                          <span>Cash: {formatMoney(Number(session.cash_sales))}</span>
                          <span>Card: {formatMoney(Number(session.card_sales))}</span>
                          <span>Órdenes: {session.order_count}</span>
                          <span>Canceladas: {session.cancelled_count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}