// 📍 Ruta: src/components/OnlineOrderingModal.tsx
import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, Truck, X } from "lucide-react";
import type { Lang } from "../types";
import { ORDERING_LINKS } from "../config/ordering";

export function OnlineOrderingModal({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); };
  }, [open]);
  function dismiss() {
    setOpen(false);
  }
  if (!open) return null;
  const es = lang === "es";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="ordering-title" className="relative my-auto w-full max-w-md rounded-3xl border border-red-500/35 bg-zinc-950 p-6 text-white shadow-2xl shadow-red-950/50 sm:p-8">
        <button type="button" onClick={dismiss} aria-label={es ? "Cerrar" : "Close"} className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={22}/></button>
        <img src="/images/velasquez-logo.png" alt="Velasquez Food Truck" className="mx-auto mb-4 h-20 w-20 object-contain" />
        <h2 id="ordering-title" className="text-center text-2xl font-black sm:text-3xl">{es ? "¡Ordena en línea!" : "Order online!"}</h2>
        <p className="mt-3 text-center text-sm text-white/70">{es ? "Haz tu pedido fácilmente desde nuestro menú oficial en Clover." : "Place your order easily through our official Clover menu."}</p>
        <a href={ORDERING_LINKS.clover} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-center font-black transition hover:bg-red-500"><ShoppingBag size={20}/>{es ? "Ordenar en Clover" : "Order on Clover"}<ExternalLink size={16}/></a>
        <p className="mt-6 text-center text-sm text-white/70">{es ? "También puedes pedir a domicilio por:" : "You can also order delivery through:"}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href={ORDERING_LINKS.doordash} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm font-bold hover:bg-white/20"><Truck size={17}/>DoorDash</a>
          <a href={ORDERING_LINKS.ubereats} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm font-bold hover:bg-white/20"><Truck size={17}/>Uber Eats</a>
        </div>
        <button type="button" onClick={dismiss} className="mt-6 w-full text-center text-sm font-semibold text-white/65 underline underline-offset-4 hover:text-white">{es ? "Seguir explorando la página" : "Continue exploring the website"}</button>
      </section>
    </div>
  );
}
