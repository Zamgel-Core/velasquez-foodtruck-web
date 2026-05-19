// 📍 Ruta: src/features/admin/social-videos/SocialVideosAdminPage.tsx

import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import {
  createEmptySocialVideoForm,
  deleteAdminSocialVideo,
  getAdminSocialVideos,
  saveAdminSocialVideo,
  socialVideoToForm,
  type AdminSocialVideo,
  type SocialVideoFormData,
} from "./social-videos.service";

export default function SocialVideosAdminPage() {
  const [videos, setVideos] = React.useState<AdminSocialVideo[]>([]);
  const [form, setForm] = React.useState<SocialVideoFormData>(() =>
    createEmptySocialVideoForm(),
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const loadVideos = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");
      const data = await getAdminSocialVideos();
      setVideos(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const updateForm = <K extends keyof SocialVideoFormData>(
    key: K,
    value: SocialVideoFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");

      await saveAdminSocialVideo(form);
      setForm(createEmptySocialVideoForm());
      await loadVideos();

      setMessage("Video guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (video: AdminSocialVideo) => {
    const confirmed = window.confirm(`¿Eliminar "${video.title}"?`);

    if (!confirmed) return;

    try {
      setMessage("");
      await deleteAdminSocialVideo(video.id);
      await loadVideos();
      setMessage("Video eliminado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60 transition hover:border-orange-500/40 hover:text-orange-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al portal
            </a>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-orange-200">
              <Video className="h-4 w-4" />
              Redes Sociales
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Videos de TikTok
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/55 sm:text-base">
              Pega links de TikTok para mostrarlos en la página principal.
            </p>
          </div>

          <button
            onClick={loadVideos}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
          >
            <div className="mb-5 flex items-center gap-2 text-lg font-black">
              {form.id ? (
                <Edit3 className="h-5 w-5 text-orange-300" />
              ) : (
                <Plus className="h-5 w-5 text-orange-300" />
              )}
              {form.id ? "Editar video" : "Agregar video"}
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Título
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="Ej. Tacos recién hechos"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Link de TikTok
              </span>
              <input
                value={form.video_url}
                onChange={(event) =>
                  updateForm("video_url", event.target.value)
                }
                placeholder="https://www.tiktok.com/@usuario/video/..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Orden
              </span>
              <input
                type="number"
                min="1"
                value={form.sort_order}
                onChange={(event) =>
                  updateForm("sort_order", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-orange-500/60"
              />
            </label>

            <label className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-sm font-bold text-white/75">
                Activo en la página
              </span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateForm("is_active", event.target.checked)
                }
                className="h-5 w-5 accent-orange-500"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>

              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(createEmptySocialVideoForm())}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/65 transition hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>
          </motion.form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/30">
            <h2 className="mb-4 text-xl font-black">Videos guardados</h2>

            {isLoading ? (
              <div className="text-sm font-bold text-white/45">
                Cargando videos...
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm font-bold text-white/45">
                Todavía no hay videos guardados.
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black">{video.title}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                              video.is_active
                                ? "bg-green-500/15 text-green-300"
                                : "bg-red-500/15 text-red-300"
                            }`}
                          >
                            {video.is_active ? "Activo" : "Inactivo"}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/45">
                            Orden {video.sort_order}
                          </span>
                        </div>

                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex max-w-full items-center gap-2 truncate text-xs font-bold text-orange-300 hover:text-orange-200"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{video.video_url}</span>
                        </a>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setForm(socialVideoToForm(video))}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/65 transition hover:border-orange-500/40 hover:text-orange-200"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(video)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 transition hover:bg-red-500/20"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
