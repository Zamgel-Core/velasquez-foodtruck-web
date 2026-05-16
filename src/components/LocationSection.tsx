// 📍 Ruta: src/components/LocationSection.tsx

import { Clock, MapPin, Navigation, Phone, Store } from "lucide-react";
import { mapEmbed } from "../data/business";
import type { Lang } from "../types";

export function LocationSection({
  lang,
  title,
}: {
  lang: Lang;
  title: string;
}) {
  const isSpanish = lang === "es";

  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Velasquez%20Food%20Truck%2C%2010010%20Beechnut%20St%2C%20Houston%2C%20TX%2077072";

  const phoneNumber = "+13468608728";

  const hours = isSpanish
    ? [
        ["Dom", "Cerrado"],
        ["Lun", "11:00 a.m. – 10:00 p.m."],
        ["Mar", "11:00 a.m. – 10:00 p.m."],
        ["Mié", "11:00 a.m. – 10:00 p.m."],
        ["Jue", "11:00 a.m. – 10:00 p.m."],
        ["Vie", "11:00 a.m. – 11:00 p.m."],
        ["Sáb", "11:00 a.m. – 11:00 p.m."],
      ]
    : [
        ["Sun", "Closed"],
        ["Mon", "11:00 AM – 10:00 PM"],
        ["Tue", "11:00 AM – 10:00 PM"],
        ["Wed", "11:00 AM – 10:00 PM"],
        ["Thu", "11:00 AM – 10:00 PM"],
        ["Fri", "11:00 AM – 11:00 PM"],
        ["Sat", "11:00 AM – 11:00 PM"],
      ];

  return (
    <section id="location" className="relative overflow-hidden px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_35%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-300">
            <MapPin className="h-4 w-4" />
            {isSpanish ? "Ubicación" : "Location"}
          </div>

          <h2 className="mt-5 text-4xl font-black sm:text-5xl">{title}</h2>

          <p className="mt-3 text-white/65">
            {isSpanish
              ? "10010 Beechnut St, Houston, TX 77072"
              : "10010 Beechnut St, Houston, TX 77072"}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-orange-500/40 hover:bg-orange-500/10"
            >
              <Navigation className="h-6 w-6 text-orange-400" />
              <p className="mt-3 text-lg font-black">
                {isSpanish ? "Cómo llegar" : "Get directions"}
              </p>
              <p className="mt-1 text-sm text-white/55">
                {isSpanish ? "Abrir en Google Maps" : "Open in Google Maps"}
              </p>
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-orange-500/40 hover:bg-orange-500/10"
            >
              <Phone className="h-6 w-6 text-orange-400" />
              <p className="mt-3 text-lg font-black">
                {isSpanish ? "Llámanos" : "Call us"}
              </p>
              <p className="mt-1 text-sm text-white/55">+1 (346) 860-8728</p>
            </a>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black">
              <Clock className="h-6 w-6 text-orange-500" />
              {isSpanish ? "Horario" : "Hours"}
            </h3>

            <div className="grid gap-2 sm:grid-cols-2">
              {hours.map(([day, time]) => (
                <div
                  key={day}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/25 px-4 py-3"
                >
                  <span className="font-black text-orange-300">{day}</span>
                  <span className="text-sm font-semibold text-white/70">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-orange-500/15 bg-zinc-900 shadow-[0_0_45px_rgba(249,115,22,0.12)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/35 px-5 py-4">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-orange-400" />
              <p className="font-black">Velasquez Food Truck</p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-orange-600 px-4 py-2 text-sm font-black transition hover:bg-orange-500"
            >
              {isSpanish ? "Ir" : "Go"}
            </a>
          </div>

          <iframe
            title="Velasquez Food Truck location"
            src={mapEmbed}
            className="h-[520px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
