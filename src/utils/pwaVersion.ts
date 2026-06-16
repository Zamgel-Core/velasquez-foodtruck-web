// 📍 Ruta: src/utils/pwaVersion.ts

export type AppVersionInfo = {
  version: string;
  build: string;
  releasedAt?: string;
  changes?: string[];
};

export type VersionCheckResult = {
  current: AppVersionInfo;
  latest: AppVersionInfo | null;
  updateAvailable: boolean;
  checkedAt: string;
  error?: string;
};

export const CURRENT_APP_VERSION: AppVersionInfo = {
  version: "1.0.0",
  build: "2026-06-16",
  releasedAt: "2026-06-16",
  changes: [
    "PWA instalable para iPad, Android y escritorio.",
    "Centro Modo APP con verificación de versión.",
    "Diagnóstico del dispositivo para soporte técnico.",
  ],
};

const VERSION_STORAGE_KEY = "vft_app_version_installed";

function normalizeVersion(value?: string | null) {
  return String(value || "0.0.0")
    .trim()
    .replace(/^v/i, "");
}

export function compareVersions(a: string, b: string) {
  const left = normalizeVersion(a).split(".").map((part) => Number(part) || 0);
  const right = normalizeVersion(b).split(".").map((part) => Number(part) || 0);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const l = left[index] || 0;
    const r = right[index] || 0;

    if (l > r) return 1;
    if (l < r) return -1;
  }

  return 0;
}

export function getStoredAppVersion(): AppVersionInfo {
  if (typeof window === "undefined") return CURRENT_APP_VERSION;

  try {
    const raw = window.localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        VERSION_STORAGE_KEY,
        JSON.stringify(CURRENT_APP_VERSION),
      );
      return CURRENT_APP_VERSION;
    }

    return { ...CURRENT_APP_VERSION, ...JSON.parse(raw) };
  } catch {
    return CURRENT_APP_VERSION;
  }
}

export function saveInstalledAppVersion(version: AppVersionInfo) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(version));
  } catch {
    // localStorage puede fallar en modo privado; no bloqueamos la app.
  }
}

export async function checkAppVersion(): Promise<VersionCheckResult> {
  const checkedAt = new Date().toISOString();
  const current = getStoredAppVersion();

  try {
    const response = await fetch(`/version.json?ts=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer version.json (${response.status})`);
    }

    const latest = (await response.json()) as AppVersionInfo;

    const versionChanged =
      compareVersions(latest.version, current.version) > 0 ||
      (latest.version === current.version && latest.build !== current.build);

    return {
      current,
      latest,
      updateAvailable: versionChanged,
      checkedAt,
    };
  } catch (error) {
    return {
      current,
      latest: null,
      updateAvailable: false,
      checkedAt,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo verificar la versión.",
    };
  }
}

export async function applyAppUpdate(latest?: AppVersionInfo | null) {
  const versionToSave = latest || CURRENT_APP_VERSION;

  saveInstalledAppVersion(versionToSave);

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(async (registration) => {
        await registration.update().catch(() => undefined);
      }),
    );
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  window.location.reload();
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
