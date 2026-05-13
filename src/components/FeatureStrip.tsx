import { Clock, Flame, Heart, Leaf } from "lucide-react";
import type { Lang } from "../types";

export function FeatureStrip({ lang }: { lang: Lang }) {
  const features = [
    [Clock, lang === "es" ? "Hecho al Momento" : "Made to Order"],
    [Flame, lang === "es" ? "Auténtico Sabor" : "Authentic Flavor"],
    [Leaf, lang === "es" ? "Ingredientes Frescos" : "Fresh Ingredients"],
    [Heart, lang === "es" ? "Hecho con Pasión" : "Made with Passion"],
  ] as const;

  return (
    <section className="border-y border-white/10 bg-zinc-950 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([Icon, label]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <Icon className="mx-auto mb-3 text-orange-500" />
            <p className="font-black">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
