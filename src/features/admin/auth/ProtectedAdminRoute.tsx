// 📍 Ruta: src/features/admin/auth/ProtectedAdminRoute.tsx

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useStaffAuth, type StaffRole } from "./useStaffAuth";

type Props = {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
};

export default function ProtectedAdminRoute({
  children,
  allowedRoles,
}: Props) {
  const { loading, isLoggedIn, role } = useStaffAuth();

  React.useEffect(() => {
    if (!loading && !isLoggedIn) {
      window.location.href = "/admin/login";
    }
  }, [loading, isLoggedIn]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mb-4 h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

          <p className="text-sm font-bold text-white/60">
            Verificando acceso...
          </p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-300" />

          <h1 className="text-2xl font-black text-red-100">
            Acceso denegado
          </h1>

          <p className="mt-3 text-sm font-semibold text-red-100/70">
            Tu cuenta no tiene permisos para acceder a esta sección.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}