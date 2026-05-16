import type { Lang } from "../types";

export function getBusinessStatus(lang: Lang) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  const current = hour * 60 + minute;

  const schedule: Record<string, { open: number; close: number } | null> = {
    Sun: null,
    Mon: { open: 11 * 60, close: 22 * 60 },
    Tue: { open: 11 * 60, close: 22 * 60 },
    Wed: { open: 11 * 60, close: 22 * 60 },
    Thu: { open: 11 * 60, close: 22 * 60 },
    Fri: { open: 11 * 60, close: 23 * 60 },
    Sat: { open: 11 * 60, close: 23 * 60 },
  };

  const today = schedule[weekday || "Sun"];

  const isOpen = !!today && current >= today.open && current < today.close;

  const minutesUntilClose = today && isOpen ? today.close - current : 0;

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
  };
}
