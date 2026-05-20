// 📍 Ruta: src/features/loyalty/LoyaltyClientPage.tsx

import React from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock3,
  Flame,
  Gift,
  History,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  WalletCards,
} from "lucide-react";
import type {
  LoyaltyClientCustomer,
  LoyaltyClientLookupResult,
  LoyaltyClientMovement,
  LoyaltyClientReward,
  LoyaltyClientTierKey,
} from "./loyalty-client.types";
import {
  formatLoyaltyPhone,
  getLoyaltyClientByPhone,
  normalizeLoyaltyPhone,
} from "./loyalty-client.service";

const TIERS: Record<
  LoyaltyClientTierKey,
  {
    label: string;
    min: number;
    next: number | null;
    icon: string;
    gradient: string;
    chip: string;
    glow: string;
  }
> = {
  bronze: {
    label: "Bronce",
    min: 0,
    next: 100,
    icon: "🥉",
    gradient: "from-orange-950/80 via-amber-900/25 to-zinc-950",
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    glow: "shadow-orange-950/40",
  },
  silver: {
    label: "Plata",
    min: 100,
    next: 300,
    icon: "🥈",
    gradient: "from-zinc-800/80 via-zinc-500/20 to-zinc-950",
    chip: "border-zinc-300/30 bg-zinc-300/10 text-zinc-100",
    glow: "shadow-zinc-900/40",
  },
  gold: {
    label: "Oro",
    min: 300,
    next: 600,
    icon: "🥇",
    gradient: "from-yellow-950/80 via-orange-500/25 to-zinc-950",
    chip: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
    glow: "shadow-yellow-950/40",
  },
  diamond: {
    label: "Diamante",
    min: 600,
    next: 1000,
    icon: "💎",
    gradient: "from-cyan-950/70 via-orange-500/20 to-zinc-950",
    chip: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    glow: "shadow-cyan-950/40",
  },
  vip: {
    label: "VIP",
    min: 1000,
    next: null,
    icon: "🔥",
    gradient: "from-fuchsia-950/75 via-orange-500/25 to-zinc-950",
    chip: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100",
    glow: "shadow-fuchsia-950/40",
  },
};

const MILESTONES = [
  { label: "Bronce", points: 0, icon: "🥉" },
  { label: "Plata", points: 100, icon: "🥈" },
  { label: "Oro", points: 300, icon: "🥇" },
  { label: "Diamante", points: 600, icon: "💎" },
  { label: "VIP", points: 1000, icon: "🔥" },
];

function getTier(points: number): LoyaltyClientTierKey {
  if (points >= 1000) return "vip";
  if (points >= 600) return "diamond";
  if (points >= 300) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

function getTierProgress(points: number): number {
  const tier = TIERS[getTier(points)];

  if (!tier.next) {
    return 100;
  }

  const progress = ((points - tier.min) / (tier.next - tier.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function getGlobalProgress(points: number): number {
  return Math.max(0, Math.min(100, Math.round((points / 1000) * 100)));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRewardLabel(reward: LoyaltyClientReward): string {
  if (reward.reward_type === "free_item") {
    return reward.product_label || reward.title;
  }

  if (reward.reward_type === "fixed_discount") {
    return `${formatCurrency(reward.value_amount)} OFF`;
  }

  return `${reward.value_amount}% OFF`;
}

function getMovementLabel(movement: LoyaltyClientMovement): string {
  if (movement.points_delta > 0) return `+${movement.points_delta} pts`;
  if (movement.points_delta < 0) return `${movement.points_delta} pts`;
  return "Sin cambio";
}

function LoyaltyLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-orange-500/25 bg-black/60 shadow-xl shadow-orange-950/30">
        <img
          src="/images/velasquez-logo.png"
          alt="Velasquez Food Truck"
          className="h-full w-full object-contain p-1"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <Flame className="hidden h-7 w-7 text-orange-300" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200">
          Velasquez
        </p>
        <p className="text-lg font-black leading-none text-white">Rewards</p>
      </div>
    </div>
  );
}

function ClientCard({ customer }: { customer: LoyaltyClientCustomer }) {
  const tierKey = getTier(customer.points);
  const tier = TIERS[tierKey];
  const tierProgress = getTierProgress(customer.points);
  const pointsToNext = tier.next ? Math.max(0, tier.next - customer.points) : 0;

  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${tier.gradient} p-5 shadow-2xl ${tier.glow} sm:p-7`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/70">
            <WalletCards className="h-4 w-4 text-orange-200" />
            Tarjeta digital
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {customer.full_name || "Cliente Velasquez"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {formatLoyaltyPhone(customer.phone)}
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${tier.chip}`}>
          <span className="text-2xl">{tier.icon}</span>
          Cliente {tier.label}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            Puntos
          </p>
          <p className="mt-2 text-4xl font-black text-white">{customer.points}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            Visitas
          </p>
          <p className="mt-2 text-4xl font-black text-white">{customer.visits}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            Total gastado
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatCurrency(customer.lifetime_spend)}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="font-bold text-white/75">Progreso del nivel</span>
          <span className="font-black text-orange-100">
            {tier.next ? `${pointsToNext} pts para ${TIERS[getTier(tier.next)].label}` : "Nivel maximo"}
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-300 to-orange-200 shadow-lg shadow-orange-500/30 transition-all duration-700"
            style={{ width: `${tierProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function MilestoneTrack({ points }: { points: number }) {
  const progress = getGlobalProgress(points);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/25 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
            Camino VIP
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">Progreso de recompensas</h3>
        </div>
        <Trophy className="h-7 w-7 text-orange-200" />
      </div>

      <div className="relative px-2 py-6">
        <div className="absolute left-4 right-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute left-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-600 via-yellow-300 to-orange-200 shadow-lg shadow-orange-500/20 transition-all duration-700"
          style={{ width: `calc((100% - 2rem) * ${progress / 100})` }}
        />
        <div className="relative z-10 grid grid-cols-5 gap-2">
          {MILESTONES.map((milestone) => {
            const unlocked = points >= milestone.points;

            return (
              <div key={milestone.label} className="flex flex-col items-center gap-2 text-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl shadow-lg transition-all ${
                    unlocked
                      ? "border-orange-300/50 bg-orange-500/20 shadow-orange-950/30"
                      : "border-white/10 bg-zinc-950 shadow-black/30"
                  }`}
                >
                  {unlocked ? milestone.icon : <Lock className="h-5 w-5 text-white/35" />}
                </div>
                <div>
                  <p className={`text-[11px] font-black ${unlocked ? "text-white" : "text-white/40"}`}>
                    {milestone.label}
                  </p>
                  <p className="text-[10px] text-white/35">{milestone.points} pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RewardsGrid({ rewards, points }: { rewards: LoyaltyClientReward[]; points: number }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/25 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
            Premios
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">Recompensas disponibles</h3>
        </div>
        <Gift className="h-7 w-7 text-orange-200" />
      </div>

      {rewards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/25 p-6 text-center text-sm text-white/50">
          Todavia no hay recompensas activas. Pregunta en ventanilla por futuras promociones.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => {
            const unlocked = points >= reward.points_required;
            const missing = Math.max(0, reward.points_required - points);

            return (
              <article
                key={reward.id}
                className={`rounded-3xl border p-4 transition-all ${
                  unlocked
                    ? "border-orange-400/30 bg-orange-500/10 shadow-lg shadow-orange-950/20"
                    : "border-white/10 bg-black/25"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                    {unlocked ? (
                      <CheckCircle2 className="h-5 w-5 text-orange-200" />
                    ) : (
                      <Lock className="h-5 w-5 text-white/35" />
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      unlocked
                        ? "border-orange-300/30 bg-orange-400/10 text-orange-100"
                        : "border-white/10 bg-white/5 text-white/45"
                    }`}
                  >
                    {reward.points_required} pts
                  </span>
                </div>

                <h4 className="text-lg font-black text-white">{reward.title}</h4>
                <p className="mt-1 text-sm font-bold text-orange-100">{getRewardLabel(reward)}</p>
                {reward.description && (
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{reward.description}</p>
                )}
                <p className={`mt-4 text-xs font-black uppercase tracking-[0.18em] ${unlocked ? "text-orange-200" : "text-white/35"}`}>
                  {unlocked ? "Disponible en ventanilla" : `Te faltan ${missing} pts`}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MovementsList({ movements }: { movements: LoyaltyClientMovement[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/25 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
            Actividad
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">Historial reciente</h3>
        </div>
        <History className="h-7 w-7 text-orange-200" />
      </div>

      {movements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/25 p-6 text-center text-sm text-white/50">
          Aun no hay movimientos de puntos.
        </div>
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => {
            const positive = movement.points_delta >= 0;

            return (
              <div
                key={movement.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/25 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${positive ? "border-emerald-400/25 bg-emerald-500/10" : "border-orange-400/25 bg-orange-500/10"}`}>
                    {positive ? (
                      <Star className="h-5 w-5 text-emerald-200" />
                    ) : (
                      <Gift className="h-5 w-5 text-orange-200" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {movement.reason || "Movimiento de lealtad"}
                    </p>
                    <p className="mt-1 text-xs text-white/40">{formatDate(movement.created_at)}</p>
                  </div>
                </div>
                <div className={`shrink-0 rounded-full border px-3 py-1 text-sm font-black ${positive ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border-orange-300/20 bg-orange-500/10 text-orange-200"}`}>
                  {getMovementLabel(movement)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function LoyaltyClientPage() {
  const [phone, setPhone] = React.useState("");
  const [lookup, setLookup] = React.useState<LoyaltyClientLookupResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const cleanPhone = normalizeLoyaltyPhone(phone);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError(null);
    setHasSearched(true);
    setLookup(null);

    if (cleanPhone.length < 7) {
      setError("Ingresa el telefono que usaste en tu orden.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await getLoyaltyClientByPhone(cleanPhone);

      if (!result) {
        setError("No encontramos una cuenta activa con ese telefono. Pregunta en ventanilla para registrarte.");
        return;
      }

      setLookup(result);
    } catch (searchError) {
      console.error(searchError);
      setError("No pudimos consultar tus puntos. Intenta de nuevo en unos segundos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3">
          <LoyaltyLogo />
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-orange-400/40 hover:text-orange-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </a>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-orange-200">
              <Sparkles className="h-4 w-4" />
              Programa de lealtad
            </div>

            <h1 className="text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              Tus puntos, tus recompensas.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
              Ingresa tu telefono para revisar tus puntos, nivel, recompensas disponibles e historial reciente de Velasquez Food Truck.
            </p>

            <form onSubmit={handleSearch} className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
              <label className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/55">
                <Phone className="h-4 w-4 text-orange-200" />
                Consulta por telefono
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  placeholder="Ej. 3464019676"
                  className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 text-lg font-bold text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-500/10"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 px-6 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-orange-950/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Clock3 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  Consultar
                </button>
              </div>
              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-orange-200" />
                <p className="text-sm font-bold text-white">Seguro</p>
                <p className="mt-1 text-xs text-white/45">Solo consulta tus puntos.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <Award className="mb-3 h-5 w-5 text-orange-200" />
                <p className="text-sm font-bold text-white">Niveles</p>
                <p className="mt-1 text-xs text-white/45">Sube de rango al comprar.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <Gift className="mb-3 h-5 w-5 text-orange-200" />
                <p className="text-sm font-bold text-white">Premios</p>
                <p className="mt-1 text-xs text-white/45">Canje en ventanilla.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {lookup ? (
              <>
                <ClientCard customer={lookup.customer} />
                <MilestoneTrack points={lookup.customer.points} />
              </>
            ) : (
              <section className="overflow-hidden rounded-[2.25rem] border border-orange-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-orange-950/45 p-6 shadow-2xl shadow-orange-950/20 sm:p-8">
                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-orange-400/25 bg-orange-500/10 shadow-2xl shadow-orange-950/30">
                    <Flame className="h-12 w-12 text-orange-200" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200">
                    Rewards preview
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
                    Gana puntos con cada orden.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/55">
                    Cuando el pedido queda listo o entregado, tus puntos se actualizan automaticamente. Las recompensas se canjean en ventanilla con el vendedor.
                  </p>
                  {hasSearched && !isLoading && !lookup && !error && (
                    <p className="mt-4 text-sm text-white/45">Busca tu cuenta para ver tu tarjeta.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </section>

        {lookup && (
          <section className="grid gap-5 pb-10 lg:grid-cols-[1.2fr_0.8fr]">
            <RewardsGrid rewards={lookup.rewards} points={lookup.customer.points} />
            <MovementsList movements={lookup.movements} />
          </section>
        )}

        <footer className="relative border-t border-white/10 py-6 text-center text-xs text-white/35">
          Velasquez Food Truck Rewards • Las recompensas se validan en ventanilla.
        </footer>
      </div>
    </main>
  );
}
