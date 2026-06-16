// 📍 Ruta: src/utils/deviceDiagnostic.ts

import type { AppVersionInfo } from "./pwaVersion";

export type DeviceDiagnostic = {
  mode: "pwa" | "browser";
  platform: string;
  browser: string;
  online: boolean;
  language: string;
  screen: string;
  viewport: string;
  serviceWorker: boolean;
  manifest: boolean;
  userAgent: string;
};

function detectPlatform(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (/ipad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "iPadOS";
  }

  if (/iphone/.test(ua)) return "iOS";
  if (/android/.test(ua)) return "Android";
  if (/windows/.test(ua)) return "Windows";
  if (/mac os|macintosh/.test(ua)) return "macOS";
  if (/linux/.test(ua)) return "Linux";

  return "Desconocido";
}

function detectBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (/edg\//.test(ua)) return "Microsoft Edge";
  if (/opr\//.test(ua) || /opera/.test(ua)) return "Opera";
  if (/crios/.test(ua)) return "Chrome iOS";
  if (/chrome|chromium/.test(ua)) return "Chrome";
  if (/firefox|fxios/.test(ua)) return "Firefox";
  if (/safari/.test(ua)) return "Safari";

  return "Desconocido";
}

export function getDeviceDiagnostic(): DeviceDiagnostic {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "Unavailable";

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  const width = typeof window !== "undefined" ? window.innerWidth : 0;
  const height = typeof window !== "undefined" ? window.innerHeight : 0;

  return {
    mode: isStandalone ? "pwa" : "browser",
    platform: detectPlatform(userAgent),
    browser: detectBrowser(userAgent),
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    language: typeof navigator !== "undefined" ? navigator.language : "—",
    screen:
      typeof window !== "undefined"
        ? `${window.screen.width} × ${window.screen.height}`
        : "—",
    viewport: width && height ? `${width} × ${height}` : "—",
    serviceWorker:
      typeof navigator !== "undefined" && "serviceWorker" in navigator,
    manifest:
      typeof document !== "undefined" &&
      Boolean(document.querySelector('link[rel="manifest"]')),
    userAgent,
  };
}

export function buildDiagnosticText(params: {
  businessName?: string;
  current?: AppVersionInfo;
  latest?: AppVersionInfo | null;
  checkedAt?: string | null;
  diagnostic: DeviceDiagnostic;
}) {
  const { businessName = "Velasquez Food Truck", current, latest, checkedAt, diagnostic } =
    params;

  return [
    businessName,
    "",
    `Versión instalada: ${current?.version || "—"}`,
    `Build instalado: ${current?.build || "—"}`,
    `Última versión: ${latest?.version || "—"}`,
    `Último build: ${latest?.build || "—"}`,
    `Última comprobación: ${checkedAt || "—"}`,
    "",
    `Modo: ${diagnostic.mode === "pwa" ? "PWA instalada" : "Navegador"}`,
    `Sistema: ${diagnostic.platform}`,
    `Navegador: ${diagnostic.browser}`,
    `Pantalla: ${diagnostic.screen}`,
    `Vista actual: ${diagnostic.viewport}`,
    `Idioma: ${diagnostic.language}`,
    `Conexión: ${diagnostic.online ? "En línea" : "Sin conexión"}`,
    `Service Worker: ${diagnostic.serviceWorker ? "Disponible" : "No disponible"}`,
    `Manifest: ${diagnostic.manifest ? "Detectado" : "No detectado"}`,
    "",
    "User Agent:",
    diagnostic.userAgent,
  ].join("\n");
}

export function downloadDiagnosticFile(content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "velasquez-app-diagnostic.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
