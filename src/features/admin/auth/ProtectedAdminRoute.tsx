// 📍 Ruta: src/features/admin/auth/ProtectedAdminRoute.tsx

import React from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useStaffAuth, type StaffRole } from "./useStaffAuth";

type Props = {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
};

export default function ProtectedAdminRoute({
  children,
  allowedRoles,
}: Props) {
  const { loading, isLoggedIn, role, reload } = useStaffAuth();
  const [slowCheck, setSlowCheck] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isLoggedIn) {
      window.location.href = "/admin/login";
    }
  }, [loading, isLoggedIn]);

  React.useEffect(() => {
    if (!loading) {
      setSlowCheck(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setSlowCheck(true);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent shadow-lg shadow-red-600/25" />

          <p className="text-sm font-bold text-white/60">
            Verificando acceso...
          </p>

          {slowCheck && (
            <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-left">
              <p className="text-sm font-black text-red-100">
                La verificación está tardando más de lo normal.
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-red-100/65">
                Puede ser conexión lenta, caché de la app o una sesión anterior.
                Puedes intentar revisar de nuevo o volver al login.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={reload}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin/login";
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white/70 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                >
                  Ir al login
                </button>
              </div>
            </div>
          )}
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