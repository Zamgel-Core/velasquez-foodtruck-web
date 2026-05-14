import { Menu, X } from "lucide-react";
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
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
  onClick={() => scrollTo("home")}
  onDoubleClick={() => {
    window.location.href = "/admin";
  }}
  className="flex items-center gap-3"
>
          <img
            src="/images/velasquez-logo.png"
            alt="Velasquez Food Truck"
            className="h-12 w-12 rounded-full object-contain"
          />
          <div className="text-left">
            <p className="text-sm font-black tracking-wide sm:text-base">Velasquez</p>
            <p className="text-xs text-orange-400">Food Truck</p>
          </div>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          <button onClick={() => scrollTo("home")} className="hover:text-orange-400">{t.navHome}</button>
          <button onClick={() => scrollTo("menu")} className="hover:text-orange-400">{t.navMenu}</button>
          <button onClick={() => scrollTo("location")} className="hover:text-orange-400">{t.navLocation}</button>
          <button onClick={() => scrollTo("contact")} className="hover:text-orange-400">{t.navContact}</button>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="rounded-full border border-orange-500/40 px-3 py-1 text-sm font-bold text-orange-300"
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
            <button onClick={() => scrollTo("location")}>{t.navLocation}</button>
            <button onClick={() => scrollTo("contact")}>{t.navContact}</button>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="rounded-full bg-orange-600 px-4 py-2 font-bold"
            >
              {lang === "es" ? "English" : "Español"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
