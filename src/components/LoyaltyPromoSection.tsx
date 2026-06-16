// 📍 Ruta: src/components/LoyaltyPromoSection.tsx

import React from "react";
import { Gift, Phone, Search, Sparkles, Star, Trophy } from "lucide-react";
import type { Lang } from "../types";

type LoyaltyPromoSectionProps = {
  lang: Lang;
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function LoyaltyPromoSection({ lang }: LoyaltyPromoSectionProps) {
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");

  const copy = {
    eyebrow: lang === "es" ? "Programa de lealtad" : "Rewards program",
    title:
      lang === "es"
        ? "Consulta tus puntos y recompensas."
        : "Check your points and rewards.",
    text:
      lang === "es"
        ? "Escribe tu telefono para ver tu tarjeta digital, puntos, visitas, premios disponibles e historial reciente."
        : "Enter your phone number to view your digital card, points, visits, available rewards, and recent activity.",
    label: lang === "es" ? "Telefono de cliente" : "Customer phone",
    placeholder: "Ej. 3464019676",
    button: lang === "es" ? "Consultar" : "Check rewards",
    error:
      lang === "es"
        ? "Escribe un telefono valido para consultar tus puntos."
        : "Enter a valid phone number to check your points.",
    perks:
      lang === "es"
        ? ["Gana puntos", "Sube de nivel", "Canjea premios"]
        : ["Earn points", "Level up", "Redeem rewards"],
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanPhone = normalizePhone(phone);

    if (cleanPhone.length < 7) {
      setError(copy.error);
      return;
    }

    window.location.assign(`/lealtad?phone=${encodeURIComponent(cleanPhone)}`);
  };

  return (
    <section
      id="lealtad"
      className="relative overflow-hidden border-y border-red-500/15 bg-[#070707] py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.12),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-100 shadow-lg shadow-red-950/20">
            <Sparkles className="h-4 w-4" />
            {copy.eyebrow}
          </div>

          <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {copy.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            {copy.text}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5"
          >
            <label className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/55">
              <Phone className="h-4 w-4 text-red-200" />
              {copy.label}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setError("");
                }}
                inputMode="tel"
                placeholder={copy.placeholder}
                className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 text-lg font-bold text-white outline-none transition placeholder:text-white/25 focus:border-red-400/60 focus:ring-4 focus:ring-red-500/10"
              />
              <button
                type="submit"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-red-950/35 transition hover:scale-[1.01] hover:shadow-red-500/25"
              >
                <Search className="h-5 w-5" />
                {copy.button}
              </button>
            </div>
            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="rounded-[2.25rem] border border-red-500/20 bg-gradient-to-br from-red-950/35 via-zinc-950 to-black p-6 shadow-2xl shadow-red-950/20 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
                Velasquez Rewards
              </p>
              <h3 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Gana en cada compra
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {lang === "es"
                  ? "Tus puntos se actualizan cuando tu orden queda lista o entregada. Los premios se validan directo en ventanilla."
                  : "Your points update when your order is ready or delivered. Rewards are validated at the window."}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-red-400/25 bg-red-500/10 shadow-xl shadow-red-950/25">
              <Gift className="h-8 w-8 text-red-100" />
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {copy.perks.map((perk, index) => {
              const Icon = index === 0 ? Star : index === 1 ? Trophy : Gift;
              return (
                <div key={perk} className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <Icon className="mb-3 h-5 w-5 text-red-200" />
                  <p className="text-sm font-black text-white">{perk}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
