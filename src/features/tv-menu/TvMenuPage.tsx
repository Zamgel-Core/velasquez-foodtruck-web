// 📍 Ruta: src/features/tv-menu/TvMenuPage.tsx

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Flame, QrCode, Sparkles, Wifi, Truck } from "lucide-react";

import { categories, menuItems } from "../../data/menu";
import { getProducts } from "../../services/products.service";
import { supabase } from "../../lib/supabase";

import type { Product } from "../../types/product.types";
import type { MenuItem } from "../../types";

type TvItem = {
  id: string;
  name: string;
  desc: string;
  price: string;
  image: string;
  category: string;
};

const SLIDE_INTERVAL_MS = 8000;
const ZAMGEL_CORE_LOGO_SRC = "/images/zamgelcore-zc-logo.png";

function normalizeCategory(category: string) {
  return category === "Especialidades" ? "Antojitos" : category;
}

function productToTvItem(product: Product): TvItem {
  return {
    id: product.id,
    name: product.name,
    desc: product.description || "Auténtico sabor mexicano hecho al momento",
    price: `$${Number(product.price).toFixed(2)}`,
    image: product.image_url || "/images/food-truck-hero.png",
    category: normalizeCategory(product.category || "Extras"),
  };
}

function fallbackToTvItem(
  item: MenuItem,
  category: string,
  index: number,
): TvItem {
  return {
    id: `${category}-${index}`,
    name: item.name,
    desc: item.desc,
    price: item.price || "",
    image: item.image,
    category,
  };
}

export default function TvMenuPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState(0);
  const [activeItemIndex, setActiveItemIndex] = React.useState(0);
  const [time, setTime] = React.useState(() => new Date());
  const groupedItemsRef = React.useRef<Record<string, TvItem[]>>({});
  const tvCategoriesRef = React.useRef<string[]>([]);
  const activeItemIndexRef = React.useRef(0);

  const searchParams = new URLSearchParams(window.location.search);
  const recordingParam = searchParams.get("recording");
  const recordingMode = recordingParam === "1" || recordingParam === "true";

  const orderUrl = "https://www.velasquezfoodtruck.com";

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    orderUrl,
  )}`;

  const loadProducts = React.useCallback(async () => {
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel("tv-menu-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          loadProducts();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        () => {
          loadProducts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProducts]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const groupedItems = React.useMemo(() => {
    const grouped: Record<string, TvItem[]> = {};

    for (const category of categories) {
      grouped[category] = [];
    }

    for (const product of products) {
      const item = productToTvItem(product);

      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }

      grouped[item.category].push(item);
    }

    for (const category of categories) {
      if (grouped[category].length === 0) {
        grouped[category] = (menuItems[category] ?? []).map((item, index) =>
          fallbackToTvItem(item, category, index),
        );
      }
    }

    return grouped;
  }, [products]);

  const tvCategories = React.useMemo(() => {
    const availableCategories = categories.filter(
      (category) => (groupedItems[category]?.length ?? 0) > 0,
    );

    return availableCategories.length > 0 ? availableCategories : categories;
  }, [groupedItems]);

  React.useEffect(() => {
    groupedItemsRef.current = groupedItems;
    tvCategoriesRef.current = tvCategories;

    if (activeCategoryIndex >= tvCategories.length) {
      setActiveCategoryIndex(0);
      setActiveItemIndex(0);
      activeItemIndexRef.current = 0;
    }
  }, [activeCategoryIndex, groupedItems, tvCategories]);

  React.useEffect(() => {
    activeItemIndexRef.current = activeItemIndex;
  }, [activeItemIndex]);

  const activeCategory =
    tvCategories[activeCategoryIndex] ?? tvCategories[0] ?? "Tacos";
  const activeItems = groupedItems[activeCategory] ?? [];
  const featuredItem = activeItems[activeItemIndex] ?? activeItems[0];

  const sideItems = activeItems
    .filter((item) => item.id !== featuredItem?.id)
    .slice(0, 4);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCategoryIndex((currentCategoryIndex) => {
        const currentCategories = tvCategoriesRef.current;

        if (currentCategories.length === 0) {
          activeItemIndexRef.current = 0;
          setActiveItemIndex(0);
          return 0;
        }

        const safeCategoryIndex =
          currentCategoryIndex >= currentCategories.length
            ? 0
            : currentCategoryIndex;

        const currentCategory = currentCategories[safeCategoryIndex] ?? "Tacos";
        const itemsInCategory = groupedItemsRef.current[currentCategory] ?? [];
        const currentItemIndex = activeItemIndexRef.current;

        if (
          itemsInCategory.length > 0 &&
          currentItemIndex < itemsInCategory.length - 1
        ) {
          const nextItemIndex = currentItemIndex + 1;
          activeItemIndexRef.current = nextItemIndex;
          setActiveItemIndex(nextItemIndex);
          return safeCategoryIndex;
        }

        activeItemIndexRef.current = 0;
        setActiveItemIndex(0);

        return (safeCategoryIndex + 1) % currentCategories.length;
      });
    }, SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main
      className={`relative h-screen w-screen overflow-hidden bg-[#050505] text-white ${
        recordingMode ? "aspect-video" : ""
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(234,88,12,0.16),transparent_35%)]" />
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden px-5 py-4">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-orange-500/30 bg-black/55 p-3 shadow-[0_0_40px_rgba(249,115,22,0.28)]">
              <img
                src="/images/velasquez-logo.png"
                alt="Velasquez Food Truck"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center gap-7">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.35em] text-orange-300">
                  <Sparkles className="h-3 w-3" />
                  Velasquez Food Truck
                </p>

                <h1 className="text-5xl font-black uppercase leading-none tracking-tight xl:text-6xl">
                  Menu Digital
                </h1>
              </div>

              <div className="hidden h-16 w-px bg-white/10 xl:block" />

              <div className="hidden xl:block">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-white/60">
                  Hecho al momento
                </p>

                <p className="text-2xl font-black text-orange-400">
                  Fresh • Hot • Authentic
                </p>
              </div>
            </div>
          </div>

          {!recordingMode && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 backdrop-blur-md">
              <Clock className="h-5 w-5 text-orange-300" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                  Houston, TX
                </p>

                <p className="text-3xl font-black">{formattedTime}</p>
              </div>
            </div>
          )}
        </header>

        <section className="grid flex-1 grid-cols-[1.45fr_0.55fr] gap-4 overflow-hidden py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${featuredItem?.id ?? "empty"}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[1.5rem] border border-orange-500/20 bg-black/55 shadow-[0_0_55px_rgba(249,115,22,0.15)]"
            >
              {featuredItem ? (
                <>
                  <motion.img
                    key={featuredItem.image}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 10, ease: "linear" }}
                    src={featuredItem.image}
                    alt={featuredItem.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/38 to-black/5" />

                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-600/20 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-orange-200">
                        <Flame className="h-4 w-4" />
                        {activeCategory}
                      </div>

                      <h2 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight xl:text-7xl">
                        {featuredItem.name}
                      </h2>

                      <p className="mt-4 max-w-2xl text-xl font-semibold leading-tight text-white/85 xl:text-2xl">
                        {featuredItem.desc}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                          Precio
                        </p>

                        <p className="text-5xl font-black text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.45)] xl:text-7xl">
                          {featuredItem.price}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-right backdrop-blur-md">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                          Producto {activeItemIndex + 1} de {activeItems.length}
                        </p>

                        <p className="text-lg font-black text-white xl:text-2xl">
                          Fresh • Hot • Authentic
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-3xl font-black text-white/50">
                  {loading ? "Cargando menú..." : "Menú no disponible"}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <aside className="flex flex-col gap-3 overflow-hidden">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-orange-300" />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-200">
                    Ordena desde tu teléfono
                  </p>

                  <h3 className="text-2xl font-black uppercase">
                    Escanea aquí
                  </h3>
                </div>
              </div>

              <div className="mx-auto mt-2 max-w-[235px] rounded-[1.25rem] bg-white p-2">
                <img
                  src={qrUrl}
                  alt="QR Ordering"
                  className="aspect-square w-full rounded-xl"
                />
              </div>

              <p className="mt-1 text-center text-base font-black">
                velasquezfoodtruck.com
              </p>
            </div>

            <div className="min-h-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase">
                  Más de {activeCategory}
                </h3>

                <Wifi className="h-5 w-5 text-green-300" />
              </div>

              <div className="space-y-2">
                {sideItems.length > 0 ? (
                  sideItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-13 w-13 rounded-xl object-cover"
                      />

                      <div>
                        <p className="line-clamp-1 text-lg font-black uppercase">
                          {item.name}
                        </p>

                        <p className="line-clamp-2 text-xs font-medium text-white/60">
                          {item.desc}
                        </p>
                      </div>

                      <p className="text-lg font-black text-orange-300">
                        {item.price}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-lg text-white/50">
                    Esta categoría tiene un producto destacado.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-orange-400" />

                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                  Se actualiza automáticamente
                </p>

                <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]" />
              </div>

              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <img
                  src={ZAMGEL_CORE_LOGO_SRC}
                  alt="Zamgel Core"
                  className="h-8 w-8 object-contain opacity-95"
                />

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/35">
                    Powered by
                  </p>

                  <p className="text-xs font-black tracking-wide text-white/80">
                    Zamgel Core
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {!recordingMode && (
          <footer className="flex items-center gap-2 overflow-x-auto pt-2">
            {tvCategories.map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategoryIndex(index);
                  setActiveItemIndex(0);
                }}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  activeCategory === category
                    ? "border-orange-500 bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.45)]"
                    : "border-white/10 bg-white/[0.04] text-white/55"
                }`}
              >
                {category}
              </button>
            ))}
          </footer>
        )}
      </div>
    </main>
  );
}
