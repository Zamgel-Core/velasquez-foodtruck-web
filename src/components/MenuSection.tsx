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

  const dynamicMenuItems = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};

    for (const category of categories) {
      grouped[category] = [];
    }

    for (const product of products) {
      const category = product.category || "Extras";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({
        id: product.id,
        name: product.name,
        price: `$${Number(product.price).toFixed(2)}`,
        image: product.image_url,
        desc: product.description,
        enDesc: product.description,
      });
    }

    return grouped;
  }, [products]);

  const activeItems =
    dynamicMenuItems[activeCategory]?.length > 0
      ? dynamicMenuItems[activeCategory]
      : menuItems[activeCategory] ?? [];

  const showProteins = ["Tortas", "Burritos", "Especialidades"].includes(
    activeCategory
  );

  return (
    <section id="menu" className="relative px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.18),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase sm:text-6xl">
            {t.menuTitle.split(" ")[0]}{" "}
            <span className="text-orange-500">
              {t.menuTitle.split(" ")[1]}
            </span>
          </h2>

          <p className="mt-4 text-white/60">{t.menuSubtitle}</p>
        </div>

        <h3 className="mt-14 text-center text-2xl font-black uppercase">
          {t.popular}
        </h3>

        <div className="scrollbar-hide mx-auto mt-8 flex w-full max-w-full gap-3 overflow-x-auto px-4 pb-2 sm:max-w-4xl sm:justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
                activeCategory === category
                  ? "border-orange-500 bg-orange-600 text-white shadow-[0_0_22px_rgba(234,88,12,0.5)]"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-orange-500/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-white/40 sm:hidden">
          {lang === "es" ? "Desliza para ver más →" : "Swipe to see more →"}
        </div>

        {loading && (
          <p className="mt-8 text-center text-sm text-white/50">
            {lang === "es" ? "Cargando menú..." : "Loading menu..."}
          </p>
        )}

        <div className="mx-auto mt-10 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeItems.map((item) => (
            <motion.div
              key={item.id || item.name}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-orange-500/60 hover:shadow-[0_0_28px_rgba(234,88,12,0.2)]"
            >
              <div className="h-44 overflow-hidden rounded-2xl bg-zinc-900 sm:h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
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
                  <p className="shrink-0 font-black text-orange-500">
                    {item.price}
                  </p>
                )}
              </div>

              {item.price && (
                <button
                  onClick={() =>
                    addItem({
                      productId: item.id || item.name,
                      name:
                        lang === "en" && item.enName ? item.enName : item.name,
                      price: Number(String(item.price).replace("$", "")),
                      imageUrl: item.image,
                    })
                  }
                  className="mt-4 w-full rounded-full bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-orange-500"
                >
                  {lang === "es" ? "Agregar al pedido" : "Add to order"}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {showProteins && (
          <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <h4 className="font-black">{t.proteins}</h4>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                lang === "es" ? "Pollo" : "Chicken",
                lang === "es" ? "Fajita de res" : "Beef fajita",
                "Pastor",
                "Chorizo",
                "Barbacoa +$2",
                "Campechano +$2.50",
              ].map((protein) => (
                <span
                  key={protein}
                  className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300"
                >
                  {protein}
                </span>
              ))}
            </div>

            <p className="mt-4 text-sm text-white/55">{t.ask}</p>
          </div>
        )}
      </div>
    </section>
  );
}