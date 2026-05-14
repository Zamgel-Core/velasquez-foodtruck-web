// 📍 Ruta: src/features/admin/auth/useStaffAuth.ts

import React from "react";
import { supabase } from "../../../lib/supabase";
import { getCurrentStaffProfile, signOutStaff } from "./auth.service";

export type StaffRole = "super_admin" | "admin" | "employee" | "cashier" | "kitchen";

export type StaffProfile = {
  id: string;
  user_id: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function useStaffAuth() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<StaffProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadStaff = React.useCallback(async () => {
    setLoading(true);

    const staff = await getCurrentStaffProfile();

    if (!staff || !staff.profile?.is_active) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(staff.user);
    setProfile(staff.profile as StaffProfile);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadStaff();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadStaff();
    });

    return () => subscription.unsubscribe();
  }, [loadStaff]);

  const logout = async () => {
    await signOutStaff();
    setUser(null);
    setProfile(null);
    window.location.href = "/admin/login";
  };

  return {
    user,
    profile,
    loading,
    isLoggedIn: Boolean(user && profile),
    role: profile?.role ?? null,
    logout,
    reload: loadStaff,
  };
}