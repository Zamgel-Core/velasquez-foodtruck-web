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
    <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/55">
      <p>© 2026 Velasquez Food Truck. All rights reserved.</p>
      <p className="mt-1">Powered by Zamgel Core</p>
      <div className="mt-5 flex flex-wrap justify-center gap-4">
        <button onClick={() => setLegalModal("terms")}>{t.terms}</button>
        <button onClick={() => setLegalModal("privacy")}>{t.privacy}</button>
        <button onClick={() => setLegalModal("food")}>{t.food}</button>
      </div>
    </footer>
  );
}
