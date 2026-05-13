// 📍 Ruta: src/features/menu/components/MenuGrid.tsx

import { useProducts } from "../../../hooks/useProducts";

export default function MenuGrid() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <section className="py-20 text-center text-white">
        Cargando menú...
      </section>
    );
  }

  return (
    <section className="px-6 py-16 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-10">
          Nuestro Menú
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">
                    {product.name}
                  </h3>

                  <span className="text-orange-500 font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-zinc-400 text-sm">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}