// 📍 Ruta: src/components/Navbar.tsx

import { useRef } from "react";
import { Gift, Menu, PackageSearch, X } from "lucide-react";
import type { Lang } from "../types";

type NavbarProps = {
  lang: Lang;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  setLang: (value: Lang) => void;
  scrollTo: (id: string) => void;
  t: {
    navHome: string;
    navMenu: string;
    navLocation: string;
    navContact: string;
    navLoyalty: string;
  };
};

export function Navbar({
  lang,
  isMenuOpen,
  setIsMenuOpen,
  setLang,
  scrollTo,
  t,
}: NavbarProps) {
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<number | null>(null);
  const adminPressTimer = useRef<number | null>(null);

  const goToAdmin = () => {
    window.location.assign("/admin");
  };

  const handleLogoClick = () => {
    logoTapCount.current += 1;

    if (logoTapTimer.current) {
      window.clearTimeout(logoTapTimer.current);
    }

    if (logoTapCount.current >= 2) {
      logoTapCount.current = 0;
      goToAdmin();
      return;
    }

    logoTapTimer.current = window.setTimeout(() => {
      logoTapCount.current = 0;
      scrollTo("home");
    }, 280);
  };

  const startAdminPress = () => {
    adminPressTimer.current = window.setTimeout(goToAdmin, 1200);
  };

  const cancelAdminPress = () => {
    if (adminPressTimer.current) {
      window.clearTimeout(adminPressTimer.current);
      adminPressTimer.current = null;
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={handleLogoClick}
          onPointerDown={startAdminPress}
          onPointerUp={cancelAdminPress}
          onPointerLeave={cancelAdminPress}
          onPointerCancel={cancelAdminPress}
          className="flex items-center gap-3"
        >
          <img
            src="/images/velasquez-logo.png"
            alt="Velasquez Food Truck"
            className="h-12 w-12 rounded-full object-contain"
          />

          <div className="text-left">
            <p className="text-sm font-black tracking-wide sm:text-base">
              Velasquez
            </p>
            <p className="text-xs text-red-400">Food Truck</p>
          </div>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          <button
            onClick={() => scrollTo("home")}
            className="hover:text-red-400"
          >
            {t.navHome}
          </button>

          <button
            onClick={() => scrollTo("menu")}
            className="hover:text-red-400"
          >
            {t.navMenu}
          </button>

          <button
            onClick={() => scrollTo("location")}
            className="hover:text-red-400"
          >
            {t.navLocation}
          </button>

          <button
            onClick={() => scrollTo("contact")}
            className="hover:text-red-400"
          >
            {t.navContact}
          </button>

          <button
            onClick={() => scrollTo("lealtad")}
            className="inline-flex items-center gap-2 font-bold text-red-100 transition hover:text-red-400"
          >
            <Gift className="h-4 w-4" />
            {t.navLoyalty}
          </button>

          <a
            href="/mi-pedido"
            className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-red-500/20"
          >
            <PackageSearch className="h-4 w-4" />
            {lang === "es" ? "Mi Pedido" : "My Order"}
          </a>

          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="rounded-full border border-red-500/40 px-3 py-1 text-sm font-bold text-red-200"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-xl border border-white/10 p-2 md:hidden"
          aria-label="Open menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <button onClick={() => scrollTo("home")}>{t.navHome}</button>
            <button onClick={() => scrollTo("menu")}>{t.navMenu}</button>
            <button onClick={() => scrollTo("lealtad")} className="inline-flex items-center justify-center gap-2 font-bold text-red-100">
              <Gift className="h-4 w-4" />
              {t.navLoyalty}
            </button>
            <button onClick={() => scrollTo("location")}>
              {t.navLocation}
            </button>
            <button onClick={() => scrollTo("contact")}>{t.navContact}</button>

            <a
              href="/mi-pedido"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-100"
            >
              <PackageSearch className="h-4 w-4" />
              {lang === "es" ? "Mi Pedido" : "My Order"}
            </a>

            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="rounded-full bg-red-600 px-4 py-2 font-bold"
            >
              {lang === "es" ? "English" : "Español"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
