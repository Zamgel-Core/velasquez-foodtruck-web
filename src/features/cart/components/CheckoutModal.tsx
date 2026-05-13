// 📍 Ruta: src/features/cart/components/CheckoutModal.tsx

import { X } from "lucide-react";
import { useState } from "react";
import type { CartItem, CheckoutCustomer } from "../cart.types";
import { createOrder } from "../../../services/orders.service";

type CheckoutModalProps = {
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
};

export default function CheckoutModal({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!customer.name.trim() || !customer.phone.trim()) {
      setError("Nombre y teléfono son requeridos.");
      return;
    }

    setLoading(true);

    const result = await createOrder(customer, items, subtotal);

    setLoading(false);

    if (!result.success || !result.orderNumber) {
      setError(result.error || "No se pudo crear la orden.");
      return;
    }

    onSuccess(result.orderNumber);
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">Finalizar pedido</h3>
            <p className="text-sm text-white/50">
              Total: ${subtotal.toFixed(2)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
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
            placeholder="Nombre"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          <input
            value={customer.phone}
            onChange={(e) =>
              setCustomer((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Teléfono"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          <textarea
            value={customer.notes}
            onChange={(e) =>
              setCustomer((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Notas del pedido"
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />

          {error && <p className="text-sm font-bold text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-full bg-green-600 px-5 py-4 font-black text-white transition hover:bg-green-500 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Crear pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}