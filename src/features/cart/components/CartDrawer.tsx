// 📍 Ruta: src/features/cart/components/CartDrawer.tsx

import { Minus, Pencil, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Lang } from "../../../types";
import type { CartItem } from "../cart.types";
import CheckoutModal from "./CheckoutModal";

type CartDrawerProps = {
  lang: Lang;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
};

export default function CartDrawer({
  lang,
  items,
  subtotal,
  totalItems,
  increaseItem,
  decreaseItem,
  removeItem,
  updateItemNotes,
  clearCart,
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [draftNotes, setDraftNotes] = useState("");

  const proteinOptions =
    lang === "es"
      ? [
          "Pastor",
          "Bistec",
          "Pollo",
          "Chorizo",
          "Fajita",
          "Barbacoa +$2.50",
          "Campechano +$2.50",
        ]
      : [
          "Pastor",
          "Beef",
          "Chicken",
          "Chorizo",
          "Fajita",
          "Barbacoa +$2.50",
          "Campechano +$2.50",
        ];

  const quickNotes =
    lang === "es"
      ? ["Sin cebolla", "Sin cilantro", "Salsa aparte", "Extra salsa", "No picante"]
      : ["No onion", "No cilantro", "Salsa on the side", "Extra salsa", "Not spicy"];

  const t = {
    openCart: lang === "es" ? "Abrir carrito" : "Open cart",
    closeCart: lang === "es" ? "Cerrar carrito" : "Close cart",
    title: lang === "es" ? "Tu Pedido" : "Your Order",
    items: lang === "es" ? "productos" : "items",
    empty: lang === "es" ? "Tu carrito está vacío" : "Your cart is empty",
    remove: lang === "es" ? "Eliminar producto" : "Remove item",
    decrease: lang === "es" ? "Disminuir cantidad" : "Decrease quantity",
    increase: lang === "es" ? "Aumentar cantidad" : "Increase quantity",
    continue: lang === "es" ? "Continuar Pedido" : "Continue Order",
    customize: lang === "es" ? "Personalizar" : "Customize",
    itemNotes: lang === "es" ? "Notas del producto" : "Item notes",
    protein: lang === "es" ? "Proteína" : "Protein",
    quickNotes: lang === "es" ? "Notas rápidas" : "Quick notes",
    save: lang === "es" ? "Guardar" : "Save",
    cancel: lang === "es" ? "Cancelar" : "Cancel",
    notesPlaceholder:
      lang === "es"
        ? "Ej. Sin cebolla, salsa aparte, extra cilantro..."
        : "Ex. No onion, salsa on the side, extra cilantro...",
    orderCreated: lang === "es" ? "Pedido creado" : "Order created",
    orderCode: lang === "es" ? "Tu código de pedido es:" : "Your order number is:",
    showCode:
      lang === "es"
        ? "Muestra este código al llegar al food truck."
        : "Show this number when you arrive at the food truck.",
    understood: lang === "es" ? "Entendido" : "Got it",
  };

  function handleSuccess(orderNumber: string) {
    setSuccessOrderNumber(orderNumber);
    setIsCheckoutOpen(false);
    clearCart();
  }

  function openCustomize(item: CartItem) {
    setEditingItem(item);
    setDraftNotes(item.notes ?? "");
  }

  function addQuickNote(note: string) {
    const current = draftNotes.trim();

    if (current.toLowerCase().includes(note.toLowerCase())) return;

    setDraftNotes(current ? `${current}, ${note}` : note);
  }

  function saveItemNotes() {
    if (!editingItem) return;

    updateItemNotes(editingItem.productId, draftNotes.trim());
    setEditingItem(null);
    setDraftNotes("");
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.55)] transition hover:scale-105 hover:bg-orange-500"
        aria-label={t.openCart}
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
                <h3 className="font-black text-white">{t.title}</h3>
                <p className="text-xs text-white/50">
                  {totalItems} {t.items}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-600 px-3 py-1 text-sm font-black text-white">
                ${subtotal.toFixed(2)}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label={t.closeCart}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/40">{t.empty}</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl || item.image || "/images/Regular_tacos.jpg"}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-black text-white">{item.name}</h4>

                            {item.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-white/45">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-300"
                            aria-label={t.remove}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p className="mt-2 text-sm font-bold text-orange-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        {item.notes && (
                          <div className="mt-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-100">
                            {item.notes}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => decreaseItem(item.productId)}
                            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                            aria-label={t.decrease}
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-[30px] text-center text-sm font-black text-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseItem(item.productId)}
                            className="rounded-full bg-orange-600 p-2 text-white hover:bg-orange-500"
                            aria-label={t.increase}
                          >
                            <Plus size={14} />
                          </button>

                          <button
                            onClick={() => openCustomize(item)}
                            className="ml-auto inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/20"
                          >
                            <Pencil size={13} />
                            {t.customize}
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
              {t.continue}
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
  <div>
    <h3 className="text-xl font-black">{editingItem.name}</h3>

    <p className="text-sm text-white/50">
      {t.itemNotes}
    </p>

    <p className="mt-1 text-xs font-bold text-orange-300">
      {lang === "es"
        ? "Si no personalizas, se prepara normal: fajita y con todo."
        : "If you do not customize, it will be prepared regular: fajita and with everything."}
    </p>
  </div>

  <button
    onClick={() => setEditingItem(null)}
    className="rounded-full bg-white/10 p-2 hover:bg-white/20"
  >
    <X size={18} />
  </button>
</div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-3 text-sm font-black text-white">{t.protein}</p>

              <div className="flex flex-wrap gap-2">
                {proteinOptions.map((protein) => (
                  <button
                    key={protein}
                    type="button"
                    onClick={() => addQuickNote(`${t.protein}: ${protein}`)}
                    className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-100 transition hover:bg-green-500/20"
                  >
                    <Plus className="h-3 w-3" />
                    {protein}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-3 text-sm font-black text-white">{t.quickNotes}</p>

              <div className="flex flex-wrap gap-2">
                {quickNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => addQuickNote(note)}
                    className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-100 transition hover:bg-orange-500/20"
                  >
                    <Plus className="h-3 w-3" />
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              placeholder={t.notesPlaceholder}
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-black text-white transition hover:bg-white/10"
              >
                {t.cancel}
              </button>

              <button
                onClick={saveItemNotes}
                className="rounded-full bg-orange-600 px-5 py-3 font-black text-white transition hover:bg-orange-500"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          lang={lang}
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
              {t.orderCreated}
            </h3>

            <p className="mt-3 text-white/70">{t.orderCode}</p>

            <p className="mt-4 text-4xl font-black text-orange-500">
              #{successOrderNumber}
            </p>

            <p className="mt-4 text-sm text-white/50">{t.showCode}</p>

            <button
              onClick={() => {
                setSuccessOrderNumber("");
                setIsOpen(false);
              }}
              className="mt-6 w-full rounded-full bg-orange-600 px-5 py-4 font-black text-white transition hover:bg-orange-500"
            >
              {t.understood}
            </button>
          </div>
        </div>
      )}
    </>
  );
}