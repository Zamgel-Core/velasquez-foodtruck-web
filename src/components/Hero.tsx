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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
      >
        <div className="max-w-2xl">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-sm ${
              businessStatus.isOpen
                ? businessStatus.isClosingSoon
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300 shadow-yellow-500/10"
                  : "border-orange-500/40 bg-orange-500/10 text-orange-300 shadow-orange-500/10"
                : "border-red-500/40 bg-red-500/10 text-red-300 shadow-red-500/10"
            }`}
          >
            {businessStatus.isClosingSoon ? (
              <AlertTriangle size={18} />
            ) : (
              <Flame size={18} />
            )}

            <span className="animate-pulse">{t.openNow}</span>
          </div>

          <h1 className="max-w-[95vw] text-4xl font-black leading-none tracking-tight min-[380px]:text-5xl sm:text-7xl lg:text-8xl">
            {t.hero1}
            <br />

            <span className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">
              {t.hero2}
            </span>

            <br />
            {t.hero3}
          </h1>

          <p className="mt-6 max-w-xl text-base text-white/75 sm:text-xl">
            {t.heroText}
          </p>

          <div className="mt-8 flex w-full max-w-[95vw] flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-4 font-black shadow-[0_0_25px_rgba(234,88,12,0.45)] transition hover:scale-105"
            >
              <Navigation size={20} />
              {t.viewLocation}
            </a>

            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-4 font-black transition hover:scale-105 hover:bg-white/15"
            >
              <Phone size={20} />
              {t.call}
            </a>

            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-black transition hover:scale-105"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
