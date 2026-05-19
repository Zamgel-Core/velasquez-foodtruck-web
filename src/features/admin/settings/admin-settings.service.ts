// 📍 Ruta: src/features/admin/settings/admin-settings.service.ts

import { supabase } from "../../../lib/supabase";

export type BusinessHoursDay = {
  key: string;
  label: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
};

export type AdminSettings = {
  business_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  google_maps_url: string;
  website_url: string;
  business_hours: BusinessHoursDay[];
  sound_enabled: boolean;
  order_alert_sound_enabled: boolean;
  tiktok_feed_enabled: boolean;
  tv_menu_enabled: boolean;
  tracking_page_enabled: boolean;
  auto_whatsapp_enabled: boolean;
  auto_order_confirmation_message: string;
  auto_ready_message: string;
  auto_closed_message: string;
  brand_primary_color: string;
  brand_accent_color: string;
  brand_notes: string;
};

type AdminSettingsRow = {
  id: string;
  settings: Partial<AdminSettings> | null;
  updated_at: string | null;
};

export const SETTINGS_CACHE_KEY = "velasquez_business_settings_v2";

export const defaultBusinessHours: BusinessHoursDay[] = [
  { key: "monday", label: "Lunes", is_open: true, open_time: "11:00", close_time: "22:00" },
  { key: "tuesday", label: "Martes", is_open: true, open_time: "11:00", close_time: "22:00" },
  { key: "wednesday", label: "Miércoles", is_open: true, open_time: "11:00", close_time: "22:00" },
  { key: "thursday", label: "Jueves", is_open: true, open_time: "11:00", close_time: "22:00" },
  { key: "friday", label: "Viernes", is_open: true, open_time: "11:00", close_time: "23:00" },
  { key: "saturday", label: "Sábado", is_open: true, open_time: "11:00", close_time: "23:00" },
  { key: "sunday", label: "Domingo", is_open: false, open_time: "11:00", close_time: "22:00" },
];

export const defaultAdminSettings: AdminSettings = {
  business_name: "Velasquez Food Truck",
  phone: "+1 (346) 401-9676",
  whatsapp: "+1 (346) 401-9676",
  address: "10010 Beechnut St, Houston, TX 77072",
  google_maps_url: "https://maps.google.com/?q=10010+Beechnut+St,+Houston,+TX+77072",
  website_url: "https://www.velasquezfoodtruck.com",
  business_hours: defaultBusinessHours,
  sound_enabled: true,
  order_alert_sound_enabled: true,
  tiktok_feed_enabled: true,
  tv_menu_enabled: true,
  tracking_page_enabled: true,
  auto_whatsapp_enabled: false,
  auto_order_confirmation_message:
    "Gracias por ordenar en Velasquez Food Truck. Estamos preparando tu pedido con mucho sabor.",
  auto_ready_message:
    "Tu pedido ya está listo. Pasa a recogerlo cuando gustes. ¡Buen provecho!",
  auto_closed_message:
    "Gracias por escribir a Velasquez Food Truck. En este momento estamos cerrados, pero te responderemos en cuanto abramos.",
  brand_primary_color: "#050505",
  brand_accent_color: "#f97316",
  brand_notes:
    "Estilo dark premium negro/naranja, comida real, iluminación cálida, madera oscura y glow naranja.",
};

export function mergeSettings(settings?: Partial<AdminSettings> | null): AdminSettings {
  return {
    ...defaultAdminSettings,
    ...(settings ?? {}),
    business_hours:
      settings?.business_hours && settings.business_hours.length > 0
        ? settings.business_hours.map((day, index) => ({
            ...(defaultBusinessHours[index] ?? day),
            ...day,
          }))
        : defaultBusinessHours,
  };
}

export function normalizePhoneForHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
}

export function buildWhatsAppUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("1") ? digits : `1${digits}`;
  const text = encodeURIComponent(
    message || "Hola, quiero ordenar en Velasquez Food Truck",
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export function readCachedBusinessSettings(): AdminSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { settings?: Partial<AdminSettings> };
    return mergeSettings(parsed.settings);
  } catch {
    localStorage.removeItem(SETTINGS_CACHE_KEY);
    return null;
  }
}

function cacheBusinessSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(
      SETTINGS_CACHE_KEY,
      JSON.stringify({ settings, cached_at: new Date().toISOString() }),
    );
  } catch {
    // Cache is a premium fallback only. If storage fails, the app still works.
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase
    .from("admin_settings")
    .select("id, settings, updated_at")
    .eq("id", "default")
    .maybeSingle<AdminSettingsRow>();

  if (error) {
    console.error("Error loading admin settings:", error);
    throw new Error(
      "No se pudieron cargar los ajustes. Revisa que la tabla admin_settings exista en Supabase.",
    );
  }

  const settings = mergeSettings(data?.settings);
  cacheBusinessSettings(settings);
  return settings;
}

export async function getPublicBusinessSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase
    .from("admin_settings")
    .select("id, settings, updated_at")
    .eq("id", "default")
    .maybeSingle<AdminSettingsRow>();

  if (error) {
    console.warn("Using fallback settings because public settings failed:", error);
    return readCachedBusinessSettings() ?? defaultAdminSettings;
  }

  const settings = mergeSettings(data?.settings);
  cacheBusinessSettings(settings);
  return settings;
}

export async function saveAdminSettings(settings: AdminSettings) {
  const payload = {
    id: "default",
    settings: mergeSettings(settings),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("admin_settings").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    console.error("Error saving admin settings:", error);
    throw new Error("No se pudieron guardar los ajustes.");
  }

  cacheBusinessSettings(payload.settings);
  return true;
}
