// 📍 Ruta: src/features/admin/components/AdminUserBadge.tsx

import React from "react";
import { LogOut, UserCircle } from "lucide-react";
import { useStaffAuth } from "../auth/useStaffAuth";

export default function AdminUserBadge() {
  const { profile, logout } = useStaffAuth();

  if (!profile) return null;

  return (
    <div className="ml-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <UserCircle className="h-5 w-5 text-orange-300" />

      <div className="hidden leading-tight sm:block">
        <p className="text-xs font-black text-white">{profile.full_name}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
          {profile.role}
        </p>
      </div>

      <button
        onClick={logout}
        className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
        title="Cerrar sesión"
        type="button"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}