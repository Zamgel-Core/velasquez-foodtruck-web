// 📍 Ruta: src/features/admin/components/AdminTopbar.tsx

import React from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutGrid,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import AdminUserBadge from "./AdminUserBadge";
import { useStaffAuth } from "../auth/useStaffAuth";

const links = [
  {
    label: "Portal",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    label: "POS",
    href: "/admin/pos",
    icon: ShoppingCart,
  },
  {
  label: "Caja",
  href: "/admin/register",
  icon: WalletCards,
  },
  {
    label: "Órdenes",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    label: "Reportes",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Productos",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Extras",
    href: "/admin/product-options",
    icon: SlidersHorizontal,
  },
];

export default function AdminTopbar() {
  const pathname = window.location.pathname;
  const { role } = useStaffAuth();

  const visibleLinks = links.filter((link) => {
  if (role === "super_admin" || role === "admin") {
    return true;
  }

  if (role === "cashier") {
    return [
      "/admin",
      "/admin/pos",
      "/admin/orders",
      "/admin/register",
    ].includes(link.href);
  }

  if (role === "kitchen") {
    return ["/admin", "/admin/orders"].includes(link.href);
  }

  return ["/admin", "/admin/pos", "/admin/orders"].includes(link.href);
});

  return (
    <div className="sticky top-0 z-50 mb-6 border-b border-orange-500/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 overflow-x-auto px-4 py-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                active
                  ? "border-orange-500/40 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </a>
          );
        })}

        <AdminUserBadge />
      </div>
    </div>
  );
}