// 📍 Ruta: src/App.tsx

import { Clock, Flame, Heart, Leaf } from "lucide-react";
import { motion } from "motion/react";
import type { Lang } from "../types";

export function FeatureStrip({ lang }: { lang: Lang }) {
  const features = [
    [Clock, lang === "es" ? "Hecho al Momento" : "Made to Order"],
    [Flame, lang === "es" ? "Auténtico Sabor" : "Authentic Flavor"],
    [Leaf, lang === "es" ? "Ingredientes Frescos" : "Fresh Ingredients"],
    [Heart, lang === "es" ? "Hecho con Pasión" : "Made with Passion"],
  ] as const;

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-zinc-950 px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([Icon, label], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-orange-500/35 hover:bg-orange-500/[0.06] hover:shadow-orange-950/20"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 text-orange-400 transition group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
              <Icon className="h-6 w-6" />
            </div>

            <p className="font-black text-white">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
