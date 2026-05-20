// 📍 Ruta: src/features/loyalty/loyalty-client.types.ts

export type LoyaltyClientTierKey = "bronze" | "silver" | "gold" | "diamond" | "vip";

export type LoyaltyClientCustomer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  points: number;
  visits: number;
  lifetime_spend: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoyaltyClientMovement = {
  id: string;
  customer_id: string;
  movement_type: "add" | "subtract" | "set";
  points_before: number;
  points_after: number;
  points_delta: number;
  reason: string | null;
  source_order_number?: string | null;
  order_total?: number | null;
  created_at: string;
};

export type LoyaltyClientRewardType =
  | "free_item"
  | "fixed_discount"
  | "percent_discount";

export type LoyaltyClientReward = {
  id: string;
  title: string;
  description: string | null;
  reward_type: LoyaltyClientRewardType;
  points_required: number;
  min_tier: string | null;
  value_amount: number;
  product_label: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type LoyaltyClientLookupResult = {
  customer: LoyaltyClientCustomer;
  movements: LoyaltyClientMovement[];
  rewards: LoyaltyClientReward[];
};
