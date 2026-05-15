// 📍 Ruta: src/features/admin/auth/auth.service.ts

import { supabase } from "../../../lib/supabase";

export async function signInStaff(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutStaff() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentStaffProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return {
    user,
    profile: data,
  };
}