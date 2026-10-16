// 📍 Ruta: src/components/Hero.tsx

import {
  AlertTriangle,
  Flame,
  Navigation,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { mapsUrl } from "../data/business";
import { OrderingButtons } from "./OrderingButtons";
import type { Lang } from "../types";

type HeroProps = {
  lang: Lang;
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

export function Hero({ lang, businessStatus, t }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const titleLines = [t.hero1, t.hero2, t.hero3];

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

          <h1 className="relative max-w-full text-[clamp(2.5rem,10.2vw,4.3rem)] font-black uppercase leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
            {titleLines.map((line, index) => (
              <motion.span
                key={`${index}-${line}`}
                className={`relative block w-fit max-w-full whitespace-nowrap ${
                  index === 0 ? "text-white" : "text-red-500"
                }`}
                initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.14 + index * 0.18 }}
              >
                {index > 0 ? (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 select-none text-red-500 blur-[15px]"
                    initial={false}
                    animate={reduceMotion ? { opacity: 0.24 } : { opacity: [0.22, 0.52, 0.22] }}
                    transition={reduceMotion ? undefined : { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                  >
                    {line}
                  </motion.span>
                ) : null}
                <span className="relative">{line}</span>
              </motion.span>
            ))}
            <motion.div
              aria-hidden="true"
              className="mt-4 h-[3px] w-36 origin-left rounded-full bg-gradient-to-r from-red-600 via-orange-400 to-transparent shadow-[0_0_18px_rgba(239,68,68,0.6)] sm:w-48"
              initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.8 }}
            />
          </h1>

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

            <OrderingButtons lang={lang} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
