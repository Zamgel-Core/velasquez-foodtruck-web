// 📍 Ruta: src/features/cart/components/CheckoutModal.tsx

import { CreditCard, DollarSign, Gift, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Lang } from "../../../types";
import type { CartItem, CheckoutCustomer } from "../cart.types";
import { createOrder } from "../../../services/orders.service";

type PaymentMethod = "cash" | "card";

const CARD_FEE_RATE = 0.0825;

type CheckoutModalProps = {
  lang: Lang;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
};

export default function CheckoutModal({
  lang,
  items,
  subtotal,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    phone: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    title: lang === "es" ? "Finalizar pedido" : "Checkout",
    subtitle:
      lang === "es"
        ? "Confirma tus datos y método de pago."
        : "Confirm your information and payment method.",
    name: lang === "es" ? "Nombre" : "Name",
    phone: lang === "es" ? "Teléfono" : "Phone",
    notes:
      lang === "es"
        ? "Notas generales del pedido: estoy afuera, llamar al llegar, etc."
        : "General order notes: I am outside, call when ready, etc.",
    paymentMethod: lang === "es" ? "Método de pago" : "Payment method",
    cash: lang === "es" ? "Efectivo" : "Cash",
    card: lang === "es" ? "Tarjeta +8.25%" : "Card +8.25%",
    subtotal: "Subtotal",
    cardFee: lang === "es" ? "Cargo tarjeta / servicio" : "Card/service fee",
    total: "Total",
    required:
      lang === "es"
        ? "Nombre y teléfono son requeridos."
        : "Name and phone are required.",
    createError:
      lang === "es"
        ? "No se pudo crear la orden."
        : "Could not create the order.",
    sending: lang === "es" ? "Enviando..." : "Sending...",
    createOrder: lang === "es" ? "Crear pedido" : "Place order",
    close: lang === "es" ? "Cerrar" : "Close",
    cardNotice:
      lang === "es"
        ? "El pago con tarjeta agrega 8.25%."
        : "Card payments include an 8.25% fee.",
    loyaltyTitle: lang === "es" ? "Lealtad automática" : "Automatic loyalty",
    loyaltyText:
      lang === "es"
        ? "Si este teléfono ya existe en Lealtad, se sumarán puntos automáticamente. Si no existe, se creará el cliente."
        : "If this phone already exists in Loyalty, points will be added automatically. If it does not exist, the customer will be created.",
  };

  const feeAmount = useMemo(() => {
    if (paymentMethod !== "card") return 0;
    return Number((subtotal * CARD_FEE_RATE).toFixed(2));
  }, [paymentMethod, subtotal]);

  const total = useMemo(() => {
    return Number((subtotal + feeAmount).toFixed(2));
  }, [subtotal, feeAmount]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!customer.name.trim() || !customer.phone.trim()) {
      setError(t.required);
      return;
    }

    setLoading(true);

    const result = await createOrder(customer, items, subtotal, {
      paymentMethod,
      feeAmount,
      total,
    });

    setLoading(false);

    if (!result.success || !result.orderNumber) {
      setError(result.error || t.createError);
      return;
    }

    onSuccess(result.orderNumber);
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">{t.title}</h3>
            <p className="text-sm text-white/50">{t.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={customer.name}
            onChange={(e) =>
              setCustomer((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder={t.name}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          <input
            value={customer.phone}
            onChange={(e) =>
              setCustomer((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder={t.phone}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-xs text-orange-100">
            <div className="mb-1 flex items-center gap-2 font-black">
              <Gift className="h-4 w-4" />
              {t.loyaltyTitle}
            </div>
            <p className="leading-relaxed text-orange-100/75">{t.loyaltyText}</p>
          </div>

          <textarea
            value={customer.notes}
            onChange={(e) =>
              setCustomer((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder={t.notes}
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-3 text-sm font-black text-white">{t.paymentMethod}</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-500/15 text-green-100"
                    : "border-white/10 bg-black/20 text-white/60 hover:bg-white/10"
                }`}
              >
                <DollarSign className="mx-auto mb-1 h-5 w-5" />
                {t.cash}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                  paymentMethod === "card"
                    ? "border-orange-500 bg-orange-500/15 text-orange-100"
                    : "border-white/10 bg-black/20 text-white/60 hover:bg-white/10"
                }`}
              >
                <CreditCard className="mx-auto mb-1 h-5 w-5" />
                {t.card}
              </button>
            </div>

            {paymentMethod === "card" && (
              <p className="mt-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-200">
                {t.cardNotice}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{t.subtotal}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-white/60">
              <span>{t.cardFee}</span>
              <span>${feeAmount.toFixed(2)}</span>
            </div>

            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-white">{t.total}</span>
                <span className="text-2xl font-black text-orange-500">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm font-bold text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-full bg-green-600 px-5 py-4 font-black text-white transition hover:bg-green-500 disabled:opacity-60"
          >
            {loading ? t.sending : t.createOrder}
          </button>
        </form>
      </div>
    </div>
  );
}