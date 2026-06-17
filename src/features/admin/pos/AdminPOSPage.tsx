// 📍 Ruta: src/features/admin/pos/AdminPOSPage.tsx

import React from "react";
import {
  Gift,
  Minus,
  Percent,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import { useStaffAuth } from "../auth/useStaffAuth";
import {
  createPOSOrder,
  getPOSItemUnitPrice,
  getPOSProductOptions,
  getPOSProducts,
  type POSCartItem,
  type POSProduct,
  type POSProductOption,
  type POSSelectedOption,
} from "./admin-pos.service";
import {
  getAvailableLoyaltyRewardsForPhone,
  getRewardDisplayValue,
} from "../loyalty/loyalty.service";
import type { LoyaltyRewardAvailability } from "../loyalty/loyalty.types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const POS_DRAFT_KEY = "velasquez_pos_draft";
const CATEGORY_ORDER = [
  "Tacos",
  "Tortas",
  "Burritos",
  "Quesadillas",
  "Antojitos",
  "Hot Dogs",
  "Extras",
  "Bebidas",
];

const PRODUCT_ORDER = [
  "Regular Tacos",
  "Special Tacos",
  "Mini Tacos",
  "Torta Mexicana",
  "Burrito",
  "Burrito Especial",
  "Quesadillas",
  "Gorditas",
  "Sopes",
  "Street Hot Dog",
  "Salchipapas",
  "Coca-Cola Mexicana",
  "Coca-Cola Lata",
  "Horchata",
  "Jamaica",
  "Pepino Limón",
  "Jarritos",
];

function getCategoryIndex(category?: string | null) {
  const index = CATEGORY_ORDER.indexOf(category ?? "");
  return index === -1 ? 999 : index;
}

function getProductIndex(name: string) {
  const index = PRODUCT_ORDER.indexOf(name);
  return index === -1 ? 999 : index;
}

function createCartItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function calculatePOSRewardDiscount(
  availability: LoyaltyRewardAvailability | null,
  subtotal: number,
) {
  if (!availability?.available) return 0;

  const reward = availability.reward;

  if (reward.reward_type === "fixed_discount") {
    return Math.min(subtotal, Math.max(0, Number(reward.value_amount || 0)));
  }

  if (reward.reward_type === "percent_discount") {
    const percent = Math.min(
      100,
      Math.max(0, Number(reward.value_amount || 0)),
    );
    return Math.min(subtotal, Number(((subtotal * percent) / 100).toFixed(2)));
  }

  return 0;
}

function calculatePOSFreeRewardDiscount(
  availability: LoyaltyRewardAvailability | null,
  cart: POSCartItem[],
) {
  if (availability?.reward.reward_type !== "free_item") return 0;

  const freeProductId = availability.reward.reward_product_id;
  if (!freeProductId) return 0;

  return cart.reduce((sum, item) => {
    if (item.product.id !== freeProductId) return sum;
    return sum + getPOSItemUnitPrice(item) * item.quantity;
  }, 0);
}

function getRewardKindLabel(type: string) {
  if (type === "free_item") return "Producto gratis";
  if (type === "fixed_discount") return "Descuento fijo";
  if (type === "percent_discount") return "Descuento %";
  return "Recompensa";
}

export default function AdminPOSPage() {
  const { profile } = useStaffAuth();

  const [products, setProducts] = React.useState<POSProduct[]>([]);
  const [cart, setCart] = React.useState<POSCartItem[]>(() => {
    try {
      const saved = localStorage.getItem(POS_DRAFT_KEY);

      if (!saved) return [];

      const parsed = JSON.parse(saved);
      const savedCart = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.cart)
          ? parsed.cart
          : [];

      return savedCart.map((item: POSCartItem) => ({
        ...item,
        cart_item_id: item.cart_item_id ?? createCartItemId(),
      }));
    } catch {
      return [];
    }
  });
  const [selectedProduct, setSelectedProduct] =
    React.useState<POSProduct | null>(null);
  const [productOptions, setProductOptions] = React.useState<
    POSProductOption[]
  >([]);
  const [selectedOptions, setSelectedOptions] = React.useState<
    POSSelectedOption[]
  >([]);
  const [itemNotes, setItemNotes] = React.useState("");
  const [itemQuantity, setItemQuantity] = React.useState(1);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [manualDiscountPercent, setManualDiscountPercent] = React.useState(0);
  const [customDiscountPercent, setCustomDiscountPercent] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<
    "cash" | "card" | "pending"
  >("cash");
  const [amountPaid, setAmountPaid] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const [loyaltyRewards, setLoyaltyRewards] = React.useState<
    LoyaltyRewardAvailability[]
  >([]);
  const [selectedLoyaltyReward, setSelectedLoyaltyReward] =
    React.useState<LoyaltyRewardAvailability | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = React.useState(false);
  const [loyaltyMessage, setLoyaltyMessage] = React.useState("");
  const [draftReady, setDraftReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(POS_DRAFT_KEY);
      if (!saved) {
        setDraftReady(true);
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setCustomerName(parsed.customerName ?? "");
        setCustomerPhone(parsed.customerPhone ?? "");
        setNotes(parsed.notes ?? "");
        setManualDiscountPercent(Number(parsed.manualDiscountPercent || 0));
        setCustomDiscountPercent(parsed.customDiscountPercent ?? "");
        setPaymentMethod(parsed.paymentMethod ?? "cash");
        setAmountPaid(parsed.amountPaid ?? "");
      }
    } catch {
      // Ignore broken drafts.
    } finally {
      setDraftReady(true);
    }
  }, []);

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setProducts(await getPOSProducts());
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadLoyaltyRewards = React.useCallback(async () => {
    const phone = customerPhone.trim();

    if (phone.replace(/\D/g, "").length < 7) {
      setLoyaltyRewards([]);
      setSelectedLoyaltyReward(null);
      setLoyaltyMessage("");
      return;
    }

    try {
      setLoyaltyLoading(true);
      const rewards = await getAvailableLoyaltyRewardsForPhone(phone);
      setLoyaltyRewards(rewards);
      setLoyaltyMessage(
        rewards.length > 0
          ? "Cliente de lealtad detectado. Puedes canjear recompensas disponibles."
          : "No hay cliente de lealtad activo con este telefono.",
      );

      setSelectedLoyaltyReward((current) => {
        if (!current) return null;
        return (
          rewards.find((entry) => entry.reward.id === current.reward.id) ?? null
        );
      });
    } catch (err) {
      console.error(err);
      setLoyaltyMessage("No se pudieron cargar las recompensas de lealtad.");
    } finally {
      setLoyaltyLoading(false);
    }
  }, [customerPhone]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadLoyaltyRewards();
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [loadLoyaltyRewards]);

  React.useEffect(() => {
    if (!draftReady) return;

    localStorage.setItem(
      POS_DRAFT_KEY,
      JSON.stringify({
        cart,
        customerName,
        customerPhone,
        notes,
        paymentMethod,
        amountPaid,
      }),
    );
  }, [
    draftReady,
    cart,
    customerName,
    customerPhone,
    notes,
    manualDiscountPercent,
    customDiscountPercent,
    paymentMethod,
    amountPaid,
  ]);

  const categories = React.useMemo(() => {
    const baseCategories = (
      Array.from(
        new Set(
          products.map((product) => product.category?.name).filter(Boolean),
        ),
      ) as string[]
    ).sort((a, b) => getCategoryIndex(a) - getCategoryIndex(b));

    return loyaltyRewards.length > 0
      ? [...baseCategories, "Lealtad"]
      : baseCategories;
  }, [products, loyaltyRewards.length]);

  const filteredProducts = products
    .filter((product) => {
      const query = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter !== "Lealtad" &&
          product.category?.name === categoryFilter);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const categoryDiff =
        getCategoryIndex(a.category?.name) - getCategoryIndex(b.category?.name);

      if (categoryDiff !== 0) return categoryDiff;

      return getProductIndex(a.name) - getProductIndex(b.name);
    });

  const safeCart = Array.isArray(cart) ? cart : [];

  const freeRewardProductId =
    selectedLoyaltyReward?.reward.reward_type === "free_item"
      ? selectedLoyaltyReward.reward.reward_product_id
      : null;

  const subtotal = safeCart.reduce(
    (sum, item) => sum + getPOSItemUnitPrice(item) * item.quantity,
    0,
  );

  const freeRewardDiscount = calculatePOSFreeRewardDiscount(
    selectedLoyaltyReward,
    safeCart,
  );
  const discountableSubtotal = Math.max(0, subtotal - freeRewardDiscount);
  const loyaltyDiscount = calculatePOSRewardDiscount(
    selectedLoyaltyReward,
    discountableSubtotal,
  );
  const loyaltyTotalDiscount = Math.min(
    subtotal,
    freeRewardDiscount + loyaltyDiscount,
  );
  const manualDiscountBase = Math.max(0, subtotal - loyaltyTotalDiscount);
  const safeManualDiscountPercent = Math.min(
    100,
    Math.max(0, Number(manualDiscountPercent || 0)),
  );
  const manualDiscountAmount = Number(
    ((manualDiscountBase * safeManualDiscountPercent) / 100).toFixed(2),
  );
  const totalDiscount = Math.min(
    subtotal,
    loyaltyTotalDiscount + manualDiscountAmount,
  );
  const total = Math.max(0, subtotal - totalDiscount);

  const paid = Number(amountPaid || 0);
  const changeDue = paymentMethod === "cash" ? Math.max(0, paid - total) : 0;

  const openProductModal = async (product: POSProduct) => {
    if (!product.is_available) {
      setError("Este producto está agotado temporalmente.");
      return;
    }

    try {
      setSelectedProduct(product);
      setSelectedOptions([]);
      setItemNotes("");
      setItemQuantity(1);
      setLoadingOptions(true);

      const options = await getPOSProductOptions(product.id);

      setProductOptions(options);
      setSelectedOptions(options.filter((option) => option.is_default));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los modificadores.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const resetProductSelection = React.useCallback(() => {
    setSelectedOptions(productOptions.filter((option) => option.is_default));
    setItemNotes("");
    setItemQuantity(1);
  }, [productOptions]);

  const closeProductModal = React.useCallback(() => {
    setSelectedProduct(null);
    setProductOptions([]);
    setSelectedOptions([]);
    setItemNotes("");
    setItemQuantity(1);
  }, []);

  const addProductToCart = (closeAfterAdd = true) => {
    if (!selectedProduct) return;

    const safeQuantity = Math.max(1, Math.floor(Number(itemQuantity || 1)));

    setCart((current) => [
      ...(Array.isArray(current) ? current : []),
      {
        cart_item_id: createCartItemId(),
        product: selectedProduct,
        quantity: safeQuantity,
        selectedOptions,
        notes: itemNotes.trim() || undefined,
      },
    ]);

    if (closeAfterAdd) {
      closeProductModal();
      return;
    }

    resetProductSelection();
  };

  const updateQuantity = (cartItemId: string, change: number) => {
    setCart((current) =>
      (Array.isArray(current) ? current : [])
        .map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((current) =>
      (Array.isArray(current) ? current : []).filter(
        (item) => item.cart_item_id !== cartItemId,
      ),
    );
  };

  const handleCreateOrder = async () => {
    if (!profile) {
      setError("No se encontró el perfil del empleado.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const order = await createPOSOrder({
        customerName,
        customerPhone,
        notes,
        paymentMethod,
        amountPaid: Number(amountPaid || 0),
        staffProfileId: profile.id,
        items: safeCart,
        loyaltyRewardId: selectedLoyaltyReward?.reward.id ?? null,
        loyaltyDiscountAmount: loyaltyDiscount,
        loyaltyFreeProductId: freeRewardProductId,
        loyaltyRewardLabel: selectedLoyaltyReward
          ? getRewardDisplayValue(selectedLoyaltyReward.reward)
          : "",
        manualDiscountPercent: safeManualDiscountPercent,
        manualDiscountAmount,
      });

      setSuccess(`Orden ${order.order_number} creada correctamente.`);

      try {
        window.dispatchEvent(new CustomEvent("vft-orders-refresh"));

        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("vft-orders-channel");
          channel.postMessage({ type: "vft-orders-refresh", at: Date.now() });
          channel.close();
        }

        localStorage.setItem("vft-orders-refresh", String(Date.now()));
      } catch (refreshError) {
        console.warn("No se pudo notificar el refresco de órdenes:", refreshError);
      }

      setCart([]);
      localStorage.removeItem(POS_DRAFT_KEY);
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setManualDiscountPercent(0);
      setCustomDiscountPercent("");
      setAmountPaid("");
      setPaymentMethod("cash");
      setSelectedLoyaltyReward(null);
      setLoyaltyRewards([]);
      setLoyaltyMessage("");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "No se pudo crear la orden.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#050505] px-3 py-5 text-white sm:px-6 lg:px-10">
        <section className="mx-auto grid w-full max-w-[1800px] min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0">
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                    <Receipt className="h-4 w-4" />
                    Punto de venta
                  </div>

                  <h1 className="text-3xl font-black sm:text-4xl">
                    POS <span className="text-red-500">Velasquez</span>
                  </h1>

                  <p className="mt-1 text-sm text-white/60">
                    Toma órdenes presenciales y envíalas directo al panel de
                    cocina.
                  </p>
                </div>

                <button
                  onClick={loadProducts}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-600/25 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/35 active:scale-[0.98] sm:w-auto"
                  type="button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar producto o categoría..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 font-semibold outline-none transition placeholder:text-white/30 focus:border-red-500/70 focus:shadow-lg focus:shadow-red-500/10"
                />
              </div>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-black transition ${
                  categoryFilter === "all"
                    ? "scale-[1.03] border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                }`}
                type="button"
              >
                Todos
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-black transition ${
                    categoryFilter === category
                      ? "scale-[1.03] border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                  }`}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/60">
                Cargando productos...
              </div>
            )}

            {!loading && categoryFilter === "Lealtad" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loyaltyRewards.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-red-500/20 bg-red-500/[0.04] p-8 text-center text-sm font-bold text-white/50 sm:col-span-2 lg:col-span-3">
                    Escribe el telefono de un cliente de lealtad para ver
                    recompensas.
                  </div>
                )}

                {loyaltyRewards.map((entry) => {
                  const reward = entry.reward;
                  const active = selectedLoyaltyReward?.reward.id === reward.id;
                  const discount = calculatePOSRewardDiscount(entry, subtotal);

                  return (
                    <button
                      key={reward.id}
                      onClick={() =>
                        entry.available
                          ? setSelectedLoyaltyReward(active ? null : entry)
                          : undefined
                      }
                      disabled={!entry.available}
                      className={`rounded-3xl border p-4 text-left transition ${
                        active
                          ? "scale-[1.02] border-red-500 bg-red-500/15 shadow-lg shadow-red-500/25"
                          : entry.available
                            ? "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-red-500/50 hover:bg-red-500/[0.08] hover:shadow-lg hover:shadow-red-500/10"
                            : "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-45"
                      }`}
                      type="button"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200">
                            {reward.reward_type === "percent_discount" ? (
                              <Percent className="h-6 w-6" />
                            ) : (
                              <Gift className="h-6 w-6" />
                            )}
                          </div>

                          <div>
                            <h2 className="font-black">{reward.title}</h2>
                            <p className="text-xs font-bold text-white/40">
                              {getRewardKindLabel(reward.reward_type)}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200">
                          {reward.points_required} pts
                        </span>
                      </div>

                      <p className="text-sm font-bold text-white/60">
                        {getRewardDisplayValue(reward)}
                      </p>

                      {discount > 0 && (
                        <p className="mt-2 text-sm font-black text-green-300">
                          Descuento actual: -{formatMoney(discount)}
                        </p>
                      )}

                      {reward.description && (
                        <p className="mt-2 line-clamp-2 text-xs font-semibold text-white/40">
                          {reward.description}
                        </p>
                      )}

                      {!entry.available && (
                        <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
                          {entry.reason}
                        </p>
                      )}

                      {active && (
                        <p className="mt-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-black text-green-200">
                          Recompensa aplicada a esta orden.
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && categoryFilter !== "Lealtad" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isAvailable = product.is_available !== false;

                  return (
                    <button
                      key={product.id}
                      onClick={() => openProductModal(product)}
                      disabled={!isAvailable}
                      className={`relative flex items-start gap-3 overflow-hidden rounded-3xl border p-4 text-left transition ${
                        isAvailable
                          ? "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-red-500/50 hover:bg-red-500/[0.08] hover:shadow-lg hover:shadow-red-500/10"
                          : "cursor-not-allowed border-red-500/25 bg-red-950/20 opacity-70"
                      }`}
                      type="button"
                    >
                      {!isAvailable && (
                        <span className="absolute right-3 top-3 z-10 rounded-full border border-red-400/35 bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-red-600/25">
                          Agotado
                        </span>
                      )}

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className={`h-full w-full object-cover ${
                              isAvailable ? "" : "grayscale"
                            }`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-white/30">
                            IMG
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-black">
                              {product.name}
                            </h2>

                            <p className="text-xs font-bold text-white/40">
                              {product.category?.name ?? "Sin categoría"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-sm font-black ${
                              isAvailable
                                ? "bg-red-600 shadow-lg shadow-red-600/25"
                                : "border border-red-500/25 bg-red-500/10 text-red-200"
                            }`}
                          >
                            {formatMoney(Number(product.price))}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm text-white/50">
                          {product.description || "Sin descripción."}
                        </p>

                        {!isAvailable && (
                          <p className="mt-2 text-xs font-black text-red-200">
                            No se puede vender hasta marcarlo disponible.
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:sticky xl:top-24 xl:h-fit">
            <h2 className="text-2xl font-black">Orden actual</h2>

            <div className="mt-4 grid gap-3">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nombre del cliente"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-semibold outline-none focus:border-red-500/60"
              />

              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Teléfono opcional"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-semibold outline-none focus:border-red-500/60"
              />
            </div>

            <div className="mt-4 rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-red-300" />
                  <p className="text-sm font-black text-red-100">
                    Lealtad en ventanilla
                  </p>
                </div>

                <button
                  onClick={() => setCategoryFilter("Lealtad")}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200 transition hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10"
                  type="button"
                >
                  Ver recompensas
                </button>
              </div>

              <p className="text-xs font-bold text-white/50">
                {loyaltyLoading
                  ? "Buscando recompensas..."
                  : loyaltyMessage ||
                    "Escribe el telefono del cliente para consultar recompensas."}
              </p>

              {selectedLoyaltyReward && (
                <div className="mt-3 rounded-2xl border border-green-500/25 bg-green-500/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-green-100">
                        {selectedLoyaltyReward.reward.title}
                      </p>
                      <p className="text-xs font-bold text-green-200/70">
                        {getRewardDisplayValue(selectedLoyaltyReward.reward)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLoyaltyReward(null)}
                      className="rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-xs font-black text-white/70 hover:bg-white/10"
                      type="button"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {safeCart.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm font-bold text-white/35">
                  Agrega productos para crear una orden.
                </div>
              )}

              {safeCart.map((item) => (
                <div
                  key={item.cart_item_id ?? item.product.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{item.product.name}</h3>
                      <p className="text-sm font-bold text-red-300">
                        {freeRewardProductId &&
                        item.product.id === freeRewardProductId
                          ? "$0.00"
                          : formatMoney(getPOSItemUnitPrice(item))}
                      </p>

                      {item.selectedOptions &&
                        item.selectedOptions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.selectedOptions.map((option) => (
                              <p
                                key={option.id}
                                className="text-xs font-bold text-white/45"
                              >
                                {option.option_group}: {option.option_name}
                                {Number(option.extra_price || 0) > 0
                                  ? ` +${formatMoney(Number(option.extra_price))}`
                                  : ""}
                              </p>
                            ))}
                          </div>
                        )}

                      {item.notes && (
                        <p className="mt-2 text-xs font-bold text-red-200/70">
                          Nota: {item.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item.cart_item_id ?? item.product.id)
                      }
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.cart_item_id ?? item.product.id,
                            -1,
                          )
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="min-w-8 text-center font-black">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.cart_item_id ?? item.product.id,
                            1,
                          )
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="font-black">
                      {freeRewardProductId &&
                      item.product.id === freeRewardProductId
                        ? "$0.00"
                        : formatMoney(
                            getPOSItemUnitPrice(item) * item.quantity,
                          )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notas de la orden..."
              rows={3}
              className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-semibold outline-none focus:border-red-500/60"
            />

            <div className="mt-4 rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-red-100">Descuento</p>
                  <p className="text-xs font-bold text-white/45">
                    Aplica descuento al total después de recompensas.
                  </p>
                </div>

                {manualDiscountAmount > 0 && (
                  <span className="rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-black text-green-200">
                    -{formatMoney(manualDiscountAmount)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Sin", value: 0 },
                  { label: "25%", value: 25 },
                  { label: "50%", value: 50 },
                ].map((discount) => (
                  <button
                    key={discount.value}
                    onClick={() => {
                      setManualDiscountPercent(discount.value);
                      setCustomDiscountPercent("");
                    }}
                    className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                      safeManualDiscountPercent === discount.value &&
                      customDiscountPercent === ""
                        ? "scale-[1.04] border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/35"
                        : "border-white/10 bg-white/5 text-white/65 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                    }`}
                    type="button"
                  >
                    {discount.label}
                  </button>
                ))}

                <input
                  value={customDiscountPercent}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCustomDiscountPercent(value);
                    const numericValue = Number(value);
                    setManualDiscountPercent(
                      Number.isFinite(numericValue)
                        ? Math.min(100, Math.max(0, numericValue))
                        : 0,
                    );
                  }}
                  placeholder="Otro %"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-center text-sm font-black outline-none placeholder:text-white/35 focus:border-red-500/60"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(["cash", "card", "pending"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                    paymentMethod === method
                      ? "scale-[1.03] border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                  }`}
                  type="button"
                >
                  {method === "cash"
                    ? "Cash"
                    : method === "card"
                      ? "Card"
                      : "Pendiente"}
                </button>
              ))}
            </div>

            {paymentMethod === "cash" && (
              <input
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
                placeholder="Cantidad recibida"
                type="number"
                min="0"
                step="0.01"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-semibold outline-none focus:border-red-500/60"
              />
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex justify-between text-sm font-bold text-white/55">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>

              {freeRewardDiscount > 0 && (
                <div className="mt-2 flex justify-between gap-3 text-sm font-bold text-green-300">
                  <span>Producto gratis</span>
                  <span className="text-right">
                    -{formatMoney(freeRewardDiscount)} ·{" "}
                    {getRewardDisplayValue(selectedLoyaltyReward!.reward)}
                  </span>
                </div>
              )}

              {selectedLoyaltyReward?.reward.reward_type === "free_item" &&
                freeRewardDiscount <= 0 && (
                  <div className="mt-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-100">
                    Esta recompensa necesita un producto vinculado y agregado a
                    la orden para aplicar el descuento real.
                  </div>
                )}

              {loyaltyDiscount > 0 && (
                <div className="mt-2 flex justify-between text-sm font-bold text-green-300">
                  <span>Descuento lealtad</span>
                  <span>-{formatMoney(loyaltyDiscount)}</span>
                </div>
              )}

              {manualDiscountAmount > 0 && (
                <div className="mt-2 flex justify-between text-sm font-bold text-red-200">
                  <span>Descuento POS ({safeManualDiscountPercent}%)</span>
                  <span>-{formatMoney(manualDiscountAmount)}</span>
                </div>
              )}

              <div className="mt-3 border-t border-white/10 pt-3 flex justify-between text-xl font-black">
                <span>Total</span>
                <span className="text-red-300">{formatMoney(total)}</span>
              </div>

              {paymentMethod === "cash" && (
                <div className="mt-2 flex justify-between text-sm font-bold text-green-300">
                  <span>Cambio</span>
                  <span>{formatMoney(changeDue)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-200">
                {success}
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={saving || safeCart.length === 0}
              className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-4 font-black text-white shadow-lg shadow-red-600/30 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              type="button"
            >
              {saving ? "Creando orden..." : "Crear orden POS"}
            </button>
          </aside>
        </section>
      </main>
      {selectedProduct && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{selectedProduct.name}</h2>
                <p className="text-sm text-white/50">
                  Selecciona modificadores o agrega notas.
                </p>
              </div>

              <button
                onClick={closeProductModal}
                className="rounded-full bg-white/10 px-3 py-2 font-black transition hover:bg-white/20"
                type="button"
              >
                ✕
              </button>
            </div>

            {loadingOptions && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm font-bold text-white/50">
                Cargando modificadores...
              </div>
            )}

            {!loadingOptions && productOptions.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm font-bold text-white/50">
                Este producto no tiene modificadores.
              </div>
            )}

            {!loadingOptions &&
              Object.entries(
                productOptions.reduce<Record<string, POSProductOption[]>>(
                  (groups, option) => {
                    if (!groups[option.option_group]) {
                      groups[option.option_group] = [];
                    }

                    groups[option.option_group].push(option);
                    return groups;
                  },
                  {},
                ),
              ).map(([group, options]) => {
                const isRequired = options.some((option) => option.is_required);

                return (
                  <div key={group} className="mt-5">
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-red-300">
                        {group}
                      </h3>

                      {isRequired && (
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-black text-red-200">
                          Requerido
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {options.map((option) => {
                        const active = selectedOptions.some(
                          (selected) => selected.id === option.id,
                        );

                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedOptions((current) => {
                                const exists = current.some(
                                  (selected) => selected.id === option.id,
                                );

                                if (exists) {
                                  return current.filter(
                                    (selected) => selected.id !== option.id,
                                  );
                                }

                                const isSingleChoiceGroup = option.is_required;

                                if (isSingleChoiceGroup) {
                                  return [
                                    ...current.filter(
                                      (selected) =>
                                        selected.option_group !==
                                        option.option_group,
                                    ),
                                    option,
                                  ];
                                }

                                return [...current, option];
                              });
                            }}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active
                                ? "scale-[1.02] border-red-500 bg-red-500/15 text-red-100 shadow-lg shadow-red-500/15"
                                : "border-white/10 bg-white/5 text-white/65 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                            }`}
                            type="button"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-black">
                                {option.option_name}
                              </span>

                              {Number(option.extra_price || 0) > 0 && (
                                <span className="text-sm font-black text-green-300">
                                  +{formatMoney(Number(option.extra_price))}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-white">Cantidad</p>
                  <p className="text-xs font-bold text-white/40">
                    Usa 2, 3 o más cuando sean exactamente iguales.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setItemQuantity((current) => Math.max(1, current - 1))
                    }
                    className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    value={itemQuantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setItemQuantity(
                        Number.isFinite(value)
                          ? Math.max(1, Math.floor(value))
                          : 1,
                      );
                    }}
                    type="number"
                    min="1"
                    step="1"
                    className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center font-black outline-none focus:border-red-500/70 focus:shadow-lg focus:shadow-red-500/10"
                  />

                  <button
                    onClick={() => setItemQuantity((current) => current + 1)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-sm font-bold text-white/60">
                <span>Subtotal de esta línea</span>
                <span className="text-red-200">
                  {formatMoney(
                    getPOSItemUnitPrice({
                      product: selectedProduct,
                      quantity: itemQuantity,
                      selectedOptions,
                    }) * itemQuantity,
                  )}
                </span>
              </div>
            </div>

            <textarea
              value={itemNotes}
              onChange={(event) => setItemNotes(event.target.value)}
              placeholder="Notas para este producto... Ej. sin cebolla, sin cilantro, salsa aparte"
              rows={3}
              className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-semibold outline-none focus:border-red-500/60"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => addProductToCart(false)}
                className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-4 font-black text-red-100 shadow-lg shadow-red-500/10 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500/20 hover:shadow-red-500/20 active:scale-[0.99]"
                type="button"
              >
                Agregar y continuar
              </button>

              <button
                onClick={() => addProductToCart(true)}
                className="rounded-2xl bg-red-600 px-5 py-4 font-black text-white shadow-lg shadow-red-600/30 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-red-500/40 active:scale-[0.99]"
                type="button"
              >
                Agregar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
