// 📍 Ruta: src/hooks/useBusinessSettings.ts

import React from "react";
import {
  defaultAdminSettings,
  getPublicBusinessSettings,
  readCachedBusinessSettings,
  type AdminSettings,
} from "../features/admin/settings/admin-settings.service";

export function useBusinessSettings() {
  const [settings, setSettings] = React.useState<AdminSettings>(() => {
    if (typeof window === "undefined") return defaultAdminSettings;
    return readCachedBusinessSettings() ?? defaultAdminSettings;
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refreshSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPublicBusinessSettings();
      setSettings(data);
      return data;
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los ajustes públicos.");
      const cached = readCachedBusinessSettings();
      if (cached) setSettings(cached);
      return cached ?? defaultAdminSettings;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return {
    settings,
    isLoading,
    error,
    refreshSettings,
  };
}
