// 📍 Ruta: src/features/loyalty/loyalty-client.service.ts

import { supabase } from "../../lib/supabase";
import type {
  LoyaltyClientCustomer,
  LoyaltyClientLookupResult,
  LoyaltyClientMovement,
  LoyaltyClientReward,
} from "./loyalty-client.types";

function normalizeNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function normalizeLoyaltyPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatLoyaltyPhone(phone: string): string {
  const digits = normalizeLoyaltyPhone(phone);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

export async function getLoyaltyClientByPhone(
  phoneInput: string,
): Promise<LoyaltyClientLookupResult | null> {
  const phone = normalizeLoyaltyPhone(phoneInput);

  if (phone.length < 7) {
    throw new Error("Ingresa un telefono valido.");
  }

  const { data: customerData, error: customerError } = await supabase
    .from("loyalty_customers")
    .select("*")
    .eq("phone", phone)
    .eq("is_active", true)
    .maybeSingle();

  if (customerError) {
    console.error("Error loading loyalty customer", customerError);
    throw customerError;
  }

  if (!customerData) {
    return null;
  }

  const customer = {
    ...customerData,
    points: normalizeNumber(customerData.points),
    visits: normalizeNumber(customerData.visits),
    lifetime_spend: normalizeNumber(customerData.lifetime_spend),
  } as LoyaltyClientCustomer;

  const [{ data: movementsData, error: movementsError }, { data: rewardsData, error: rewardsError }] =
    await Promise.all([
      supabase
        .from("loyalty_point_movements")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true })
        .order("sort_order", { ascending: true }),
    ]);

  if (movementsError) {
    console.error("Error loading loyalty movements", movementsError);
    throw movementsError;
  }

  if (rewardsError) {
    console.error("Error loading loyalty rewards", rewardsError);
    throw rewardsError;
  }

  const movements = (movementsData ?? []).map((movement) => ({
    ...movement,
    points_before: normalizeNumber(movement.points_before),
    points_after: normalizeNumber(movement.points_after),
    points_delta: normalizeNumber(movement.points_delta),
    order_total:
      movement.order_total === null || movement.order_total === undefined
        ? null
        : normalizeNumber(movement.order_total),
  })) as LoyaltyClientMovement[];

  const rewards = (rewardsData ?? []).map((reward) => ({
    ...reward,
    points_required: normalizeNumber(reward.points_required),
    value_amount: normalizeNumber(reward.value_amount),
    sort_order: reward.sort_order === null ? null : normalizeNumber(reward.sort_order),
  })) as LoyaltyClientReward[];

  return {
    customer,
    movements,
    rewards,
  };
}
