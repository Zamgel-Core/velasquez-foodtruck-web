// 📍 Ruta: src/features/admin/AdminPortalHome.tsx

import React from "react";
import { motion } from "motion/react";
import {
  ClipboardList,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  ArrowRight,
  Truck,
} from "lucide-react";

const adminCards = [
  {
  title: "POS",
  description: "Tomar órdenes presenciales y cobrar clientes.",
  href: "/admin/pos",
  icon: ShoppingCart,
  },
  {
    title: "Órdenes",
    description: "Ver pedidos, clientes, notas y cambiar estados.",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Productos",
    description: "Administrar menú, precios, disponibilidad e imágenes.",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Opciones / Extras",
    description: "Configurar extras, proteínas y modificadores.",
    href: "/admin/product-options",
    icon: SlidersHorizontal,
  },
];

export default function AdminPortalHome() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-200">
              <Truck className="h-4 w-4" />
              Velasquez Admin
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Portal Admin
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/60 sm:text-base">
              Centro de control para pedidos, menú y configuración del food truck.
            </p>
          </div>

          <a
            href="/"
            className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100 sm:block"
          >
            Ver página
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {adminCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.a
                key={card.href}
                href={card.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-orange-500/50 hover:bg-orange-500/[0.08]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-200">
                  <Icon className="h-7 w-7" />
                </div>

                <h2 className="text-xl font-black">{card.title}</h2>

                <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-white/55">
                  {card.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-black text-orange-300">
                  Entrar
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="mt-auto pt-10 text-xs font-semibold text-white/35">
          Zamgel Core × Velasquez Food Truck
        </div>
      </section>
    </main>
  );
}