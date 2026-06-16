// 📍 Ruta: src/services/surveys.service.ts

import { supabase } from "../lib/supabase";

export type SurveyOption = {
  id: string;
  label_es: string;
  label_en: string;
};

export type PublicSurvey = {
  id: string;
  question_es: string;
  question_en: string;
  options: SurveyOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export async function getActiveSurvey(): Promise<PublicSurvey | null> {
  const { data, error } = await supabase
    .from("surveys")
    .select("id, question_es, question_en, options, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading active survey:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    options: Array.isArray(data.options) ? (data.options as SurveyOption[]) : [],
  } as PublicSurvey;
}

export async function submitSurveyResponse(params: {
  surveyId: string;
  option: SurveyOption;
}) {
  const { error } = await supabase.from("survey_responses").insert({
    survey_id: params.surveyId,
    selected_option_id: params.option.id,
    selected_label_es: params.option.label_es,
    selected_label_en: params.option.label_en,
  });

  if (error) {
    console.error("Error submitting survey response:", error);
    throw new Error("No se pudo enviar la respuesta.");
  }
}
