// 📍 Ruta: src/features/admin/loyalty/loyalty.constants.ts

import type { LoyaltyRewardType, LoyaltyTierKey } from "./loyalty.types";

export const LOYALTY_TIERS: Record<
  LoyaltyTierKey,
  {
    label: string;
    minPoints: number;
    nextPoints: number | null;
    badge: string;
    gradient: string;
    chip: string;
  }
> = {
  bronze: {
    label: "Bronce",
    minPoints: 0,
    nextPoints: 100,
    badge: "🥉",
    gradient: "from-orange-950/70 via-amber-900/25 to-zinc-950",
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  },
  silver: {
    label: "Plata",
    minPoints: 100,
    nextPoints: 300,
    badge: "🥈",
    gradient: "from-zinc-800/70 via-zinc-600/20 to-zinc-950",
    chip: "border-zinc-400/30 bg-zinc-400/10 text-zinc-100",
  },
  gold: {
    label: "Oro",
    minPoints: 300,
    nextPoints: 600,
    badge: "🥇",
    gradient: "from-yellow-950/70 via-orange-500/20 to-zinc-950",
    chip: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
  },
  vip: {
    label: "VIP",
    minPoints: 600,
    nextPoints: null,
    badge: "💎",
    gradient: "from-fuchsia-950/60 via-orange-500/20 to-zinc-950",
    chip: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100",
  },
};

export function getLoyaltyTier(points: number): LoyaltyTierKey {
  if (points >= 600) return "vip";
  if (points >= 300) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

export function getTierProgress(points: number): number {
  const tier = LOYALTY_TIERS[getLoyaltyTier(points)];

  if (!tier.nextPoints) {
    return 100;
  }

  const pointsInTier = points - tier.minPoints;
  const tierSize = tier.nextPoints - tier.minPoints;

  return Math.min(
    100,
    Math.max(0, Math.round((pointsInTier / tierSize) * 100)),
  );
}

export const LOYALTY_REWARD_PREVIEWS = [
  {
    title: "Orden frecuente",
    description: "Premio futuro para clientes con visitas constantes.",
    status: "Proximamente",
  },
  {
    title: "Cumpleanos",
    description: "Beneficio especial para celebrar a clientes registrados.",
    status: "Proximamente",
  },
  {
    title: "Cliente VIP",
    description: "Recompensas exclusivas para clientes con mayor puntaje.",
    status: "Proximamente",
  },
];


export const LOYALTY_REWARD_TYPE_LABELS: Record<LoyaltyRewardType, string> = {
  free_item: "Producto gratis",
  fixed_discount: "Descuento fijo",
  percent_discount: "Descuento %",
};

export const LOYALTY_REWARD_TYPE_HELPER: Record<LoyaltyRewardType, string> = {
  free_item: "Ej. Bebida de horchata gratis en ventanilla.",
  fixed_discount: "Ej. $5 de descuento aplicado al subtotal.",
  percent_discount: "Ej. 5% de descuento aplicado antes del cargo por tarjeta.",
};
