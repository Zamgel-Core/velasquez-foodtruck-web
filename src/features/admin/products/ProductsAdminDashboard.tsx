// 📍 Ruta: src/features/admin/products/ProductsAdminDashboard.tsx

import React from "react";
import AdminTopbar from "../components/AdminTopbar";
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  X,
} from "lucide-react";
import type {
  AdminCategory,
  AdminProduct,
  ProductFormData,
} from "./admin-products.types";
import {
  createEmptyProductForm,
  getAdminCategories,
  getAdminProducts,
  productToForm,
  saveAdminProduct,
  toggleProductAvailability,
  updateProductPrice,
} from "./admin-products.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function ProductFormModal({
  form,
  categories,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: ProductFormData;
  categories: AdminCategory[];
  saving: boolean;
  onChange: (form: ProductFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-sm text-white/50">
              Controla menú, precios, disponibilidad e imagen.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Nombre
            </span>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Ej. Regular Tacos"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Categoría
            </span>
            <select
              value={form.category_id}
              onChange={(e) =>
                onChange({ ...form, category_id: e.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-black"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Precio
            </span>
            <input
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0.00"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Tiempo prep. min
            </span>
            <input
              value={form.prep_time_minutes}
              onChange={(e) =>
                onChange({ ...form, prep_time_minutes: e.target.value })
              }
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="10"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Orden visual
            </span>
            <input
              value={form.sort_order}
              onChange={(e) =>
                onChange({ ...form, sort_order: e.target.value })
              }
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="1"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Imagen URL
            </span>
            <input
              value={form.image_url}
              onChange={(e) => onChange({ ...form, image_url: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="/images/product.png"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Descripción
            </span>
            <textarea
              value={form.description}
              onChange={(e) =>
                onChange({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Descripción del producto..."
            />
          </label>

          <button
            type="button"
            onClick={() =>
              onChange({ ...form, is_available: !form.is_available })
            }
            className={`rounded-2xl border px-4 py-3 font-black transition ${
              form.is_available
                ? "border-green-500/40 bg-green-500/15 text-green-100"
                : "border-red-500/40 bg-red-500/15 text-red-100"
            }`}
          >
            {form.is_available ? "Disponible" : "No disponible"}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...form, is_featured: !form.is_featured })
            }
            className={`rounded-2xl border px-4 py-3 font-black transition ${
              form.is_featured
                ? "border-orange-500/40 bg-orange-500/15 text-orange-100"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {form.is_featured ? "Destacado" : "No destacado"}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:bg-white/10"
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsAdminDashboard() {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [form, setForm] = React.useState<ProductFormData | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el panel de productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
    if (!form) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveAdminProduct(form);
      setSuccess(form.id ? "Producto actualizado." : "Producto creado.");
      setForm(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (product: AdminProduct) => {
    try {
      setError("");
      setSuccess("");

      await toggleProductAvailability(product);
      setSuccess(
        product.is_available
          ? "Producto marcado como no disponible."
          : "Producto marcado como disponible.",
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar la disponibilidad.");
    }
  };

  const handleQuickPrice = async (product: AdminProduct) => {
    const nextPrice = window.prompt(
      `Nuevo precio para ${product.name}`,
      String(product.price),
    );

    if (nextPrice === null) return;

    const price = Number(nextPrice);

    if (!price || price <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await updateProductPrice(product.id, price);
      setSuccess("Precio actualizado.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el precio.");
    }
  };

  return (
    <>
      <AdminTopbar />

      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                <Tag className="h-4 w-4" />
                Admin menú
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Productos <span className="text-orange-500">Velasquez</span>
              </h1>

              <p className="mt-1 text-sm text-white/60">
                Agrega, edita y controla disponibilidad del menú.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-black text-white shadow-lg transition hover:bg-white/[0.10]"
              >
                <RefreshCw className="h-5 w-5" />
                Actualizar
              </button>

              <button
                onClick={() => setForm(createEmptyProductForm())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
              >
                <Plus className="h-5 w-5" />
                Nuevo producto
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/60"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/60"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-black"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-3xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-200">
              {success}
            </div>
          )}

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/70">
              Cargando productos...
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
              <h2 className="text-xl font-black">
                No hay productos para mostrar
              </h2>
              <p className="mt-1 text-white/60">
                Cambia los filtros o crea un producto nuevo.
              </p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-orange-950/10 lg:grid-cols-[120px_1fr_auto]"
                >
                  <div className="h-28 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-white/30">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-white">
                        {product.name}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          product.is_available
                            ? "border-green-500/40 bg-green-500/10 text-green-200"
                            : "border-red-500/40 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {product.is_available ? "Disponible" : "No disponible"}
                      </span>

                      {product.is_featured && (
                        <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-200">
                          Destacado
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-white/50">
                      {product.category?.name ?? "Sin categoría"} ·{" "}
                      {product.prep_time_minutes ?? 0} min · Orden{" "}
                      {product.sort_order ?? "-"}
                    </p>

                    <p className="mt-2 max-w-3xl text-sm text-white/70">
                      {product.description || "Sin descripción."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[220px]">
                    <button
                      onClick={() => handleQuickPrice(product)}
                      className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-left font-black text-orange-200 transition hover:bg-orange-500/20"
                    >
                      {formatMoney(product.price)}
                      <span className="ml-2 text-xs text-white/40">
                        Cambiar
                      </span>
                    </button>

                    <button
                      onClick={() => setForm(productToForm(product))}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-black text-white transition hover:bg-white/[0.10]"
                    >
                      <Edit3 className="h-5 w-5" />
                      Editar
                    </button>

                    <button
                      onClick={() => handleToggle(product)}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-black transition ${
                        product.is_available
                          ? "border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                          : "border-green-500/30 bg-green-500/10 text-green-100 hover:bg-green-500/20"
                      }`}
                    >
                      {product.is_available ? (
                        <>
                          <EyeOff className="h-5 w-5" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-5 w-5" />
                          Activar
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {form && (
            <ProductFormModal
              form={form}
              categories={categories}
              saving={saving}
              onChange={setForm}
              onClose={() => setForm(null)}
              onSave={handleSave}
            />
          )}
        </section>
      </main>
    </>
  );
}
