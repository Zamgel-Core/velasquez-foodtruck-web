// 📍 Ruta: src/features/cart/components/CartDrawer.tsx

import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CartItem } from "../cart.types";
import CheckoutModal from "./CheckoutModal";

type CartDrawerProps = {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export default function CartDrawer({
  items,
  subtotal,
  totalItems,
  increaseItem,
  decreaseItem,
  removeItem,
  clearCart,
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");

  function handleSuccess(orderNumber: string) {
    setSuccessOrderNumber(orderNumber);
    setIsCheckoutOpen(false);
    clearCart();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.55)] transition hover:scale-105 hover:bg-orange-500"
        aria-label="Abrir carrito"
      >
        <ShoppingCart size={28} />

        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-green-600 px-2 text-xs font-black text-white ring-2 ring-black">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="text-orange-500" size={24} />

              <div>
                <h3 className="font-black text-white">Tu Pedido</h3>
                <p className="text-xs text-white/50">{totalItems} productos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-600 px-3 py-1 text-sm font-black text-white">
                ${subtotal.toFixed(2)}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Cerrar carrito"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/40">
                Tu carrito está vacío
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl || "/images/Regular_tacos.jpg"}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-black text-white">
                            {item.name}
                          </h4>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-300"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p className="mt-2 text-sm font-bold text-orange-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => decreaseItem(item.productId)}
                            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-[30px] text-center text-sm font-black text-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseItem(item.productId)}
                            className="rounded-full bg-orange-600 p-2 text-white hover:bg-orange-500"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              disabled={items.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full rounded-full bg-green-600 px-5 py-4 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
            >
              Continuar Pedido
            </button>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {successOrderNumber && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 text-center text-white shadow-2xl">
            <h3 className="text-2xl font-black text-green-400">
              Pedido creado
            </h3>

            <p className="mt-3 text-white/70">
              Tu código de pedido es:
            </p>

            <p className="mt-4 text-4xl font-black text-orange-500">
              #{successOrderNumber}
            </p>

            <p className="mt-4 text-sm text-white/50">
              Muestra este código al llegar al food truck.
            </p>

            <button
              onClick={() => {
                setSuccessOrderNumber("");
                setIsOpen(false);
              }}
              className="mt-6 w-full rounded-full bg-orange-600 px-5 py-4 font-black text-white transition hover:bg-orange-500"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}