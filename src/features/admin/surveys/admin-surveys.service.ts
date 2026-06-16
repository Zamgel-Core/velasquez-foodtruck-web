// 📍 Ruta: src/features/admin/surveys/admin-surveys.service.ts

import { supabase } from "../../../lib/supabase";
import type { SurveyOption } from "../../../services/surveys.service";

export type AdminSurvey = {
  id: string;
  question_es: string;
  question_en: string;
  options: SurveyOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type SurveyResponse = {
  id: string;
  survey_id: string;
  selected_option_id: string;
  selected_label_es: string | null;
  selected_label_en: string | null;
  created_at: string;
};

export type SurveyFormData = {
  id?: string;
  question_es: string;
  question_en: string;
  options: SurveyOption[];
  is_active: boolean;
};

export function createEmptySurveyForm(): SurveyFormData {
  return {
    question_es: "¿Cómo estuvo tu experiencia?",
    question_en: "How was your experience?",
    options: [
      { id: crypto.randomUUID(), label_es: "Excelente", label_en: "Excellent" },
      { id: crypto.randomUUID(), label_es: "Buena", label_en: "Good" },
      { id: crypto.randomUUID(), label_es: "Regular", label_en: "Average" },
      { id: crypto.randomUUID(), label_es: "Mala", label_en: "Bad" },
    ],
    is_active: true,
  };
}

export function surveyToForm(survey: AdminSurvey): SurveyFormData {
  return {
    id: survey.id,
    question_es: survey.question_es,
    question_en: survey.question_en,
    options: survey.options.length > 0 ? survey.options : createEmptySurveyForm().options,
    is_active: survey.is_active,
  };
}

export async function getAdminSurveys(): Promise<AdminSurvey[]> {
  const { data, error } = await supabase
    .from("surveys")
    .select("id, question_es, question_en, options, is_active, created_at, updated_at")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading surveys:", error);
    throw new Error("No se pudieron cargar las encuestas.");
  }

  return (data ?? []).map((survey) => ({
    ...(survey as AdminSurvey),
    options: Array.isArray(survey.options) ? (survey.options as SurveyOption[]) : [],
  }));
}

export async function getSurveyResponses(): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from("survey_responses")
    .select("id, survey_id, selected_option_id, selected_label_es, selected_label_en, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading survey responses:", error);
    throw new Error("No se pudieron cargar las respuestas.");
  }

  return (data ?? []) as SurveyResponse[];
}

export async function saveAdminSurvey(form: SurveyFormData) {
  const options = form.options
    .map((option) => ({
      id: option.id || crypto.randomUUID(),
      label_es: option.label_es.trim(),
      label_en: option.label_en.trim(),
    }))
    .filter((option) => option.label_es && option.label_en)
    .slice(0, 4);

  if (!form.question_es.trim() || !form.question_en.trim()) {
    throw new Error("Agrega la pregunta en español e inglés.");
  }

  if (options.length < 2) {
    throw new Error("Agrega al menos 2 respuestas completas en español e inglés.");
  }

  if (form.is_active) {
    await supabase.from("surveys").update({ is_active: false }).neq("id", form.id ?? "");
  }

  const payload = {
    id: form.id,
    question_es: form.question_es.trim(),
    question_en: form.question_en.trim(),
    options,
    is_active: form.is_active,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("surveys").upsert(payload);

  if (error) {
    console.error("Error saving survey:", error);
    throw new Error("No se pudo guardar la encuesta.");
  }
}

export async function deleteAdminSurvey(id: string) {
  const { error } = await supabase.from("surveys").delete().eq("id", id);

  if (error) {
    console.error("Error deleting survey:", error);
    throw new Error("No se pudo eliminar la encuesta.");
  }
}
