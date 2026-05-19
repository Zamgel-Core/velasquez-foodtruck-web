// 📍 Ruta: src/utils/businessStatus.ts

import type { Lang } from "../types";
import { type BusinessHoursDay, defaultBusinessHours } from "../features/admin/settings/admin-settings.service";

const weekdayKeyByShortName: Record<string, string> = {
  Sun: "sunday",
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
};

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function formatBusinessTime(value: string, lang: Lang) {
  const [hourText = "0", minuteText = "0"] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (lang === "en") {
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  }

  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatBusinessHours(day: BusinessHoursDay, lang: Lang) {
  if (!day.is_open) return lang === "es" ? "Cerrado" : "Closed";
  return `${formatBusinessTime(day.open_time, lang)} – ${formatBusinessTime(day.close_time, lang)}`;
}

export function getBusinessStatus(
  lang: Lang,
  businessHours: BusinessHoursDay[] = defaultBusinessHours,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  const current = hour * 60 + minute;
  const todayKey = weekdayKeyByShortName[weekday] ?? "sunday";
  const today = businessHours.find((day) => day.key === todayKey);

  if (!today?.is_open) {
    return {
      isOpen: false,
      isClosingSoon: false,
      label: lang === "es" ? "Cerrado ahora en Houston" : "Closed now in Houston",
      todayLabel: lang === "es" ? "Hoy cerrado" : "Closed today",
    };
  }

  const open = timeToMinutes(today.open_time);
  const close = timeToMinutes(today.close_time);
  const isOpen = current >= open && current < close;
  const minutesUntilClose = isOpen ? close - current : 0;
  const isClosingSoon = isOpen && minutesUntilClose <= 60;

  const formatRemaining = () => {
    if (minutesUntilClose < 60) {
      return lang === "es"
        ? `Cierra en ${minutesUntilClose} min`
        : `Closing in ${minutesUntilClose} min`;
    }

    const hours = Math.floor(minutesUntilClose / 60);
    const mins = minutesUntilClose % 60;

    return lang === "es"
      ? `Cierra en ${hours}h ${mins}m`
      : `Closing in ${hours}h ${mins}m`;
  };

  const label = isOpen
    ? isClosingSoon
      ? formatRemaining()
      : lang === "es"
        ? "Abierto ahora en Houston"
        : "Open now in Houston"
    : lang === "es"
      ? "Cerrado ahora en Houston"
      : "Closed now in Houston";

  return {
    isOpen,
    isClosingSoon,
    label,
    todayLabel: formatBusinessHours(today, lang),
  };
}
