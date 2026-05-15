// 📍 Ruta: src/features/admin/product-options/ProductOptionsDashboard.tsx

import React from "react";
import AdminTopbar from "../components/AdminTopbar";
import {
  CheckCircle2,
  Edit3,
  ListPlus,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type {
  AdminProductOptionProduct,
  ProductOption,
  ProductOptionFormData,
} from "./product-options.types";
import {
  createEmptyOptionForm,
  deleteProductOption,
  getOptionProducts,
  getProductOptions,
  optionToForm,
  saveProductOption,
} from "./product-options.service";

const quickGroups = ["Protein", "Extras", "Ingredientes", "Salsa", "Size"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function OptionFormModal({
  form,
  products,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: ProductOptionFormData;
  products: AdminProductOptionProduct[];
  saving: boolean;
  onChange: (form: ProductOptionFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id ? "Editar opción" : "Nueva opción"}
            </h2>
            <p className="text-sm text-white/50">
              Crea proteínas, extras, ingredientes, salsas o tamaños por producto.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Producto
            </span>
            <select
              value={form.product_id}
              onChange={(event) =>
                onChange({ ...form, product_id: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="">Selecciona producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="bg-black">
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Grupo
            </span>
            <input
              value={form.option_group}
              onChange={(event) =>
                onChange({ ...form, option_group: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Ej. Protein"
              list="option-groups"
            />
            <datalist id="option-groups">
              {quickGroups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Opción
            </span>
            <input
              value={form.option_name}
              onChange={(event) =>
                onChange({ ...form, option_name: event.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Ej. Pastor"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Precio extra
            </span>
            <input
              value={form.extra_price}
              onChange={(event) =>
                onChange({ ...form, extra_price: event.target.value })
              }
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0.00"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Orden visual
            </span>
            <input
              value={form.sort_order}
              onChange={(event) =>
                onChange({ ...form, sort_order: event.target.value })
              }
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="0"
            />
          </label>

          <button
            type="button"
            onClick={() => onChange({ ...form, is_required: !form.is_required })}
            className={`rounded-2xl border px-4 py-3 font-black transition ${
              form.is_required
                ? "border-orange-500/40 bg-orange-500/15 text-orange-100"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {form.is_required ? "Requerida" : "Opcional"}
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...form, is_default: !form.is_default })}
            className={`rounded-2xl border px-4 py-3 font-black transition ${
              form.is_default
                ? "border-green-500/40 bg-green-500/15 text-green-100"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {form.is_default ? "Default" : "No default"}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:bg-white/10"
            type="button"
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 disabled:opacity-60"
            type="button"
          >
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar opción"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductOptionsDashboard() {
  const [products, setProducts] = React.useState<AdminProductOptionProduct[]>([]);
  const [options, setOptions] = React.useState<ProductOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [productFilter, setProductFilter] = React.useState("all");
  const [groupFilter, setGroupFilter] = React.useState("all");
  const [form, setForm] = React.useState<ProductOptionFormData | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [productsData, optionsData] = await Promise.all([
        getOptionProducts(),
        getProductOptions(),
      ]);

      setProducts(productsData);
      setOptions(optionsData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el panel de opciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const groups = React.useMemo(() => {
    return Array.from(new Set(options.map((option) => option.option_group))).sort();
  }, [options]);

  const filteredOptions = options.filter((option) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      option.option_name.toLowerCase().includes(query) ||
      option.option_group.toLowerCase().includes(query) ||
      option.product?.name?.toLowerCase().includes(query);

    const matchesProduct =
      productFilter === "all" || option.product_id === productFilter;

    const matchesGroup =
      groupFilter === "all" || option.option_group === groupFilter;

    return matchesSearch && matchesProduct && matchesGroup;
  });

  const groupedOptions = React.useMemo(() => {
    const map = new Map<string, ProductOption[]>();

    for (const option of filteredOptions) {
      const productName = option.product?.name ?? "Sin producto";
      const key = `${productName}|||${option.product_id}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(option);
    }

    return Array.from(map.entries()).map(([key, items]) => {
      const [productName, productId] = key.split("|||");
      return { productName, productId, items };
    });
  }, [filteredOptions]);

  const handleSave = async () => {
    if (!form) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveProductOption(form);

      setSuccess(form.id ? "Opción actualizada." : "Opción creada.");
      setForm(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (option: ProductOption) => {
    const confirmed = window.confirm(
      `¿Eliminar "${option.option_name}" de ${option.product?.name ?? "este producto"}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteProductOption(option.id);

      setSuccess("Opción eliminada.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la opción.");
    }
  };

  const selectedProductId = productFilter === "all" ? "" : productFilter;

  return (
  <>
    <AdminTopbar />

    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
              <ListPlus className="h-4 w-4" />
              Opciones y extras
            </div>

            <h1 className="text-3xl font-black sm:text-4xl">
              Modificadores <span className="text-orange-500">Velasquez</span>
            </h1>

            <p className="mt-1 text-sm text-white/60">
              Administra proteínas, extras, ingredientes, salsas y cargos adicionales.
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
              onClick={() => setForm(createEmptyOptionForm(selectedProductId))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-500"
            >
              <Plus className="h-5 w-5" />
              Nueva opción
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_260px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar opción, grupo o producto..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/60"
              />
            </div>

            <select
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/60"
            >
              <option value="all">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="bg-black">
                  {product.name}
                </option>
              ))}
            </select>

            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/60"
            >
              <option value="all">Todos los grupos</option>
              {groups.map((group) => (
                <option key={group} value={group} className="bg-black">
                  {group}
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
            Cargando opciones...
          </div>
        )}

        {!loading && filteredOptions.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
            <h2 className="text-xl font-black">No hay opciones para mostrar</h2>
            <p className="mt-1 text-white/60">
              Crea proteínas, extras o ingredientes para tus productos.
            </p>
          </div>
        )}

        {!loading && groupedOptions.length > 0 && (
          <div className="space-y-5">
            {groupedOptions.map((group) => (
              <section
                key={group.productId}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {group.productName}
                    </h2>
                    <p className="text-sm font-bold text-white/40">
                      {group.items.length} opción{group.items.length === 1 ? "" : "es"}
                    </p>
                  </div>

                  <button
                    onClick={() => setForm(createEmptyOptionForm(group.productId))}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 font-black text-orange-100 transition hover:bg-orange-500/20"
                  >
                    <Plus className="h-5 w-5" />
                    Agregar a este producto
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((option) => (
                    <article
                      key={option.id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-orange-300">
                            {option.option_group}
                          </p>
                          <h3 className="text-xl font-black text-white">
                            {option.option_name}
                          </h3>
                        </div>

                        <p
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            option.extra_price > 0
                              ? "bg-orange-500/15 text-orange-200"
                              : "bg-green-500/15 text-green-200"
                          }`}
                        >
                          {option.extra_price > 0
                            ? `+${formatMoney(option.extra_price)}`
                            : "Sin cargo"}
                        </p>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {option.is_required && (
                          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-200">
                            Requerida
                          </span>
                        )}

                        {option.is_default && (
                          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-black text-green-200">
                            Default
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                          Orden {option.sort_order}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setForm(optionToForm(option))}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-black text-white transition hover:bg-white/[0.10]"
                        >
                          <Edit3 className="h-5 w-5" />
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(option)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-100 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-5 w-5" />
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {form && (
          <OptionFormModal
            form={form}
            products={products}
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
