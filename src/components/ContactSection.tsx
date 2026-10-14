// 📍 Ruta: src/components/ContactSection.tsx

import { Utensils } from "lucide-react";
import { OrderingButtons } from "./OrderingButtons";
import type { Lang } from "../types";
import type { AdminSettings } from "../features/admin/settings/admin-settings.service";

type ContactSectionProps = {
  lang: Lang;
  title: string;
  text: string;
  orderNow: string;
  settings: AdminSettings;
};

export function ContactSection({
  lang,
  title,
  text,
  orderNow,
  settings,
}: ContactSectionProps) {

  return (
    <section id="contact" className="px-4 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-500/30 bg-gradient-to-br from-red-600/20 to-red-900/20 p-8 text-center shadow-[0_0_55px_rgba(239,68,68,0.12)] sm:p-12">
        <Utensils className="mx-auto mb-5 text-red-400" size={42} />
        <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-red-200/80">
          {settings.business_name}
        </p>
        <h2 className="text-4xl font-black">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">{text}</p>

        <OrderingButtons lang={lang} className="mt-8" />
      </div>
    </section>
  );
}
