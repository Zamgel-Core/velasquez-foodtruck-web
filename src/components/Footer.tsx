// 📍 Ruta: src/components/Footer.tsx

import type { LegalModalType } from "../types";

type FooterProps = {
  setLegalModal: (modal: LegalModalType) => void;
  t: {
    terms: string;
    privacy: string;
    food: string;
  };
};

export function Footer({ setLegalModal, t }: FooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_45%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-7 text-center">
        <a
          href="https://zamgelcore.com"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 rounded-3xl border border-orange-500/20 bg-white/[0.03] px-6 py-4 shadow-[0_0_35px_rgba(249,115,22,0.08)] transition duration-300 hover:scale-[1.02] hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          <img
            src="/images/zamgelcore-zc-logo.png"
            alt="Zamgel Core"
            className="h-14 w-14 object-contain transition duration-300 group-hover:scale-110"
          />

          <div className="text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/35">
              Powered by
            </p>

            <p className="text-xl font-black">
              <span className="text-white">Zamgel</span>{" "}
              <span className="text-orange-400">Core</span>
            </p>
          </div>
        </a>

        <div>
          <p className="text-sm font-semibold text-white/45">
            © 2026 Velasquez Food Truck. All rights reserved.
          </p>

          <p className="mt-2 text-sm text-white/35">
            Digital ordering experience, admin tools and TV menu system.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setLegalModal("terms")}
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-bold text-white/60 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
          >
            {t.terms}
          </button>

          <button
            onClick={() => setLegalModal("privacy")}
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-bold text-white/60 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
          >
            {t.privacy}
          </button>

          <button
            onClick={() => setLegalModal("food")}
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-bold text-white/60 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
          >
            {t.food}
          </button>
        </div>
      </div>
    </footer>
  );
}
