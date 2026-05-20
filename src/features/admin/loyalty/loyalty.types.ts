// 📍 Ruta: src/features/admin/loyalty/loyalty.types.ts

export type LoyaltyTierKey = "bronze" | "silver" | "gold" | "vip";

export type LoyaltyCustomer = {
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

export type LoyaltyMovementType = "add" | "subtract" | "set";

export type LoyaltyMovement = {
  id: string;
  customer_id: string;
  movement_type: LoyaltyMovementType;
  points_before: number;
  points_after: number;
  points_delta: number;
  reason: string | null;
  source_order_number?: string | null;
  order_total?: number | null;
  created_at: string;
  customer?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

export type LoyaltyCustomerFormData = {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  points: string;
  visits: string;
  lifetime_spend: string;
  notes: string;
  is_active: boolean;
};

export type LoyaltyPointsFormData = {
  customer_id: string;
  movement_type: LoyaltyMovementType;
  points: string;
  reason: string;
};

export type LoyaltyRewardType =
  | "free_item"
  | "fixed_discount"
  | "percent_discount";
export type LoyaltyRewardStatus = "active" | "inactive";

export type LoyaltyReward = {
  id: string;
  title: string;
  description: string | null;
  reward_type: LoyaltyRewardType;
  points_required: number;
  min_tier: LoyaltyTierKey;
  value_amount: number;
  product_label: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
  reward_product_id: string | null;
  reward_product_name: string | null;
};

export type LoyaltyRewardFormData = {
  id?: string;
  title: string;
  description: string;
  reward_type: LoyaltyRewardType;
  points_required: string;
  min_tier: LoyaltyTierKey;
  value_amount: string;
  product_label: string;
  is_active: boolean;
  sort_order: string;
  reward_product_id?: string;
  reward_product_name?: string;
};

export type LoyaltySettings = {
  id: string;
  is_enabled: boolean;
  points_per_dollar: number;
  rounding_threshold: number;
  auto_create_customers: boolean;
  earn_on_ready: boolean;
  earn_on_delivered: boolean;
  updated_at: string;
};

export type LoyaltySettingsFormData = {
  id?: string;
  is_enabled: boolean;
  points_per_dollar: string;
  rounding_threshold: string;
  auto_create_customers: boolean;
  earn_on_ready: boolean;
  earn_on_delivered: boolean;
};

export type LoyaltyRewardAvailability = {
  reward: LoyaltyReward;
  customer: LoyaltyCustomer;
  available: boolean;
  reason: string | null;
};

export type LoyaltyRedeemRewardInput = {
  customerPhone: string;
  rewardId: string;
  orderNumber: string;
  orderTotal: number;
  source: "admin_pos";
};

export type LoyaltyRedeemRewardResult = {
  redeemed: boolean;
  pointsDeducted: number;
  discountAmount: number;
  label: string;
  rewardType: LoyaltyRewardType;
  customerId: string | null;
};
