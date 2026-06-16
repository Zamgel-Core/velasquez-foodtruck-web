// 📍 Ruta: src/features/admin/app-mode/AppModePage.tsx

import React from "react";
import {
  Activity,
  CheckCircle2,
  Clipboard,
  Download,
  Globe2,
  RefreshCw,
  Rocket,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  applyAppUpdate,
  checkAppVersion,
  formatDateTime,
  getStoredAppVersion,
  type AppVersionInfo,
} from "../../../utils/pwaVersion";
import {
  buildDiagnosticText,
  downloadDiagnosticFile,
  getDeviceDiagnostic,
  type DeviceDiagnostic,
} from "../../../utils/deviceDiagnostic";

type CheckState = "idle" | "checking" | "updated" | "available" | "error";

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "yellow" | "red" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    green: "border-green-500/30 bg-green-500/10 text-green-200",
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    neutral: "border-white/10 bg-white/[0.04] text-white/70",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function InfoRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className={`text-right text-sm ${strong ? "font-black text-white" : "font-bold text-white/80"}`}>
        {value}
      </span>
    </div>
  );
}

export default function AppModePage() {
  const [current, setCurrent] = React.useState<AppVersionInfo>(() =>
    getStoredAppVersion(),
  );
  const [latest, setLatest] = React.useState<AppVersionInfo | null>(null);
  const [checkedAt, setCheckedAt] = React.useState<string | null>(null);
  const [state, setState] = React.useState<CheckState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [diagnostic, setDiagnostic] = React.useState<DeviceDiagnostic>(() =>
    getDeviceDiagnostic(),
  );

  const runCheck = React.useCallback(async () => {
    setState("checking");
    setError(null);
    setDiagnostic(getDeviceDiagnostic());

    const result = await checkAppVersion();

    setCurrent(result.current);
    setLatest(result.latest);
    setCheckedAt(result.checkedAt);

    if (result.error) {
      setError(result.error);
      setState("error");
      return;
    }

    setState(result.updateAvailable ? "available" : "updated");
  }, []);

  React.useEffect(() => {
    runCheck();

    const handleOnlineChange = () => setDiagnostic(getDeviceDiagnostic());
    const handleResize = () => setDiagnostic(getDeviceDiagnostic());

    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [runCheck]);

  const diagnosticText = React.useMemo(
    () =>
      buildDiagnosticText({
        current,
        latest,
        checkedAt: checkedAt ? formatDateTime(checkedAt) : null,
        diagnostic,
      }),
    [checkedAt, current, diagnostic, latest],
  );

  const isPwa = diagnostic.mode === "pwa";
  const updateAvailable = state === "available" && latest;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-8 rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-950/25 via-black to-black p-6 shadow-2xl shadow-red-950/20 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200">
            <Smartphone className="h-4 w-4" />
            Modo APP
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Centro de aplicación
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">
                Revisa si Velasquez Food Truck está instalado como app, verifica
                actualizaciones y copia un diagnóstico rápido para soporte técnico.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill tone={isPwa ? "green" : "neutral"}>
                {isPwa ? "APP instalada" : "Navegador"}
              </StatusPill>
              <StatusPill tone={diagnostic.online ? "green" : "red"}>
                {diagnostic.online ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" />
                )}
                {diagnostic.online ? "En línea" : "Sin conexión"}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/30 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <Rocket className="h-5 w-5 text-red-300" />
                  Estado de versión
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  La app compara la versión instalada contra el archivo público
                  de versión.
                </p>
              </div>

              <button
                type="button"
                onClick={runCheck}
                disabled={state === "checking"}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${state === "checking" ? "animate-spin" : ""}`}
                />
                Revisar
              </button>
            </div>

            <div
              className={`mb-5 rounded-3xl border p-5 ${
                state === "available"
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : state === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-green-500/25 bg-green-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 rounded-full p-2 ${
                    state === "available"
                      ? "bg-yellow-500/15 text-yellow-200"
                      : state === "error"
                        ? "bg-red-500/15 text-red-200"
                        : "bg-green-500/15 text-green-200"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-black uppercase tracking-[0.16em]">
                    {state === "checking"
                      ? "Buscando actualización..."
                      : state === "available"
                        ? "Actualización disponible"
                        : state === "error"
                          ? "Error al verificar"
                          : "Aplicación actualizada"}
                  </h3>
                  <p className="mt-1 text-sm text-white/65">
                    {state === "available" && latest
                      ? `La versión ${latest.version} build ${latest.build} está lista para instalar.`
                      : state === "error"
                        ? error || "No se pudo verificar la versión."
                        : "No hay nuevas versiones disponibles."}
                  </p>

                  {checkedAt && (
                    <p className="mt-2 text-xs font-bold text-white/45">
                      Última comprobación: {formatDateTime(checkedAt)}
                    </p>
                  )}
                </div>
              </div>

              {updateAvailable && (
                <button
                  type="button"
                  onClick={async () => {
                    setUpdating(true);
                    await applyAppUpdate(latest);
                  }}
                  disabled={updating}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${updating ? "animate-spin" : ""}`}
                  />
                  {updating ? "Actualizando..." : "Actualizar ahora"}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                  Versión instalada
                </p>
                <p className="mt-3 text-3xl font-black">{current.version}</p>
                <p className="mt-1 text-sm font-bold text-white/55">
                  Build {current.build}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                  Última disponible
                </p>
                <p className="mt-3 text-3xl font-black">
                  {latest?.version || "—"}
                </p>
                <p className="mt-1 text-sm font-bold text-white/55">
                  Build {latest?.build || "—"}
                </p>
              </div>
            </div>

            {latest?.changes && latest.changes.length > 0 && (
              <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-red-200">
                  Novedades
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  {latest.changes.map((change) => (
                    <li key={change}>• {change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/30 sm:p-6">
            <div className="mb-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Activity className="h-5 w-5 text-red-300" />
                Diagnóstico del dispositivo
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Información útil para revisar problemas de instalación, caché o
                conexión.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 px-5">
              <InfoRow
                label="Modo"
                value={isPwa ? "PWA instalada" : "Navegador"}
                strong
              />
              <InfoRow label="Sistema" value={diagnostic.platform} />
              <InfoRow label="Navegador" value={diagnostic.browser} />
              <InfoRow label="Pantalla" value={diagnostic.screen} />
              <InfoRow label="Vista actual" value={diagnostic.viewport} />
              <InfoRow label="Idioma" value={diagnostic.language} />
              <InfoRow
                label="Conexión"
                value={diagnostic.online ? "En línea" : "Sin conexión"}
              />
              <InfoRow
                label="Service Worker"
                value={diagnostic.serviceWorker ? "Disponible" : "No disponible"}
              />
              <InfoRow
                label="Manifest"
                value={diagnostic.manifest ? "Detectado" : "No detectado"}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(diagnosticText);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copiado" : "Copiar diagnóstico"}
              </button>

              <button
                type="button"
                onClick={() => downloadDiagnosticFile(diagnosticText)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100 transition hover:border-red-400/50 hover:bg-red-500/20"
              >
                <Download className="h-4 w-4" />
                Exportar .txt
              </button>
            </div>

            <details className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
              <summary className="cursor-pointer text-sm font-black text-white/70">
                Ver información técnica
              </summary>
              <pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-2xl bg-black p-4 text-xs leading-5 text-white/50">
                {diagnostic.userAgent}
              </pre>
            </details>
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] border border-red-500/15 bg-red-500/10 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Globe2 className="h-5 w-5 text-red-300" />
            Cómo instalar como APP
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <h3 className="font-black">iPhone / iPad</h3>
              <ol className="mt-3 space-y-2 text-sm text-white/65">
                <li>1. Abre el sitio en Safari.</li>
                <li>2. Toca el botón Compartir.</li>
                <li>3. Selecciona “Agregar a pantalla de inicio”.</li>
                <li>4. Abre Velasquez desde el nuevo ícono.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <h3 className="font-black">Android / Windows</h3>
              <ol className="mt-3 space-y-2 text-sm text-white/65">
                <li>1. Abre el sitio en Chrome o Edge.</li>
                <li>2. Busca “Instalar aplicación”.</li>
                <li>3. Confirma la instalación.</li>
                <li>4. Abre Velasquez desde el ícono instalado.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
