// 📍 Ruta: src/components/ContactSection.tsx

import { MessageCircle, Phone, Utensils } from "lucide-react";
import {
  buildWhatsAppUrl,
  normalizePhoneForHref,
  type AdminSettings,
} from "../features/admin/settings/admin-settings.service";

type ContactSectionProps = {
  title: string;
  text: string;
  orderNow: string;
  settings: AdminSettings;
};

export function ContactSection({
  title,
  text,
  orderNow,
  settings,
}: ContactSectionProps) {
  const telHref = normalizePhoneForHref(settings.phone);
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp);

  return (
    <section id="contact" className="px-4 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-red-900/20 p-8 text-center shadow-[0_0_55px_rgba(249,115,22,0.12)] sm:p-12">
        <Utensils className="mx-auto mb-5 text-orange-400" size={42} />
        <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-orange-200/80">
          {settings.business_name}
        </p>
        <h2 className="text-4xl font-black">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">{text}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${telHref}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-105"
          >
            <Phone className="h-5 w-5" />
            {settings.phone}
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-black transition hover:scale-105 hover:bg-green-500"
          >
            <MessageCircle className="h-5 w-5" />
            {orderNow}
          </a>
        </div>
      </div>
    </section>
  );
}
