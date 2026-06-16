// 📍 Ruta: src/components/MenuSection.tsx

import { motion } from "motion/react";
import { useMemo } from "react";
import { categories, menuItems } from "../data/menu";
import { useProducts } from "../hooks/useProducts";
import type { Lang, MenuItem } from "../types";

type MenuSectionProps = {
  lang: Lang;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  addItem: (item: {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  }) => void;
  t: {
    menuTitle: string;
    menuSubtitle: string;
    popular: string;
    proteins: string;
    ask: string;
  };
};

export function MenuSection({
  lang,
  activeCategory,
  setActiveCategory,
  addItem,
  t,
}: MenuSectionProps) {
  const { products, loading } = useProducts();

  const normalizeCategory = (category: string) =>
    category === "Especialidades" ? "Antojitos" : category;

  const showProteins = ["Tacos", "Tortas", "Burritos", "Antojitos"].includes(
    activeCategory,
  );

  const dynamicMenuItems = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};

    for (const category of categories) {
      grouped[category] = [];
    }

    for (const product of products) {
      const category = normalizeCategory(product.category || "Extras");

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({
        id: product.id,
        name: product.name,
        enName: product.name_en || product.name,
        price: `$${Number(product.price).toFixed(2)}`,
        image: product.image_url,
        desc: product.description,
        enDesc: product.description_en || product.description,
        isAvailable: product.is_available,
      });
    }

    return grouped;
  }, [products]);

  const activeItems =
    dynamicMenuItems[activeCategory]?.length > 0
      ? dynamicMenuItems[activeCategory]
      : (menuItems[activeCategory] ?? []);

  return (
    <section id="menu" className="relative overflow-hidden px-4 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.18),transparent_35%)]" />
      <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase sm:text-6xl">
            {t.menuTitle.split(" ")[0]}{" "}
            <span className="text-red-500">{t.menuTitle.split(" ")[1]}</span>
          </h2>

          <p className="mt-4 text-white/60">{t.menuSubtitle}</p>
        </div>

        <h3 className="mt-14 text-center text-2xl font-black uppercase">
          {t.popular}
        </h3>

        <div className="scrollbar-hide mx-auto mt-8 flex w-full max-w-full gap-2 overflow-x-auto px-1 pb-2 sm:max-w-6xl sm:justify-center lg:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-3 text-[11px] font-black uppercase tracking-wider transition lg:px-5 lg:text-xs ${
                activeCategory === category
                  ? "border-red-500 bg-red-600 text-white shadow-[0_0_22px_rgba(220,38,38,0.5)]"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-red-500/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-white/40 sm:hidden">
          {lang === "es" ? "Desliza para ver más →" : "Swipe to see more →"}
        </div>

        {showProteins && (
          <div className="mx-auto mt-5 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-red-500/15 bg-black/45 px-4 py-3 text-center backdrop-blur-sm">
            <span className="mr-1 text-xs font-black uppercase tracking-[0.16em] text-red-300">
              {t.proteins}
            </span>

            {[
              lang === "es" ? "Pollo" : "Chicken",
              "Fajita",
              "Pastor",
              "Chorizo",
              "Barbacoa +$2.50",
              "Campechano +$2.50",
              lang === "es" ? "Tripa +$2.50" : "Tripe +$2.50",
            ].map((protein) => (
              <span
                key={protein}
                className="rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[10px] font-black text-red-200 lg:px-3 lg:text-[11px]"
              >
                {protein}
              </span>
            ))}

            <span className="w-full text-[11px] font-semibold text-white/40 sm:w-auto sm:pl-2">
              {t.ask}
            </span>
          </div>
        )}

        {loading && (
          <p className="mt-8 text-center text-sm text-white/50">
            {lang === "es" ? "Cargando menú..." : "Loading menu..."}
          </p>
        )}

        <div className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeItems.map((item) => {
            const isAvailable = item.isAvailable !== false;

            return (
            <motion.div
              key={item.id || item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              whileHover={isAvailable ? { y: -8 } : undefined}
              className={`group overflow-hidden rounded-3xl border p-3 shadow-xl shadow-black/20 transition duration-300 ${
                isAvailable
                  ? "border-white/10 bg-white/[0.04] hover:border-red-500/60 hover:bg-red-500/[0.045] hover:shadow-[0_0_34px_rgba(220,38,38,0.22)]"
                  : "border-red-500/25 bg-red-950/20 opacity-75"
              }`}
            >
              <div className="relative h-44 overflow-hidden rounded-2xl bg-zinc-900 sm:h-48">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
                {!isAvailable && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-4 text-center backdrop-blur-[1px]">
                    <span className="rounded-full border border-red-400/40 bg-red-600/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-red-600/30">
                      {lang === "es" ? "Agotado temporalmente" : "Temporarily sold out"}
                    </span>
                  </div>
                )}
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition duration-700 ${
                    isAvailable ? "group-hover:scale-110" : "grayscale"
                  }`}
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-2 pt-4">
                <div>
                  <h4 className="text-lg font-black">
                    {lang === "en" && item.enName ? item.enName : item.name}
                  </h4>

                  <p className="mt-2 text-sm text-white/60">
                    {lang === "es" ? item.desc : item.enDesc}
                  </p>
                </div>

                {item.price && (
                  <p
                    className={`shrink-0 rounded-full px-3 py-1 font-black ${
                      isAvailable
                        ? "bg-red-500/10 text-red-400"
                        : "border border-red-500/25 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {item.price}
                  </p>
                )}
              </div>

              {item.price && (
                <button
                  onClick={() => {
                    if (!isAvailable) return;

                    addItem({
                      productId: item.id || item.name,
                      name:
                        lang === "en" && item.enName ? item.enName : item.name,
                      price: Number(String(item.price).replace("$", "")),
                      imageUrl: item.image,
                    });
                  }}
                  disabled={!isAvailable}
                  className={`mt-4 w-full rounded-full px-4 py-3 text-sm font-black text-white shadow-lg transition ${
                    isAvailable
                      ? "bg-red-600 shadow-red-600/15 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-red-500 hover:shadow-red-600/30"
                      : "cursor-not-allowed bg-zinc-800 text-white/45 shadow-none"
                  }`}
                >
                  {isAvailable
                    ? lang === "es"
                      ? "Agregar al pedido"
                      : "Add to order"
                    : lang === "es"
                      ? "Agotado"
                      : "Sold out"}
                </button>
              )}
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
