// 📍 Ruta: src/components/AppUpdateNotice.tsx

import React from "react";
import { RefreshCw, X } from "lucide-react";
import {
  applyAppUpdate,
  checkAppVersion,
  formatDateTime,
  type AppVersionInfo,
} from "../utils/pwaVersion";
import type { Lang } from "../types";

type Props = {
  lang: Lang;
};

export default function AppUpdateNotice({ lang }: Props) {
  const [latest, setLatest] = React.useState<AppVersionInfo | null>(null);
  const [checkedAt, setCheckedAt] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    checkAppVersion().then((result) => {
      if (!mounted) return;

      setCheckedAt(result.checkedAt);

      if (result.updateAvailable && result.latest) {
        setLatest(result.latest);
        setVisible(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!visible || !latest) return null;

  const title =
    lang === "es" ? "Nueva versión disponible" : "New version available";
  const text =
    lang === "es"
      ? `Versión ${latest.version} está lista para instalar.`
      : `Version ${latest.version} is ready to install.`;
  const updateLabel = lang === "es" ? "Actualizar ahora" : "Update now";
  const laterLabel = lang === "es" ? "Más tarde" : "Later";
  const checkedLabel = lang === "es" ? "Revisado" : "Checked";

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-xl rounded-3xl border border-red-500/35 bg-[#090909]/95 p-4 text-white shadow-2xl shadow-red-950/50 backdrop-blur-xl sm:left-auto sm:w-[420px]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
            Velasquez App
          </div>
          <h3 className="mt-1 text-lg font-black">{title}</h3>
          <p className="mt-1 text-sm text-white/65">{text}</p>
          {checkedAt && (
            <p className="mt-2 text-xs text-white/45">
              {checkedLabel}: {formatDateTime(checkedAt)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
          aria-label={laterLabel}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {latest.changes && latest.changes.length > 0 && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/45">
            {lang === "es" ? "Novedades" : "What's new"}
          </div>
          <ul className="space-y-1 text-xs text-white/65">
            {latest.changes.slice(0, 4).map((change) => (
              <li key={change}>• {change}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={async () => {
            setUpdating(true);
            await applyAppUpdate(latest);
          }}
          disabled={updating}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
          {updating ? (lang === "es" ? "Actualizando..." : "Updating...") : updateLabel}
        </button>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
        >
          {laterLabel}
        </button>
      </div>
    </div>
  );
}
