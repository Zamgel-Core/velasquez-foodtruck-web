// 📍 Ruta: src/features/admin/loyalty/loyalty.service.ts

import { supabase } from "../../../lib/supabase";
import type {
  LoyaltyCustomer,
  LoyaltyCustomerFormData,
  LoyaltyMovement,
  LoyaltyMovementType,
  LoyaltyPointsFormData,
  LoyaltyReward,
  LoyaltyRewardFormData,
  LoyaltySettings,
  LoyaltySettingsFormData,
  LoyaltyRewardAvailability,
  LoyaltyRedeemRewardInput,
  LoyaltyRedeemRewardResult,
} from "./loyalty.types";

function normalizeNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhoneForDisplay(phone: string): string {
  const digits = onlyDigits(phone);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

export function createEmptyLoyaltyCustomerForm(): LoyaltyCustomerFormData {
  return {
    full_name: "",
    phone: "",
    email: "",
    birth_date: "",
    points: "0",
    visits: "0",
    lifetime_spend: "0",
    notes: "",
    is_active: true,
  };
}

export function loyaltyCustomerToForm(
  customer: LoyaltyCustomer,
): LoyaltyCustomerFormData {
  return {
    id: customer.id,
    full_name: customer.full_name ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    birth_date: customer.birth_date ?? "",
    points: String(normalizeNumber(customer.points)),
    visits: String(normalizeNumber(customer.visits)),
    lifetime_spend: String(normalizeNumber(customer.lifetime_spend)),
    notes: customer.notes ?? "",
    is_active: Boolean(customer.is_active),
  };
}

export async function getLoyaltyCustomers(): Promise<LoyaltyCustomer[]> {
  const { data, error } = await supabase
    .from("loyalty_customers")
    .select("*")
    .order("points", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading loyalty customers", error);
    throw error;
  }

  return (data ?? []).map((customer) => ({
    ...customer,
    points: normalizeNumber(customer.points),
    visits: normalizeNumber(customer.visits),
    lifetime_spend: normalizeNumber(customer.lifetime_spend),
  })) as LoyaltyCustomer[];
}

export async function saveLoyaltyCustomer(
  form: LoyaltyCustomerFormData,
): Promise<LoyaltyCustomer> {
  const payload = {
    full_name: form.full_name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || null,
    ...(form.birth_date ? { birth_date: form.birth_date } : {}),
    points: normalizeNumber(form.points),
    visits: normalizeNumber(form.visits),
    lifetime_spend: normalizeNumber(form.lifetime_spend),
    notes: form.notes.trim() || null,
    is_active: form.is_active,
  };

  if (!payload.full_name || !payload.phone) {
    throw new Error("Nombre y telefono son obligatorios.");
  }

  if (form.id) {
    const { data, error } = await supabase
      .from("loyalty_customers")
      .update(payload)
      .eq("id", form.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating loyalty customer", error);
      throw error;
    }

    return data as LoyaltyCustomer;
  }

  const { data, error } = await supabase
    .from("loyalty_customers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating loyalty customer", error);
    throw error;
  }

  return data as LoyaltyCustomer;
}

export async function toggleLoyaltyCustomerActive(
  customer: LoyaltyCustomer,
): Promise<void> {
  const { error } = await supabase
    .from("loyalty_customers")
    .update({ is_active: !customer.is_active })
    .eq("id", customer.id);

  if (error) {
    console.error("Error toggling loyalty customer", error);
    throw error;
  }
}

export function createEmptyPointsForm(customerId = ""): LoyaltyPointsFormData {
  return {
    customer_id: customerId,
    movement_type: "add",
    points: "0",
    reason: "",
  };
}

export async function saveLoyaltyPointsMovement(
  form: LoyaltyPointsFormData,
): Promise<void> {
  const pointsValue = Math.abs(normalizeNumber(form.points));
  const reason = form.reason.trim() || null;

  if (!form.customer_id) {
    throw new Error("Selecciona un cliente.");
  }

  const { data: customer, error: customerError } = await supabase
    .from("loyalty_customers")
    .select("*")
    .eq("id", form.customer_id)
    .single();

  if (customerError || !customer) {
    console.error("Error loading loyalty customer for movement", customerError);
    throw customerError ?? new Error("Cliente no encontrado.");
  }

  const before = normalizeNumber(customer.points);
  let after = before;
  let delta = 0;
  const movementType = form.movement_type as LoyaltyMovementType;

  if (movementType === "add") {
    delta = pointsValue;
    after = before + pointsValue;
  }

  if (movementType === "subtract") {
    delta = -pointsValue;
    after = Math.max(0, before - pointsValue);
  }

  if (movementType === "set") {
    after = pointsValue;
    delta = after - before;
  }

  const { error: updateError } = await supabase
    .from("loyalty_customers")
    .update({
      points: after,
      visits:
        movementType === "add"
          ? normalizeNumber(customer.visits) + 1
          : customer.visits,
    })
    .eq("id", form.customer_id);

  if (updateError) {
    console.error("Error updating loyalty points", updateError);
    throw updateError;
  }

  const { error: movementError } = await supabase
    .from("loyalty_point_movements")
    .insert({
      customer_id: form.customer_id,
      movement_type: movementType,
      points_before: before,
      points_after: after,
      points_delta: delta,
      reason,
    });

  if (movementError) {
    console.error("Error saving loyalty movement", movementError);
    throw movementError;
  }
}

export async function getRecentLoyaltyMovements(): Promise<LoyaltyMovement[]> {
  const { data, error } = await supabase
    .from("loyalty_point_movements")
    .select(
      `
        *,
        customer:loyalty_customers(full_name, phone)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error loading loyalty movements", error);
    throw error;
  }

  return (data ?? []) as LoyaltyMovement[];
}

export type RegisterLoyaltyOrderInput = {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  orderTotal: number;
  source?: "home" | "pos" | "admin_pos";
};

export type RegisterLoyaltyOrderResult = {
  pointsAdded: number;
  alreadyRegistered: boolean;
};

function calculateLoyaltyPoints(
  total: number,
  pointsPerDollar = 1,
  roundingThreshold = 0.8,
): number {
  const safeTotal = Math.max(0, normalizeNumber(total));
  const safeMultiplier = Math.max(0, normalizeNumber(pointsPerDollar));
  const threshold = Math.min(
    0.99,
    Math.max(0, normalizeNumber(roundingThreshold)),
  );
  const whole = Math.floor(safeTotal);
  const cents = safeTotal - whole;
  const roundedDollars = whole + (cents >= threshold ? 1 : 0);

  return Math.max(0, Math.round(roundedDollars * safeMultiplier));
}

export async function registerLoyaltyOrder(
  input: RegisterLoyaltyOrderInput,
): Promise<RegisterLoyaltyOrderResult> {
  const phone = onlyDigits(input.customerPhone);

  if (!phone) {
    return {
      pointsAdded: 0,
      alreadyRegistered: false,
    };
  }

  const settings = await getLoyaltySettings();

  if (settings && !settings.is_enabled) {
    return {
      pointsAdded: 0,
      alreadyRegistered: false,
    };
  }

  const orderTotal = normalizeNumber(input.orderTotal);
  const earnedPoints = calculateLoyaltyPoints(
    orderTotal,
    settings?.points_per_dollar ?? 1,
    settings?.rounding_threshold ?? 0.8,
  );

  if (orderTotal <= 0 || earnedPoints <= 0) {
    return {
      pointsAdded: 0,
      alreadyRegistered: false,
    };
  }

  const customerName = input.customerName.trim() || "Cliente Velasquez";

  const { data: existingCustomers, error: lookupError } = await supabase
    .from("loyalty_customers")
    .select("*")
    .eq("phone", phone)
    .limit(1);

  if (lookupError) {
    console.error("Loyalty lookup error", lookupError);
    throw lookupError;
  }

  let customer = existingCustomers?.[0] as LoyaltyCustomer | undefined;

  if (!customer) {
    const { data: createdCustomer, error: createError } = await supabase
      .from("loyalty_customers")
      .insert({
        full_name: customerName,
        phone,
        email: null,
        points: 0,
        visits: 0,
        lifetime_spend: 0,
        notes: "Cliente creado automaticamente desde POS/Home.",
        is_active: true,
      })
      .select("*")
      .single();

    if (createError) {
      console.error("Loyalty create customer error", createError);
      throw createError;
    }

    customer = createdCustomer as LoyaltyCustomer;
  }

  const sourceLabel =
    input.source === "admin_pos"
      ? "POS Admin"
      : input.source === "pos"
        ? "POS"
        : "Home";

  const orderReference = `Orden #${input.orderNumber}`;

  const { data: existingMovement, error: movementLookupError } = await supabase
    .from("loyalty_point_movements")
    .select("id")
    .eq("customer_id", customer.id)
    .ilike("reason", `%${orderReference}%`)
    .limit(1);

  if (movementLookupError) {
    console.error("Loyalty movement lookup error", movementLookupError);
    throw movementLookupError;
  }

  if ((existingMovement ?? []).length > 0) {
    return {
      pointsAdded: 0,
      alreadyRegistered: true,
    };
  }

  const pointsBefore = normalizeNumber(customer.points);
  const pointsAfter = pointsBefore + earnedPoints;
  const visitsAfter = normalizeNumber(customer.visits) + 1;
  const lifetimeSpendAfter =
    normalizeNumber(customer.lifetime_spend) + orderTotal;

  const { error: updateError } = await supabase
    .from("loyalty_customers")
    .update({
      full_name: customer.full_name || customerName,
      phone,
      points: pointsAfter,
      visits: visitsAfter,
      lifetime_spend: lifetimeSpendAfter,
      is_active: true,
    })
    .eq("id", customer.id);

  if (updateError) {
    console.error("Loyalty update customer error", updateError);
    throw updateError;
  }

  const { error: movementError } = await supabase
    .from("loyalty_point_movements")
    .insert({
      customer_id: customer.id,
      movement_type: "add",
      points_before: pointsBefore,
      points_after: pointsAfter,
      points_delta: earnedPoints,
      reason: `${orderReference} (${sourceLabel}) · $${orderTotal.toFixed(2)}`,
    });

  if (movementError) {
    console.error("Loyalty movement insert error", movementError);
    throw movementError;
  }

  return {
    pointsAdded: earnedPoints,
    alreadyRegistered: false,
  };
}

export function createEmptyLoyaltyRewardForm(): LoyaltyRewardFormData {
  return {
    title: "",
    description: "",
    reward_type: "free_item",
    points_required: "50",
    min_tier: "bronze",
    value_amount: "0",
    product_label: "",
    is_active: true,
    sort_order: "10",
    reward_product_id: "",
    reward_product_name: "",
  };
}

export function loyaltyRewardToForm(
  reward: LoyaltyReward,
): LoyaltyRewardFormData {
  return {
    id: reward.id,
    title: reward.title ?? "",
    description: reward.description ?? "",
    reward_type: reward.reward_type,
    points_required: String(normalizeNumber(reward.points_required)),
    min_tier: reward.min_tier,
    value_amount: String(normalizeNumber(reward.value_amount)),
    product_label: reward.product_label ?? "",
    is_active: Boolean(reward.is_active),
    sort_order: String(normalizeNumber(reward.sort_order)),
    reward_product_id: reward.reward_product_id ?? "",
    reward_product_name: reward.reward_product_name ?? "",
  };
}

export async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("points_required", { ascending: true });

  if (error) {
    console.error("Error loading loyalty rewards", error);
    throw error;
  }

  return (data ?? []).map((reward) => ({
    ...reward,
    points_required: normalizeNumber(reward.points_required),
    value_amount: normalizeNumber(reward.value_amount),
    sort_order:
      reward.sort_order === null ? null : normalizeNumber(reward.sort_order),
  })) as LoyaltyReward[];
}

export async function saveLoyaltyReward(
  form: LoyaltyRewardFormData,
): Promise<LoyaltyReward> {
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    reward_type: form.reward_type,
    points_required: Math.max(
      0,
      Math.round(normalizeNumber(form.points_required)),
    ),
    min_tier: form.min_tier,
    value_amount: Math.max(0, normalizeNumber(form.value_amount)),
    product_label: form.product_label.trim() || null,
    reward_product_id: form.reward_product_id || null,
    reward_product_name: form.reward_product_name?.trim() || null,
    is_active: form.is_active,
    sort_order: form.sort_order.trim()
      ? Math.round(normalizeNumber(form.sort_order))
      : 10,
  };

  if (!payload.title) {
    throw new Error("El nombre de la recompensa es obligatorio.");
  }

  if (payload.reward_type === "free_item" && !payload.product_label) {
    throw new Error("Escribe el producto o premio gratis.");
  }

  if (payload.reward_type !== "free_item" && payload.value_amount <= 0) {
    throw new Error("El descuento debe ser mayor a 0.");
  }

  if (form.id) {
    const { data, error } = await supabase
      .from("loyalty_rewards")
      .update(payload)
      .eq("id", form.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating loyalty reward", error);
      throw error;
    }

    return data as LoyaltyReward;
  }

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating loyalty reward", error);
    throw error;
  }

  return data as LoyaltyReward;
}

export async function toggleLoyaltyRewardActive(
  reward: LoyaltyReward,
): Promise<void> {
  const { error } = await supabase
    .from("loyalty_rewards")
    .update({ is_active: !reward.is_active })
    .eq("id", reward.id);

  if (error) {
    console.error("Error toggling loyalty reward", error);
    throw error;
  }
}

export async function deleteLoyaltyReward(
  reward: LoyaltyReward,
): Promise<void> {
  const { error } = await supabase
    .from("loyalty_rewards")
    .delete()
    .eq("id", reward.id);

  if (error) {
    console.error("Error deleting loyalty reward", error);
    throw error;
  }
}

export async function getAvailableLoyaltyRewardsForPhone(
  phoneValue: string,
): Promise<LoyaltyRewardAvailability[]> {
  const phone = onlyDigits(phoneValue);

  if (!phone) return [];

  const { data: customerData, error: customerError } = await supabase
    .from("loyalty_customers")
    .select("*")
    .eq("phone", phone)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (customerError) {
    console.error("Error loading loyalty customer by phone", customerError);
    throw customerError;
  }

  if (!customerData) return [];

  const customer = {
    ...customerData,
    points: normalizeNumber(customerData.points),
    visits: normalizeNumber(customerData.visits),
    lifetime_spend: normalizeNumber(customerData.lifetime_spend),
  } as LoyaltyCustomer;

  const rewards = await getLoyaltyRewards();
  const activeRewards = rewards.filter((reward) => reward.is_active);

  return activeRewards.map((reward) => {
    const available =
      customer.points >= normalizeNumber(reward.points_required);

    return {
      reward,
      customer,
      available,
      reason: available
        ? null
        : `Necesita ${Math.max(
            0,
            normalizeNumber(reward.points_required) - customer.points,
          )} puntos mas.`,
    };
  });
}

function calculateRewardDiscount(reward: LoyaltyReward, orderTotal: number) {
  const total = Math.max(0, normalizeNumber(orderTotal));

  if (reward.reward_type === "fixed_discount") {
    return Math.min(total, Math.max(0, normalizeNumber(reward.value_amount)));
  }

  if (reward.reward_type === "percent_discount") {
    const percent = Math.min(
      100,
      Math.max(0, normalizeNumber(reward.value_amount)),
    );
    return Math.min(total, Number(((total * percent) / 100).toFixed(2)));
  }

  return 0;
}

export function getRewardDisplayValue(reward: LoyaltyReward) {
  if (reward.reward_type === "free_item") {
    return reward.product_label || reward.title;
  }

  if (reward.reward_type === "fixed_discount") {
    return `$${normalizeNumber(reward.value_amount).toFixed(2)} off`;
  }

  return `${normalizeNumber(reward.value_amount)}% off`;
}

export async function redeemLoyaltyReward(
  input: LoyaltyRedeemRewardInput,
): Promise<LoyaltyRedeemRewardResult> {
  const phone = onlyDigits(input.customerPhone);

  if (!phone || !input.rewardId) {
    return {
      redeemed: false,
      pointsDeducted: 0,
      discountAmount: 0,
      label: "",
      rewardType: "free_item",
      customerId: null,
    };
  }

  const { data: customerData, error: customerError } = await supabase
    .from("loyalty_customers")
    .select("*")
    .eq("phone", phone)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (customerError) {
    console.error("Loyalty redeem customer lookup error", customerError);
    throw customerError;
  }

  if (!customerData) {
    throw new Error("No se encontro cliente de lealtad para canjear.");
  }

  const customer = {
    ...customerData,
    points: normalizeNumber(customerData.points),
    visits: normalizeNumber(customerData.visits),
    lifetime_spend: normalizeNumber(customerData.lifetime_spend),
  } as LoyaltyCustomer;

  const { data: rewardData, error: rewardError } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("id", input.rewardId)
    .eq("is_active", true)
    .single();

  if (rewardError) {
    console.error("Loyalty redeem reward lookup error", rewardError);
    throw rewardError;
  }

  const reward = rewardData as LoyaltyReward;
  const pointsRequired = normalizeNumber(reward.points_required);

  if (customer.points < pointsRequired) {
    throw new Error(
      "El cliente no tiene suficientes puntos para esta recompensa.",
    );
  }

  const discountAmount = calculateRewardDiscount(reward, input.orderTotal);
  const pointsBefore = customer.points;
  const pointsAfter = Math.max(0, pointsBefore - pointsRequired);
  const label = getRewardDisplayValue(reward);

  const { error: updateError } = await supabase
    .from("loyalty_customers")
    .update({
      points: pointsAfter,
      is_active: true,
    })
    .eq("id", customer.id);

  if (updateError) {
    console.error("Loyalty redeem customer update error", updateError);
    throw updateError;
  }

  const { error: movementError } = await supabase
    .from("loyalty_point_movements")
    .insert({
      customer_id: customer.id,
      movement_type: "subtract",
      points_before: pointsBefore,
      points_after: pointsAfter,
      points_delta: -pointsRequired,
      reason: `Canje: ${reward.title} · Orden #${input.orderNumber} (POS Admin)`,
      source_order_number: input.orderNumber,
      order_total: normalizeNumber(input.orderTotal),
    });

  if (movementError) {
    console.error("Loyalty redeem movement insert error", movementError);
    throw movementError;
  }

  return {
    redeemed: true,
    pointsDeducted: pointsRequired,
    discountAmount,
    label,
    rewardType: reward.reward_type,
    customerId: customer.id,
  };
}

export function createDefaultLoyaltySettingsForm(): LoyaltySettingsFormData {
  return {
    is_enabled: true,
    points_per_dollar: "1",
    rounding_threshold: "0.8",
    auto_create_customers: true,
    earn_on_ready: true,
    earn_on_delivered: true,
  };
}

export function loyaltySettingsToForm(
  settings: LoyaltySettings | null,
): LoyaltySettingsFormData {
  if (!settings) return createDefaultLoyaltySettingsForm();

  return {
    id: settings.id,
    is_enabled: Boolean(settings.is_enabled),
    points_per_dollar: String(normalizeNumber(settings.points_per_dollar)),
    rounding_threshold: String(normalizeNumber(settings.rounding_threshold)),
    auto_create_customers: Boolean(settings.auto_create_customers),
    earn_on_ready: Boolean(settings.earn_on_ready),
    earn_on_delivered: Boolean(settings.earn_on_delivered),
  };
}

export async function getLoyaltySettings(): Promise<LoyaltySettings | null> {
  const { data, error } = await supabase
    .from("loyalty_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading loyalty settings", error);
    throw error;
  }

  return data as LoyaltySettings | null;
}

export async function saveLoyaltySettings(
  form: LoyaltySettingsFormData,
): Promise<LoyaltySettings> {
  const payload = {
    is_enabled: form.is_enabled,
    points_per_dollar: Math.max(0, normalizeNumber(form.points_per_dollar)),
    rounding_threshold: Math.min(
      0.99,
      Math.max(0, normalizeNumber(form.rounding_threshold)),
    ),
    auto_create_customers: form.auto_create_customers,
    earn_on_ready: form.earn_on_ready,
    earn_on_delivered: form.earn_on_delivered,
  };

  if (form.id) {
    const { data, error } = await supabase
      .from("loyalty_settings")
      .update(payload)
      .eq("id", form.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating loyalty settings", error);
      throw error;
    }

    return data as LoyaltySettings;
  }

  const { data, error } = await supabase
    .from("loyalty_settings")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating loyalty settings", error);
    throw error;
  }

  return data as LoyaltySettings;
}
