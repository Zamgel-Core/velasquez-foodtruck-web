// 📍 Ruta: src/components/SurveySection.tsx

import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ClipboardList, Send } from "lucide-react";
import type { Lang } from "../types";
import {
  getActiveSurvey,
  submitSurveyResponse,
  type PublicSurvey,
  type SurveyOption,
} from "../services/surveys.service";

type SurveySectionProps = {
  lang: Lang;
};

const votedKey = (surveyId: string) => `vft_survey_voted_${surveyId}`;

export function SurveySection({ lang }: SurveySectionProps) {
  const [survey, setSurvey] = React.useState<PublicSurvey | null>(null);
  const [selectedOptionId, setSelectedOptionId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    async function loadSurvey() {
      setIsLoading(true);
      const data = await getActiveSurvey();

      if (!isMounted) return;

      setSurvey(data);
      setHasVoted(data ? localStorage.getItem(votedKey(data.id)) === "true" : false);
      setIsLoading(false);
    }

    loadSurvey();

    return () => {
      isMounted = false;
    };
  }, []);

  const labels = {
    tag: lang === "es" ? "Encuesta rápida" : "Quick Survey",
    title: lang === "es" ? "Ayúdanos a mejorar" : "Help us improve",
    subtitle:
      lang === "es"
        ? "Tu respuesta nos ayuda a seguir mejorando el servicio y el menú de Velasquez Food Truck."
        : "Your answer helps us keep improving Velasquez Food Truck service and menu.",
    submit: lang === "es" ? "Enviar respuesta" : "Submit answer",
    submitting: lang === "es" ? "Enviando..." : "Submitting...",
    thanks: lang === "es" ? "Gracias por participar" : "Thank you for participating",
    thanksText:
      lang === "es"
        ? "Tu opinión quedó registrada. Apreciamos mucho tu apoyo."
        : "Your feedback has been recorded. We truly appreciate your support.",
    selectOption:
      lang === "es" ? "Selecciona una respuesta." : "Please select an answer.",
  };

  if (!isLoading && !survey) return null;

  const selectedOption = survey?.options.find(
    (option) => option.id === selectedOptionId,
  );

  const handleSubmit = async () => {
    if (!survey) return;

    if (!selectedOption) {
      setMessage(labels.selectOption);
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      await submitSurveyResponse({ surveyId: survey.id, option: selectedOption });
      localStorage.setItem(votedKey(survey.id), "true");
      setHasVoted(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : lang === "es"
            ? "No se pudo enviar la respuesta."
            : "Could not submit the answer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="survey"
      className="relative overflow-hidden border-t border-red-500/10 bg-[#050505] px-4 py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.14),transparent_36%),radial-gradient(circle_at_15%_80%,rgba(127,29,29,0.18),transparent_34%)]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-red-500/20 bg-black/70 p-5 shadow-2xl shadow-red-950/20 backdrop-blur sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/35 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-red-200">
                <ClipboardList className="h-4 w-4" />
                {labels.tag}
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
                {labels.title}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                {labels.subtitle}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/10" />
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-12 animate-pulse rounded-2xl bg-white/10"
                    />
                  ))}
                </div>
              ) : hasVoted ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{labels.thanks}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
                    {labels.thanksText}
                  </p>
                </div>
              ) : survey ? (
                <div>
                  <h3 className="mb-4 text-xl font-black leading-tight text-white sm:text-2xl">
                    {lang === "es" ? survey.question_es : survey.question_en}
                  </h3>

                  <div className="space-y-3">
                    {survey.options.map((option) => {
                      const active = selectedOptionId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedOptionId(option.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-black transition duration-200 hover:-translate-y-0.5 ${
                            active
                              ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/25"
                              : "border-white/10 bg-black/40 text-white/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-100"
                          }`}
                        >
                          {lang === "es" ? option.label_es : option.label_en}
                        </button>
                      );
                    })}
                  </div>

                  {message && (
                    <p className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
                      {message}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? labels.submitting : labels.submit}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
