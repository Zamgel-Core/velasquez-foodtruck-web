// 📍 Ruta: src/App.tsx

import {
  AlertTriangle,
  Flame,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { mapsUrl, phone, whatsapp } from "../data/business";

type HeroProps = {
  businessStatus: {
    isOpen: boolean;
    isClosingSoon?: boolean;
    label: string;
  };
  t: {
    openNow: string;
    hero1: string;
    hero2: string;
    hero3: string;
    heroText: string;
    viewLocation: string;
    call: string;
  };
};

export function Hero({ businessStatus, t }: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-black pt-24"
    >
      <div
        className="absolute inset-0 bg-cover bg-[65%_center] sm:bg-center md:bg-[center_right]"
        style={{
          backgroundImage: "url('/images/food-truck-hero.png')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      <div className="absolute left-10 top-32 h-56 w-56 rounded-full bg-red-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
      >
        <div className="max-w-2xl">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 ${
              businessStatus.isOpen
                ? businessStatus.isClosingSoon
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300 shadow-yellow-500/10"
                  : "border-red-500/40 bg-red-500/10 text-red-300 shadow-red-500/10"
                : "border-red-500/40 bg-red-500/10 text-red-300 shadow-red-500/10"
            }`}
          >
            {businessStatus.isClosingSoon ? (
              <AlertTriangle size={18} />
            ) : (
              <Flame size={18} />
            )}

            <span
              className={businessStatus.isClosingSoon ? "animate-pulse" : ""}
            >
              {t.openNow}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="max-w-[95vw] text-4xl font-black leading-none tracking-tight min-[380px]:text-5xl sm:text-7xl lg:text-8xl"
          >
            {t.hero1}
            <br />

            <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              {t.hero2}
            </span>

            <br />
            {t.hero3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-6 max-w-xl text-base text-white/75 sm:text-xl"
          >
            {t.heroText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-8 flex w-full max-w-[95vw] flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 font-black shadow-[0_0_25px_rgba(220,38,38,0.45)] transition hover:-translate-y-1 hover:scale-105 hover:bg-red-500 hover:shadow-[0_0_34px_rgba(220,38,38,0.65)]"
            >
              <Navigation size={20} />
              {t.viewLocation}
            </a>

            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-4 font-black backdrop-blur-sm transition hover:-translate-y-1 hover:scale-105 hover:border-white/25 hover:bg-white/15"
            >
              <Phone size={20} />
              {t.call}
            </a>

            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-black shadow-[0_0_25px_rgba(22,163,74,0.25)] transition hover:-translate-y-1 hover:scale-105 hover:bg-green-500 hover:shadow-[0_0_34px_rgba(22,163,74,0.45)]"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
