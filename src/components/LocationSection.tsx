import { Clock } from "lucide-react";
import { mapEmbed } from "../data/business";
import type { Lang } from "../types";

export function LocationSection({ lang, title }: { lang: Lang; title: string }) {
  const hours =
    lang === "es"
      ? [
          "Domingo: Cerrado",
          "Lunes: 11:00 a.m. – 10:00 p.m.",
          "Martes: 11:00 a.m. – 10:00 p.m.",
          "Miércoles: 11:00 a.m. – 10:00 p.m.",
          "Jueves: 11:00 a.m. – 10:00 p.m.",
          "Viernes: 11:00 a.m. – 11:00 p.m.",
          "Sábado: 11:00 a.m. – 11:00 p.m.",
        ]
      : [
          "Sunday: Closed",
          "Monday: 11:00 AM – 10:00 PM",
          "Tuesday: 11:00 AM – 10:00 PM",
          "Wednesday: 11:00 AM – 10:00 PM",
          "Thursday: 11:00 AM – 10:00 PM",
          "Friday: 11:00 AM – 11:00 PM",
          "Saturday: 11:00 AM – 11:00 PM",
        ];

  return (
    <section id="location" className="px-4 py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-black sm:text-5xl">{title}</h2>
          <p className="mt-4 text-white/65">Houston, Texas</p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
              <Clock className="text-orange-500" />
              {lang === "es" ? "Horario" : "Hours"}
            </h3>
            <div className="space-y-2 text-white/70">
              {hours.map((hour) => (
                <p key={hour}>{hour}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <iframe
            title="Velasquez Food Truck location"
            src={mapEmbed}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
