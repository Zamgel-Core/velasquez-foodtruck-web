import { MessageCircle } from "lucide-react";
import { whatsapp } from "../data/business";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-green-600 p-4 text-white shadow-[0_0_25px_rgba(22,163,74,0.65)] transition hover:scale-110"
    >
      <MessageCircle />
    </a>
  );
}
