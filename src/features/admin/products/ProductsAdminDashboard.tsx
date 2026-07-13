// 📍 Ruta: src/features/admin/products/ProductsAdminDashboard.tsx

import React from "react";
import AdminTopbar from "../components/AdminTopbar";
import {
  Archive,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Layers3,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Tag,
  X,
} from "lucide-react";
import type {
  AdminCategory,
  AdminProduct,
  CategoryFormData,
  ProductFormData,
} from "./admin-products.types";
import {
  categoryToForm,
  createEmptyCategoryForm,
  createEmptyProductForm,
  getAdminCategories,
  deleteAdminCategory,
  getAdminProducts,
  productToForm,
  saveAdminCategory,
  saveAdminProduct,
  toggleCategoryActive,
  toggleProductActive,
  toggleProductAvailability,
  updateProductPrice,
} from "./admin-products.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const MAX_IMAGE_SIZE_MB = 6;

function validateProductImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return "Selecciona un archivo de imagen válido.";
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `La imagen debe pesar menos de ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  return "";
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-red-500/20 bg-[#0a0a0a] p-5 text-white shadow-2xl shadow-red-950/20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id
                ? "Editar elemento del menú"
                : "Agregar elemento al menú"}
            </h2>
            <p className="text-sm text-white/50">
              Controla nombres bilingües, precios, disponibilidad e imagen.
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
          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Nombre (Español)
            </span>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Ej. Regular Tacos"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">
              Name (English)
            </span>
            <input
              value={form.name_en}
              onChange={(e) => onChange({ ...form, name_en: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Ex. Regular Tacos"
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
              placeholder="1"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Imagen del producto
            </span>

            <div className="grid gap-4 rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-4 sm:grid-cols-[180px_1fr]">
              <div className="h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                {form.image_preview_url || form.image_url ? (
                  <img
                    src={form.image_preview_url || form.image_url}
                    alt={form.name || "Producto"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/35">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-bold">Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-3">
                <p className="text-sm font-semibold leading-relaxed text-white/60">
                  Sube una foto desde la computadora o tablet. Se guardará en
                  Supabase Storage y aparecerá en el menú público, POS y TV
                  Menu.
                </p>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-500">
                  <ImagePlus className="h-5 w-5" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      const validationError = validateProductImage(file);
                      if (validationError) {
                        window.alert(validationError);
                        event.target.value = "";
                        return;
                      }

                      onChange({
                        ...form,
                        image_file: file,
                        image_preview_url: URL.createObjectURL(file),
                      });
                    }}
                  />
                </label>

                {(form.image_preview_url || form.image_url) && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...form,
                        image_url: "",
                        image_file: null,
                        image_preview_url: "",
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="h-5 w-5" />
                    Quitar imagen
                  </button>
                )}

                <details className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-white/45">
                  <summary className="cursor-pointer font-bold text-white/60">
                    Usar URL manual avanzada
                  </summary>
                  <input
                    value={form.image_url}
                    onChange={(e) =>
                      onChange({
                        ...form,
                        image_url: e.target.value,
                        image_file: null,
                        image_preview_url: e.target.value,
                      })
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                    placeholder="/images/product.png o URL externa"
                  />
                </details>
              </div>
            </div>
          </div>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Descripción (Español)
            </span>
            <textarea
              value={form.description}
              onChange={(e) =>
                onChange({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Descripción del producto en español..."
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">
              Description (English)
            </span>
            <textarea
              value={form.description_en}
              onChange={(e) =>
                onChange({ ...form, description_en: e.target.value })
              }
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Product description in English..."
            />
            <span className="mt-2 block text-xs font-semibold text-red-200/70">
              Recomendado: completa la versión en inglés para mantener el menú
              bilingüe.
            </span>
          </label>

          <button
            type="button"
            onClick={() => onChange({ ...form, is_active: !form.is_active })}
            className={`rounded-2xl border px-4 py-3 font-black transition sm:col-span-2 ${
              form.is_active
                ? "border-white/10 bg-white/5 text-white/70"
                : "border-amber-500/40 bg-amber-500/15 text-amber-100"
            }`}
          >
            {form.is_active
              ? "Producto activo en el menú"
              : "Producto retirado del menú"}
          </button>

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
            {form.is_available ? "Disponible" : "Agotado temporalmente"}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...form, is_featured: !form.is_featured })
            }
            className={`rounded-2xl border px-4 py-3 font-black transition ${
              form.is_featured
                ? "border-red-500/40 bg-red-500/15 text-red-100"
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar elemento"}
          </button>
        </div>
      </div>
    </div>
  );
}


function CategoryFormModal({
  form,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: CategoryFormData;
  saving: boolean;
  onChange: (form: CategoryFormData) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-red-500/20 bg-[#0a0a0a] p-5 text-white shadow-2xl shadow-red-950/20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {form.id ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <p className="text-sm text-white/50">
              Define los nombres bilingües, orden y visibilidad.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">Nombre (Español)</span>
            <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500" placeholder="Ej. Postres" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">Name (English)</span>
            <input value={form.name_en} onChange={(e) => onChange({ ...form, name_en: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500" placeholder="Ex. Desserts" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-white/70">Orden visual</span>
            <input type="number" min="0" value={form.sort_order} onChange={(e) => onChange({ ...form, sort_order: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500" placeholder="9" />
          </label>
          <button type="button" onClick={() => onChange({ ...form, is_active: !form.is_active })} className={`self-end rounded-2xl border px-4 py-3 font-black transition ${form.is_active ? "border-green-500/40 bg-green-500/15 text-green-100" : "border-amber-500/40 bg-amber-500/15 text-amber-100"}`}>
            {form.is_active ? "Categoría activa" : "Categoría oculta"}
          </button>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-white/70">Descripción interna (opcional)</span>
            <textarea rows={3} value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-red-500" placeholder="Notas o descripción de la categoría..." />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black transition hover:bg-white/10">Cancelar</button>
          <button onClick={onSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 disabled:opacity-60">
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar categoría"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteCategoryModal({
  category,
  categories,
  productCount,
  saving,
  onClose,
  onDelete,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  productCount: number;
  saving: boolean;
  onClose: () => void;
  onDelete: (moveToCategoryId: string | null | undefined) => void;
}) {
  const [destination, setDestination] = React.useState("");
  const alternatives = categories.filter((item) => item.id !== category.id);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-red-500/25 bg-[#0a0a0a] p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Eliminar categoría</h2>
            <p className="mt-1 text-sm text-white/55">Esta acción elimina “{category.name}” definitivamente.</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2"><X className="h-5 w-5" /></button>
        </div>

        {productCount > 0 ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-black text-amber-100">La categoría contiene {productCount} producto{productCount === 1 ? "" : "s"}.</p>
            <p className="mt-1 text-sm text-amber-100/70">Antes de eliminarla, selecciona otra categoría para moverlos o déjalos sin categoría.</p>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-bold text-white outline-none focus:border-red-500">
              <option value="">Mover a: Sin categoría</option>
              {alternatives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">La categoría está vacía y puede eliminarse.</div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black">Cancelar</button>
          <button onClick={() => onDelete(productCount > 0 ? destination || null : undefined)} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white disabled:opacity-60">
            <Trash2 className="h-5 w-5" />
            {saving ? "Eliminando..." : productCount > 0 ? "Mover y eliminar" : "Eliminar categoría"}
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
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [form, setForm] = React.useState<ProductFormData | null>(null);
  const [categoryForm, setCategoryForm] = React.useState<CategoryFormData | null>(null);
  const [categoryToDelete, setCategoryToDelete] = React.useState<AdminCategory | null>(null);

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
      product.name_en?.toLowerCase().includes(query) ||
      product.description_en?.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "retired" && !product.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
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
          ? "Elemento marcado como agotado en menú y POS."
          : "Elemento marcado como disponible en menú y POS.",
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar la disponibilidad.");
    }
  };

  const handleProductActive = async (product: AdminProduct) => {
    const action = product.is_active ? "retirar" : "reactivar";

    if (
      product.is_active &&
      !window.confirm(
        `¿Deseas retirar ${product.name} del menú? Ya no aparecerá en la web, POS ni TV Menu, pero conservará su historial.`,
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await toggleProductActive(product);
      setSuccess(
        product.is_active
          ? "Producto retirado del menú, POS y TV Menu."
          : "Producto reactivado correctamente.",
      );
      await loadData();
    } catch (err) {
      console.error(err);
      setError(`No se pudo ${action} el producto.`);
    }
  };

  const handleCategoryActive = async (category: AdminCategory) => {
    if (
      category.is_active &&
      !window.confirm(
        `¿Deseas desactivar la categoría ${category.name}? Sus productos dejarán de aparecer en la web, POS y TV Menu.`,
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await toggleCategoryActive(category);
      setSuccess(
        category.is_active
          ? "Categoría desactivada y oculta en todos los menús."
          : "Categoría reactivada correctamente.",
      );
      await loadData();
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado de la categoría.");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await saveAdminCategory(categoryForm);
      setSuccess(categoryForm.id ? "Categoría actualizada." : "Categoría creada.");
      setCategoryForm(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (moveToCategoryId: string | null | undefined) => {
    if (!categoryToDelete) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deleteAdminCategory(categoryToDelete.id, moveToCategoryId);
      setSuccess("Categoría eliminada correctamente.");
      setCategoryToDelete(null);
      if (categoryFilter === categoryToDelete.id) setCategoryFilter("all");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
    } finally {
      setSaving(false);
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
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                <Tag className="h-4 w-4" />
                Admin menú
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Productos <span className="text-red-500">Velasquez</span>
              </h1>

              <p className="mt-1 text-sm text-white/60">
                Agrega, edita, retira productos y administra categorías.
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-red-500/60"
                />
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-500/60"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Productos activos</option>
                  <option value="retired">Productos retirados</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-500/60"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-black"
                    >
                      {category.name}
                      {category.is_active ? "" : " (inactiva)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-red-400" />
                <div>
                  <h2 className="font-black">Administración de categorías</h2>
                  <p className="text-xs text-white/45">Crea, edita, ordena, oculta o elimina categorías del menú.</p>
                </div>
              </div>
              <button onClick={() => setCategoryForm(createEmptyCategoryForm())} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-500">
                <Plus className="h-4 w-4" /> Nueva categoría
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/[0.05] text-xs uppercase text-white/45">
                  <tr>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Inglés</th>
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {categories.map((category) => {
                    const productCount = products.filter((product) => product.category_id === category.id).length;
                    return (
                      <tr key={category.id} className="bg-black/20">
                        <td className="px-4 py-3 font-black text-white">{category.name}</td>
                        <td className="px-4 py-3 text-white/55">{category.name_en || "—"}</td>
                        <td className="px-4 py-3 text-white/70">{category.sort_order ?? "—"}</td>
                        <td className="px-4 py-3 text-white/70">{productCount}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleCategoryActive(category)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${category.is_active ? "border-green-500/30 bg-green-500/10 text-green-100" : "border-amber-500/30 bg-amber-500/10 text-amber-100"}`}>
                            {category.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            {category.is_active ? "Activa" : "Oculta"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setCategoryForm(categoryToForm(category))} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 font-black transition hover:bg-white/10"><Edit3 className="h-4 w-4" /> Editar</button>
                            <button onClick={() => setCategoryToDelete(category)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 font-black text-red-100 transition hover:bg-red-500/20"><Trash2 className="h-4 w-4" /> Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                  className={`grid gap-4 rounded-3xl border p-4 shadow-xl shadow-red-950/10 lg:grid-cols-[120px_1fr_auto] ${
                    product.is_active
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-amber-500/25 bg-amber-950/10 opacity-75"
                  }`}
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

                      {!product.is_active && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-200">
                          Retirado
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          product.is_available
                            ? "border-green-500/40 bg-green-500/10 text-green-200"
                            : "border-red-500/40 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {product.is_available ? "Disponible" : "Agotado"}
                      </span>

                      {product.is_featured && (
                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200">
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
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left font-black text-red-200 transition hover:bg-red-500/20"
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
                          Marcar agotado
                        </>
                      ) : (
                        <>
                          <Eye className="h-5 w-5" />
                          Marcar disponible
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleProductActive(product)}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 font-black transition ${
                        product.is_active
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20"
                          : "border-green-500/30 bg-green-500/10 text-green-100 hover:bg-green-500/20"
                      }`}
                    >
                      {product.is_active ? (
                        <>
                          <Archive className="h-5 w-5" />
                          Retirar del menú
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-5 w-5" />
                          Reactivar producto
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

          {categoryForm && (
            <CategoryFormModal
              form={categoryForm}
              saving={saving}
              onChange={setCategoryForm}
              onClose={() => setCategoryForm(null)}
              onSave={handleSaveCategory}
            />
          )}

          {categoryToDelete && (
            <DeleteCategoryModal
              category={categoryToDelete}
              categories={categories}
              productCount={products.filter((product) => product.category_id === categoryToDelete.id).length}
              saving={saving}
              onClose={() => setCategoryToDelete(null)}
              onDelete={handleDeleteCategory}
            />
          )}
        </section>
      </main>
    </>
  );
}
