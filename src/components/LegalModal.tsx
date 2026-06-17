import type { LegalModalType } from "../types";

type LegalModalProps = {
  legalModal: Exclude<LegalModalType, null>;
  setLegalModal: (modal: LegalModalType) => void;
  title: string;
  text: string;
  closeLabel: string;
};

export function LegalModal({ setLegalModal, title, text, closeLabel }: LegalModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70">
          {text}
        </p>
        <button
          onClick={() => setLegalModal(null)}
          className="mt-6 w-full rounded-full bg-red-600 px-5 py-3 font-black transition hover:bg-red-500"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
