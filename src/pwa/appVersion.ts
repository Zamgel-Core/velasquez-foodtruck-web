// 📍 Ruta: src/pwa/appVersion.ts

export type AppVersionInfo = {
  version: string;
  build: string;
  label?: string;
  changes?: string[];
};

export type AppVersionStatus = {
  current: AppVersionInfo;
  installed: AppVersionInfo | null;
  hasUpdate: boolean;
  lastCheckedAt: string;
};

export const APP_VERSION_STORAGE_KEY = "vft_app_version";
export const APP_VERSION_LAST_CHECKED_KEY = "vft_app_version_last_checked";

export const FALLBACK_APP_VERSION: AppVersionInfo = {
  version: "1.0.1",
  build: "2026-06-16",
  label: "PWA Version Check",
  changes: [
    "Modo APP con verificación de versión.",
    "App Mode with version checking.",
  ],
};

export function getInstalledVersion(): AppVersionInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(APP_VERSION_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as AppVersionInfo;
  } catch {
    return null;
  }
}

export function saveInstalledVersion(version: AppVersionInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_VERSION_STORAGE_KEY, JSON.stringify(version));
}

export function getLastVersionCheck(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(APP_VERSION_LAST_CHECKED_KEY);
}

export function saveLastVersionCheck(date = new Date()) {
  if (typeof window === "undefined") return date.toISOString();

  const isoDate = date.toISOString();
  window.localStorage.setItem(APP_VERSION_LAST_CHECKED_KEY, isoDate);
  return isoDate;
}

export async function fetchCurrentAppVersion(): Promise<AppVersionInfo> {
  const response = await fetch(`/version.json?v=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar la versión de la app.");
  }

  const data = (await response.json()) as Partial<AppVersionInfo>;

  return {
    version: data.version || FALLBACK_APP_VERSION.version,
    build: data.build || FALLBACK_APP_VERSION.build,
    label: data.label || FALLBACK_APP_VERSION.label,
    changes: Array.isArray(data.changes) ? data.changes : FALLBACK_APP_VERSION.changes,
  };
}

export async function checkAppVersion(): Promise<AppVersionStatus> {
  const current = await fetchCurrentAppVersion();
  const lastCheckedAt = saveLastVersionCheck();
  const installed = getInstalledVersion();

  if (!installed) {
    saveInstalledVersion(current);

    return {
      current,
      installed: current,
      hasUpdate: false,
      lastCheckedAt,
    };
  }

  const hasUpdate =
    installed.version !== current.version || installed.build !== current.build;

  return {
    current,
    installed,
    hasUpdate,
    lastCheckedAt,
  };
}

export async function applyAppUpdate(version?: AppVersionInfo) {
  const nextVersion = version ?? (await fetchCurrentAppVersion());
  saveInstalledVersion(nextVersion);
  saveLastVersionCheck();

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map(async (registration) => {
        try {
          await registration.update();
        } catch (error) {
          console.warn("No se pudo actualizar el service worker:", error);
        }
      }),
    );
  }

  if ("caches" in window) {
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    } catch (error) {
      console.warn("No se pudo limpiar el caché de la app:", error);
    }
  }

  window.location.reload();
}
