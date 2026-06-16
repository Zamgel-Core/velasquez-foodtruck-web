import type { LegalModalType } from "../types";

type LegalModalProps = {
  legalModal: Exclude<LegalModalType, null>;
  setLegalModal: (modal: LegalModalType) => void;
  title: string;
  text: string;
  closeLabel: string;
};

export function LegalModal({ legalModal, setLegalModal, title, text, closeLabel }: LegalModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-4 text-white/70">{text}</p>
        <button
          onClick={() => setLegalModal(null)}
          className="mt-6 w-full rounded-full bg-red-600 px-5 py-3 font-black"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
