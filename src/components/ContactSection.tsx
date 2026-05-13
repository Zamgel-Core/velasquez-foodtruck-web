import { Utensils } from "lucide-react";
import { phone, whatsapp } from "../data/business";

type ContactSectionProps = {
  title: string;
  text: string;
  orderNow: string;
};

export function ContactSection({ title, text, orderNow }: ContactSectionProps) {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-red-900/20 p-8 text-center sm:p-12">
        <Utensils className="mx-auto mb-5 text-orange-400" size={42} />
        <h2 className="text-4xl font-black">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">{text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`tel:${phone}`} className="rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-105">
            {phone}
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-600 px-6 py-4 font-black transition hover:scale-105"
          >
            {orderNow}
          </a>
        </div>
      </div>
    </section>
  );
}
