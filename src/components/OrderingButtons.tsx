// 📍 Ruta: src/components/OrderingButtons.tsx
import { ShoppingBag, Truck } from "lucide-react";
import { ORDERING_LINKS } from "../config/ordering";
import type { Lang } from "../types";

export function OrderingButtons({ lang, className = "" }: { lang: Lang; className?: string }) {
  const es = lang === "es";
  const common = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400";
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`} aria-label={es ? "Plataformas para ordenar" : "Ordering platforms"}>
      <a href={ORDERING_LINKS.clover} target="_blank" rel="noopener noreferrer" className={`${common} bg-red-600 text-white hover:bg-red-500`}><ShoppingBag size={18}/>{es ? "Ordenar en Clover" : "Order on Clover"}</a>
      <a href={ORDERING_LINKS.doordash} target="_blank" rel="noopener noreferrer" className={`${common} border border-white/25 bg-white/10 text-white hover:bg-white/20`}><Truck size={18}/>DoorDash</a>
      <a href={ORDERING_LINKS.ubereats} target="_blank" rel="noopener noreferrer" className={`${common} border border-white/25 bg-white/10 text-white hover:bg-white/20`}><Truck size={18}/>Uber Eats</a>
    </div>
  );
}
