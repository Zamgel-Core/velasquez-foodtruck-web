// 📍 Ruta: src/features/cart/components/CartDrawer.tsx

import {
  CheckCircle2,
  ClipboardCopy,
  Minus,
  PackageSearch,
  Pencil,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "../../../types";
import type { CartItem } from "../cart.types";
import CheckoutModal from "./CheckoutModal";

type ProteinOption = {
  label: string;
  extraPrice: number;
};

type CartDrawerProps = {
  lang: Lang;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  increaseItem: (cartItemId: string) => void;
  decreaseItem: (cartItemId: string) => void;
  removeItem: (cartItemId: string) => void;
  updateItemNotes: (
    cartItemId: string,
    notes: string,
    price?: number,
    selectedProtein?: CartItem["selectedProtein"],
    fallbackItem?: CartItem,
  ) => void;
  clearCart: () => void;
};

function createCartItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getItemId(item: CartItem) {
  return item.cartItemId ?? item.productId;
}

function isBeverageItem(item: CartItem) {
  const text = `${item.category ?? ""} ${item.name ?? ""} ${
    item.description ?? ""
  }`.toLowerCase();

  return [
    "bebida",
    "bebidas",
    "drink",
    "drinks",
    "coca",
    "coke",
    "soda",
    "jarrito",
    "jarritos",
    "horchata",
    "jamaica",
    "pepino",
    "agua",
    "water",
  ].some((word) => text.includes(word));
}

function buildDisplayNotes(item: CartItem) {
  const parts: string[] = [];

  if (item.selectedProtein) {
    const extra =
      item.selectedProtein.extraPrice > 0
        ? ` +$${item.selectedProtein.extraPrice.toFixed(2)}`
        : "";

    parts.push(`Proteína: ${item.selectedProtein.label}${extra}`);
  }

  if (item.notes?.trim()) {
    parts.push(item.notes.trim());
  }

  return parts.join(", ");
}

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
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [selectedProtein, setSelectedProtein] = useState<ProteinOption | null>(
    null,
  );

  const shouldLockScroll =
    isOpen ||
    isCheckoutOpen ||
    Boolean(editingItem) ||
    Boolean(successOrderNumber);

  useEffect(() => {
    if (!shouldLockScroll) return;

    const scrollY = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [shouldLockScroll]);

  const proteinOptions: ProteinOption[] =
    lang === "es"
      ? [
          { label: "Pastor", extraPrice: 0 },
          { label: "Pollo", extraPrice: 0 },
          { label: "Chorizo", extraPrice: 0 },
          { label: "Fajita", extraPrice: 0 },

          { label: "Barbacoa", extraPrice: 2.5 },
          { label: "Campechano", extraPrice: 2.5 },
          { label: "Tripa", extraPrice: 2.5 },
        ]
      : [
          { label: "Pastor", extraPrice: 0 },
          { label: "Chicken", extraPrice: 0 },
          { label: "Chorizo", extraPrice: 0 },
          { label: "Fajita", extraPrice: 0 },

          { label: "Barbacoa", extraPrice: 2.5 },
          { label: "Campechano", extraPrice: 2.5 },
          { label: "Tripe", extraPrice: 2.5 },
        ];

  const quickNotes =
    lang === "es"
      ? [
          "Sin cebolla",
          "Sin cilantro",
          "Salsa aparte",
          "Extra salsa",
          "No picante",
        ]
      : [
          "No onion",
          "No cilantro",
          "Salsa on the side",
          "Extra salsa",
          "Not spicy",
        ];

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
    orderCreatedSubtitle:
      lang === "es"
        ? "Tu orden fue enviada correctamente a cocina."
        : "Your order was sent to the kitchen successfully.",
    orderCode:
      lang === "es" ? "Tu código de pedido es:" : "Your order number is:",
    showCode:
      lang === "es"
        ? "Muestra este código al llegar al food truck o rastrea tu pedido en tiempo real."
        : "Show this number when you arrive or track your order in real time.",
    understood: lang === "es" ? "Entendido" : "Got it",
    myOrder: lang === "es" ? "Mi Pedido" : "My Order",
    trackOrder: lang === "es" ? "Ver mi pedido" : "Track my order",
    copyOrder: lang === "es" ? "Copiar número" : "Copy number",
    copied: lang === "es" ? "Copiado" : "Copied",
    regularNote:
      lang === "es"
        ? "Si no personalizas, se prepara normal: fajita y con todo."
        : "If you do not customize, it will be prepared regular: fajita and with everything.",
  };

  function handleSuccess(orderNumber: string) {
    const cleanOrderNumber = orderNumber.replace(/#/g, "").trim();

    localStorage.setItem(
      "velasquez_last_order",
      JSON.stringify({
        orderNumber: cleanOrderNumber,
        expiresAt: Date.now() + 30 * 60 * 1000,
      }),
    );

    setCopiedOrderNumber(false);
    setSuccessOrderNumber(cleanOrderNumber);

    const audio = new Audio("/sounds/Order_success.mp3");
    audio.volume = 0.45;
    audio.play().catch(() => {});

    setIsCheckoutOpen(false);
    clearCart();
  }

  async function copyOrderNumber() {
    if (!successOrderNumber) return;

    try {
      await navigator.clipboard.writeText(successOrderNumber);
      setCopiedOrderNumber(true);

      window.setTimeout(() => {
        setCopiedOrderNumber(false);
      }, 1500);
    } catch (error) {
      console.error("No se pudo copiar el número de orden:", error);
    }
  }

  function openCustomize(item: CartItem) {
    const itemId = getItemId(item);

    if (item.quantity > 1) {
      decreaseItem(itemId);

      setEditingItem({
        ...item,
        cartItemId: createCartItemId(),
        quantity: 1,
        selectedProtein: item.selectedProtein
          ? { ...item.selectedProtein }
          : undefined,
        notes: item.notes ?? "",
      });
    } else {
      setEditingItem(item);
    }

    setDraftNotes(item.notes ?? "");
    setSelectedProtein(item.selectedProtein ?? null);
  }

  function addQuickNote(note: string) {
    const current = draftNotes.trim();

    if (current.toLowerCase().includes(note.toLowerCase())) return;

    setDraftNotes(current ? `${current}, ${note}` : note);
  }

  function saveItemNotes() {
    if (!editingItem) return;

    const basePrice = editingItem.basePrice ?? editingItem.price;
    const extraPrice = selectedProtein?.extraPrice ?? 0;
    const finalPrice = Number((basePrice + extraPrice).toFixed(2));

    updateItemNotes(
      getItemId(editingItem),
      draftNotes.trim(),
      finalPrice,
      selectedProtein,
      {
        ...editingItem,
        basePrice,
        price: finalPrice,
        selectedProtein,
        notes: draftNotes.trim(),
        quantity: 1,
      },
    );

    setEditingItem(null);
    setDraftNotes("");
    setSelectedProtein(null);
  }

  return (
    <>
      <button
        onClick={() => {
          const audio = new Audio("/sounds/Open_cart.mp3");
          audio.volume = 0.35;
          audio.play().catch(() => {});
          setIsOpen((value) => !value);
        }}
        className="fixed bottom-5 right-5 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.55)] transition hover:-translate-y-1 hover:scale-105 hover:bg-orange-500 hover:shadow-[0_0_42px_rgba(234,88,12,0.75)]"
        aria-label={t.openCart}
      >
        {totalItems > 0 && (
          <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/25" />
        )}
        <ShoppingCart size={28} />

        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-green-600 px-2 text-xs font-black text-white ring-2 ring-black shadow-lg shadow-green-500/30">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && !isCheckoutOpen && !editingItem && !successOrderNumber && (
        <button
          type="button"
          aria-label={t.closeCart}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9998] bg-black/65 backdrop-blur-[2px]"
        />
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-orange-500/20 bg-[#0a0a0a]/95 shadow-[0_0_48px_rgba(234,88,12,0.18)] backdrop-blur-xl">
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
              <p className="py-10 text-center text-sm text-white/40">
                {t.empty}
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemId = getItemId(item);
                  const displayNotes = buildDisplayNotes(item);
                  const canCustomize = !isBeverageItem(item);

                  return (
                    <div
                      key={itemId}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="flex gap-3">
                        <img
                          src={
                            item.imageUrl ||
                            item.image ||
                            "/images/regular_tacos.png"
                          }
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-white">
                                {item.name}
                              </h4>

                              {item.description && (
                                <p className="mt-1 line-clamp-2 text-xs text-white/45">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => removeItem(itemId)}
                              className="text-red-400 hover:text-red-300"
                              aria-label={t.remove}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <p className="mt-2 text-sm font-bold text-orange-500">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>

                          {displayNotes && (
                            <div className="mt-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-100">
                              {displayNotes}
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => decreaseItem(itemId)}
                              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                              aria-label={t.decrease}
                            >
                              <Minus size={14} />
                            </button>

                            <span className="min-w-[30px] text-center text-sm font-black text-white">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseItem(itemId)}
                              className="rounded-full bg-orange-600 p-2 text-white hover:bg-orange-500"
                              aria-label={t.increase}
                            >
                              <Plus size={14} />
                            </button>

                            {canCustomize && (
                              <button
                                onClick={() => openCustomize(item)}
                                className="ml-auto inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/20"
                              >
                                <Pencil size={13} />
                                {t.customize}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

                <p className="text-sm text-white/50">{t.itemNotes}</p>

                <p className="mt-1 text-xs font-bold text-orange-300">
                  {t.regularNote}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setSelectedProtein(null);
                  setDraftNotes("");
                }}
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-3 text-sm font-black text-white">{t.protein}</p>

              <div className="flex flex-wrap gap-2">
                {proteinOptions.map((protein) => {
                  const active = selectedProtein?.label === protein.label;

                  return (
                    <button
                      key={protein.label}
                      type="button"
                      onClick={() =>
                        setSelectedProtein(active ? null : protein)
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition ${
                        active
                          ? "border-orange-500 bg-orange-500/25 text-orange-100"
                          : "border-green-500/30 bg-green-500/10 text-green-100 hover:bg-green-500/20"
                      }`}
                    >
                      {protein.label}
                      {protein.extraPrice > 0
                        ? ` +$${protein.extraPrice.toFixed(2)}`
                        : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-3 text-sm font-black text-white">
                {t.quickNotes}
              </p>

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
                onClick={() => {
                  setEditingItem(null);
                  setSelectedProtein(null);
                  setDraftNotes("");
                }}
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-orange-500/25 bg-[#0a0a0a] p-6 text-center text-white shadow-2xl shadow-orange-950/30">
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-green-400/30 bg-green-500/10 text-green-300 shadow-[0_0_35px_rgba(34,197,94,0.22)]">
                <CheckCircle2 className="h-11 w-11" />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                <Sparkles className="h-3.5 w-3.5" />
                Velasquez Food Truck
              </div>

              <h3 className="mt-4 text-3xl font-black text-white">
                {t.orderCreated}
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm font-semibold text-white/55">
                {t.orderCreatedSubtitle}
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-orange-500/25 bg-orange-500/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
                  {t.orderCode}
                </p>

                <p className="mt-2 text-5xl font-black tracking-tight text-orange-400 drop-shadow-[0_0_18px_rgba(251,146,60,0.45)]">
                  #{successOrderNumber}
                </p>
              </div>

              <p className="mx-auto mt-4 max-w-sm text-sm font-semibold text-white/45">
                {t.showCode}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={copyOrderNumber}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/[0.10]"
                  type="button"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  {copiedOrderNumber ? t.copied : t.copyOrder}
                </button>

                <a
                  href="/mi-pedido"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  <PackageSearch className="h-4 w-4" />
                  {t.trackOrder}
                </a>
              </div>

              <button
                onClick={() => {
                  setSuccessOrderNumber("");
                  setIsOpen(false);
                }}
                className="mt-3 w-full rounded-2xl bg-orange-600 px-5 py-4 font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-500"
              >
                {t.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
