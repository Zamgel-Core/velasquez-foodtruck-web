// 📍 Ruta: src/features/admin/surveys/SurveysAdminPage.tsx

import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import {
  createEmptySurveyForm,
  deleteAdminSurvey,
  getAdminSurveys,
  getSurveyResponses,
  saveAdminSurvey,
  surveyToForm,
  type AdminSurvey,
  type SurveyFormData,
  type SurveyResponse,
} from "./admin-surveys.service";

function getResults(survey: AdminSurvey, responses: SurveyResponse[]) {
  const surveyResponses = responses.filter((response) => response.survey_id === survey.id);
  const total = surveyResponses.length;

  return survey.options.map((option) => {
    const count = surveyResponses.filter(
      (response) => response.selected_option_id === option.id,
    ).length;

    return {
      option,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export default function SurveysAdminPage() {
  const [surveys, setSurveys] = React.useState<AdminSurvey[]>([]);
  const [responses, setResponses] = React.useState<SurveyResponse[]>([]);
  const [form, setForm] = React.useState<SurveyFormData>(() => createEmptySurveyForm());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");
      const [surveyData, responseData] = await Promise.all([
        getAdminSurveys(),
        getSurveyResponses(),
      ]);
      setSurveys(surveyData);
      setResponses(responseData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updateForm = <K extends keyof SurveyFormData>(key: K, value: SurveyFormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateOption = (
    index: number,
    key: "label_es" | "label_en",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option,
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      await saveAdminSurvey(form);
      setForm(createEmptySurveyForm());
      await loadData();
      setMessage("Encuesta guardada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (survey: AdminSurvey) => {
    const confirmed = window.confirm(`¿Eliminar encuesta: "${survey.question_es}"?`);
    if (!confirmed) return;

    try {
      setMessage("");
      await deleteAdminSurvey(survey.id);
      if (form.id === survey.id) setForm(createEmptySurveyForm());
      await loadData();
      setMessage("Encuesta eliminada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al portal
            </a>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200">
              <BarChart3 className="h-4 w-4" />
              Encuestas
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Encuestas Velasquez
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/55 sm:text-base">
              Crea una encuesta activa para la página y revisa las respuestas de los clientes.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-red-500/15 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
          >
            <div className="mb-5 flex items-center gap-2 text-lg font-black">
              {form.id ? (
                <Edit3 className="h-5 w-5 text-red-300" />
              ) : (
                <Plus className="h-5 w-5 text-red-300" />
              )}
              {form.id ? "Editar encuesta" : "Nueva encuesta"}
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Pregunta español
              </span>
              <input
                value={form.question_es}
                onChange={(event) => updateForm("question_es", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Pregunta inglés
              </span>
              <input
                value={form.question_en}
                onChange={(event) => updateForm("question_en", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
              />
            </label>

            <div className="mb-5 space-y-3">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Respuestas, español e inglés
              </div>

              {form.options.map((option, index) => (
                <div key={option.id} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={option.label_es}
                    onChange={(event) => updateOption(index, "label_es", event.target.value)}
                    placeholder={`Respuesta ${index + 1} ES`}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
                  />
                  <input
                    value={option.label_en}
                    onChange={(event) => updateOption(index, "label_en", event.target.value)}
                    placeholder={`Answer ${index + 1} EN`}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
                  />
                </div>
              ))}
            </div>

            <label className="mb-5 flex items-center justify-between rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-3">
              <span className="text-sm font-bold text-white/75">
                Activa en la página
              </span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => updateForm("is_active", event.target.checked)}
                className="h-5 w-5 accent-red-600"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar encuesta"}
              </button>

              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(createEmptySurveyForm())}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/70 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
                >
                  Nueva
                </button>
              )}
            </div>
          </motion.form>

          <section className="space-y-4">
            {isLoading ? (
              [1, 2].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
              ))
            ) : surveys.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/55">
                Aún no hay encuestas. Crea la primera para comenzar.
              </div>
            ) : (
              surveys.map((survey) => {
                const results = getResults(survey, responses);
                const total = responses.filter((response) => response.survey_id === survey.id).length;

                return (
                  <motion.article
                    key={survey.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                              survey.is_active
                                ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                : "border border-white/10 bg-white/5 text-white/40"
                            }`}
                          >
                            {survey.is_active ? "Activa" : "Inactiva"}
                          </span>
                          <span className="text-xs font-bold text-white/35">
                            {total} respuestas
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-white">{survey.question_es}</h2>
                        <p className="mt-1 text-sm font-semibold text-white/45">{survey.question_en}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(surveyToForm(survey))}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/70 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(survey)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {results.map((result) => (
                        <div key={result.option.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                            <span>{result.option.label_es}</span>
                            <span className="text-red-100">{result.percent}% · {result.count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-red-600 shadow-lg shadow-red-600/30"
                              style={{ width: `${result.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                );
              })
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
