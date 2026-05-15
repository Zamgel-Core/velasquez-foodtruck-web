// 📍 Ruta: src/features/admin/staff/admin-staff.service.ts

import { supabase } from "../../../lib/supabase";
import type { StaffRole } from "../auth/useStaffAuth";

export type StaffMember = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffInput = {
  user_id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
};

export async function getStaffMembers() {
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as StaffMember[];
}

export async function createStaffMember(input: StaffInput) {
  const { data, error } = await supabase
    .from("staff_profiles")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;

  return data as StaffMember;
}

export async function updateStaffMember(
  id: string,
  input: Partial<Omit<StaffInput, "user_id">>
) {
  const { data, error } = await supabase
    .from("staff_profiles")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data as StaffMember;
}