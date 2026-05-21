// 📍 Ruta: src/features/admin/AdminPortalHome.tsx

import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardList,
  Gift,
  Lock,
  Package,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Share2,
} from "lucide-react";
import { useStaffAuth } from "./auth/useStaffAuth";

const adminCards = [
  {
    title: "POS",
    description: "Tomar órdenes presenciales y cobrar clientes.",
    href: "/admin/pos",
    icon: ShoppingCart,
    roles: ["super_admin", "admin", "employee", "cashier"],
    status: "active",
  },
  {
    title: "Órdenes",
    description: "Ver pedidos, clientes, notas y cambiar estados.",
    href: "/admin/orders",
    icon: ClipboardList,
    roles: ["super_admin", "admin", "employee", "cashier", "kitchen"],
    status: "active",
  },
  {
    title: "Caja",
    description: "Abrir, cerrar y controlar cortes de caja.",
    href: "/admin/register",
    icon: Wallet,
    roles: ["super_admin", "admin", "cashier"],
    status: "active",
  },
  {
    title: "Reportes",
    description: "Ventas, métricas, cortes y análisis del negocio.",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Productos",
    description: "Administrar menú, precios, disponibilidad e imágenes.",
    href: "/admin/products",
    icon: Package,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Opciones / Extras",
    description: "Configurar extras, proteínas y modificadores.",
    href: "/admin/product-options",
    icon: SlidersHorizontal,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Staff",
    description: "Administrar empleados, roles y accesos del sistema.",
    href: "/admin/staff",
    icon: Users,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Redes Sociales",
    description: "Agregar videos de TikTok para mostrarlos en la página.",
    href: "/admin/social-videos",
    icon: Share2,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Inventario",
    description:
      "Control de stock, ingredientes, mínimos y alertas operativas.",
    href: "/admin/inventory",
    icon: Package,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Lealtad",
    description:
      "Clientes frecuentes, puntos manuales, niveles y recompensas futuras.",
    href: "/admin/loyalty",
    icon: Gift,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Kaizen IA",
    description:
      "IA estratégica para ayudarte a administrar y optimizar tu food truck.",
    href: "/admin/kaizen",
    icon: Brain,
    roles: ["super_admin", "admin"],
    status: "active",
  },
  {
    title: "Ajustes",
    description:
      "Configurar página, sonidos, TV Menu, radio de órdenes y negocio.",
    href: "/admin/settings",
    icon: Settings,
    roles: ["super_admin", "admin"],
    status: "active",
  },
];

export default function AdminPortalHome() {
  const { role, profile } = useStaffAuth();

  const normalizedRole = role === "super_admin" ? "admin" : role;

  const visibleCards = adminCards.filter((card) =>
    card.roles.includes(normalizedRole ?? "employee"),
  );

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
              {role === "admin" || role === "super_admin"
                ? "Centro de control para pedidos, menú, staff, reportes y futuras herramientas del food truck."
                : `Bienvenido${profile?.full_name ? `, ${profile.full_name}` : ""}. Accede a tus herramientas de trabajo.`}
            </p>
          </div>

          <a
            href="/"
            className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100 sm:block"
          >
            Ver página
          </a>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
          <Sparkles className="h-4 w-4 text-orange-400" />
          Herramientas disponibles
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {visibleCards.map((card, index) => {
            const Icon = card.icon;
            const isLocked = card.status === "coming_soon";

            if (isLocked) {
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 opacity-75 shadow-2xl shadow-black/30"
                >
                  <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    <Lock className="h-3 w-3" />
                    Próximamente
                  </div>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/45">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h2 className="text-xl font-black text-white/70">
                    {card.title}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-white/40">
                    {card.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-black text-white/30">
                    En construcción
                    <Lock className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.a
                key={card.href}
                href={card.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
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
          Velasquez Food Truck × Zamgel Core
        </div>
      </section>
    </main>
  );
}
