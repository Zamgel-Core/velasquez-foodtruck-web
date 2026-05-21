// 📍 Ruta: src/features/admin/kaizen/KaizenAIPage.tsx

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Gift,
  Lightbulb,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import AdminTopbar from "../components/AdminTopbar";
import { KAIZEN_QUICK_PROMPT_GROUPS } from "./kaizen.knowledge";
import { getKaizenDashboardData, getKaizenLocalAnswer } from "./kaizen.service";
import type {
  KaizenDashboardData,
  KaizenInsight,
  KaizenInsightCategory,
  KaizenInsightPriority,
  KaizenRange,
} from "./kaizen.types";

const KAIZEN_LOGO_SRC = "/branding/kaizen/kaizen-logo.png";

const rangeOptions: { value: KaizenRange; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "all", label: "Todo" },
];

const categoryConfig: Record<
  KaizenInsightCategory,
  { label: string; icon: React.ElementType; className: string }
> = {
  sales: {
    label: "Ventas",
    icon: TrendingUp,
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  inventory: {
    label: "Inventario",
    icon: Package,
    className: "border-orange-400/25 bg-orange-500/10 text-orange-200",
  },
  waste: {
    label: "Merma",
    icon: AlertTriangle,
    className: "border-red-400/25 bg-red-500/10 text-red-200",
  },
  loyalty: {
    label: "Lealtad",
    icon: Gift,
    className: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200",
  },
  operations: {
    label: "Operación",
    icon: ClipboardList,
    className: "border-sky-400/25 bg-sky-500/10 text-sky-200",
  },
  marketing: {
    label: "Marketing",
    icon: Sparkles,
    className: "border-yellow-400/25 bg-yellow-500/10 text-yellow-200",
  },
};

const priorityConfig: Record<
  KaizenInsightPriority,
  { label: string; className: string }
> = {
  high: {
    label: "Alta prioridad",
    className: "border-red-400/30 bg-red-500/10 text-red-200",
  },
  medium: {
    label: "Recomendado",
    className: "border-orange-400/30 bg-orange-500/10 text-orange-200",
  },
  low: {
    label: "Observación",
    className: "border-white/15 bg-white/[0.04] text-white/60",
  },
  positive: {
    label: "Oportunidad",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  },
};

type ChatMessage = {
  id: string;
  role: "kaizen" | "user";
  text: string;
};

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-white/50">{helper}</p>
    </motion.div>
  );
}

function InsightCard({
  insight,
  index,
}: {
  insight: KaizenInsight;
  index: number;
}) {
  const CategoryIcon = categoryConfig[insight.category].icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-orange-500/[0.07]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${categoryConfig[insight.category].className}`}
        >
          <CategoryIcon className="h-3.5 w-3.5" />
          {categoryConfig[insight.category].label}
        </span>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${priorityConfig[insight.priority].className}`}
        >
          {priorityConfig[insight.priority].label}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-black text-white">{insight.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/62">
        {insight.message}
      </p>

      {insight.actionLabel ? (
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-orange-200">
          {insight.actionLabel}
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      ) : null}
    </motion.article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/45">
      {message}
    </div>
  );
}

export default function KaizenAIPage() {
  const [range, setRange] = React.useState<KaizenRange>("today");
  const [data, setData] = React.useState<KaizenDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chat, setChat] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "kaizen",
      text: "Soy Kaizen IA V1. Puedo darte consejos de ventas, inventario, merma, lealtad y operación usando reglas locales y datos actuales del sistema.",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getKaizenDashboardData(range);
      setData(response);
    } catch (loadError) {
      console.error(loadError);
      setError(
        "No se pudo cargar Kaizen IA. Revisa conexión con Supabase o tablas del sistema.",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chat]);

  function getAntiRepeatAnswer(answer: string) {
    const recentKaizenAnswers = chat
      .filter((message) => message.role === "kaizen")
      .slice(-4)
      .map((message) => message.text.trim());

    if (!recentKaizenAnswers.includes(answer.trim())) {
      return answer;
    }

    const extraAngles = [
      "Enfoque extra: revisa si este tema se repite durante varios turnos; si se repite, conviértelo en checklist fijo del cierre o apertura.",
      "Enfoque extra: anota este punto en el historial operativo para comparar si mejora después de aplicar el ajuste.",
      "Enfoque extra: si el patrón continúa, revisa si el problema viene de inventario, capacitación del staff o falta de preparación antes de hora pico.",
      "Enfoque extra: convierte esta recomendación en una acción concreta para hoy y vuelve a revisar el resultado al cierre del turno.",
    ];

    const extra = extraAngles[chat.length % extraAngles.length];
    return `${answer}\n\n${extra}`;
  }

  function askKaizen(rawQuestion: string) {
    const cleanQuestion = rawQuestion.trim();

    if (!cleanQuestion) return;

    const timestamp = Date.now();
    const answer = getAntiRepeatAnswer(
      getKaizenLocalAnswer(cleanQuestion, data),
    );
    setChat((current) => [
      ...current,
      {
        id: `user-${timestamp}`,
        role: "user",
        text: cleanQuestion,
      },
      {
        id: `kaizen-${timestamp}`,
        role: "kaizen",
        text: answer,
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <AdminTopbar />

      <section className="mx-auto w-full max-w-[1800px] px-4 pb-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-white/[0.035] to-black p-6 shadow-2xl shadow-orange-950/30 sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-100">
                <img
                  src={KAIZEN_LOGO_SRC}
                  alt="Kaizen AI"
                  className="h-5 w-5 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.75)]"
                />
                Kaizen AI Insights · V1 Local
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Asistente operativo para tomar mejores decisiones.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/62 sm:text-base">
                Esta versión funciona sin API pagada y sin recetas: analiza
                ventas, inventario, merma y lealtad para generar alertas, tips y
                recomendaciones prácticas.
              </p>

              {data ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-xs text-white/45">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Actualizado: {formatDateTime(data.generatedAt)}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {rangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
                    range === option.value
                      ? "border-orange-400 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => void loadData()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/70 transition hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-100"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <div className="mt-10 flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-white/55">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-300" />
            Kaizen está leyendo datos del negocio...
          </div>
        ) : null}

        {data ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-orange-200">
                      <Brain className="h-3.5 w-3.5" />
                      Insights inteligentes
                    </div>
                    <h2 className="mt-3 text-2xl font-black">
                      Prioridades sugeridas
                    </h2>
                  </div>
                  <Zap className="h-8 w-8 text-orange-300" />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {data.insights.length > 0 ? (
                    data.insights.map((insight, index) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        index={index}
                      />
                    ))
                  ) : (
                    <EmptyState message="Sin insights por ahora. Conforme entren ventas, inventario y merma, Kaizen será más específico." />
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-white/[0.025] p-5 shadow-2xl shadow-black/30 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/15 shadow-lg shadow-orange-500/20">
                      <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl" />
                      <img
                        src={KAIZEN_LOGO_SRC}
                        alt="Kaizen AI"
                        className="relative h-11 w-11 object-contain drop-shadow-[0_0_16px_rgba(249,115,22,0.75)]"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                        Asistente guiado local
                      </p>
                      <h2 className="text-xl font-black">
                        Kaizen listo para ayudarte
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-white/45">
                        Selecciona una pregunta sugerida para recibir
                        recomendaciones operativas.
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                    {chat.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-3xl border p-4 text-sm leading-relaxed ${
                          message.role === "kaizen"
                            ? "border-orange-500/20 bg-orange-500/10 text-orange-50"
                            : "border-white/10 bg-white/[0.05] text-white/75"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
                          {message.role === "kaizen" ? (
                            <img
                              src={KAIZEN_LOGO_SRC}
                              alt="Kaizen"
                              className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]"
                            />
                          ) : (
                            <Truck className="h-3.5 w-3.5" />
                          )}
                          {message.role === "kaizen" ? "Kaizen" : "Usuario"}
                        </div>
                        <div className="whitespace-pre-line">
                          {message.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="mt-4 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-50/80">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" />
                      <p>
                        Kaizen V1 funciona con preguntas controladas para dar
                        respuestas más confiables y evitar errores de un chat
                        libre. Cuando conectemos una API de IA en el futuro, se
                        puede activar escritura manual.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                        Preguntas sugeridas
                      </p>
                      <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-100">
                        Local AI
                      </span>
                    </div>

                    <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                      {KAIZEN_QUICK_PROMPT_GROUPS.map((group) => {
                        const GroupIcon = categoryConfig[group.category].icon;
                        return (
                          <div
                            key={group.title}
                            className="rounded-3xl border border-white/10 bg-black/20 p-3"
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                              <GroupIcon className="h-3.5 w-3.5 text-orange-300" />
                              {group.title}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.prompts.map((sample) => (
                                <button
                                  key={sample}
                                  type="button"
                                  onClick={() => askKaizen(sample)}
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/55 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-100"
                                >
                                  {sample}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
                    <Lightbulb className="h-4 w-4 text-yellow-300" />
                    Food truck wisdom
                  </div>

                  <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2 custom-scrollbar sm:max-h-[560px]">
                    {data.tips.map((tip) => {
                      const Icon = categoryConfig[tip.category].icon;
                      return (
                        <div
                          key={tip.id}
                          className="rounded-3xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-orange-300" />
                            <h3 className="font-black text-white">
                              {tip.title}
                            </h3>
                          </div>
                          <p className="text-sm leading-relaxed text-white/55">
                            {tip.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
                  <BarChart3 className="h-4 w-4 text-emerald-300" />
                  Productos líderes
                </div>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div
                        key={product.productName}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
                      >
                        <div>
                          <p className="font-black text-white">
                            #{index + 1} {product.productName}
                          </p>
                          <p className="text-xs text-white/45">
                            {product.quantity} unidades
                          </p>
                        </div>
                        <p className="text-sm font-black text-emerald-200">
                          ${product.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Todavía no hay productos líderes en este rango." />
                )}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
                  <Package className="h-4 w-4 text-orange-300" />
                  Alertas de inventario
                </div>
                {data.inventoryAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {data.inventoryAlerts.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-black text-white">{item.name}</p>
                          <span className="rounded-full border border-orange-400/30 bg-orange-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
                            {item.status === "out"
                              ? "Agotado"
                              : item.status === "critical"
                                ? "Crítico"
                                : "Bajo"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/50">
                          Actual: {item.currentStock} {item.unit} · Mínimo:{" "}
                          {item.minStock} {item.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                    <CheckCircle2 className="mb-3 h-6 w-6" />
                    Sin alertas críticas de inventario por ahora.
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  Resumen de merma
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Pérdida estimada
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    ${data.wasteSummary.totalEstimatedLoss.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    {data.wasteSummary.totalEvents} registro(s) en este rango
                  </p>
                </div>

                <div className="mt-3 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Motivo principal
                  </p>
                  <p className="mt-2 text-lg font-black text-orange-100">
                    {data.wasteSummary.topReason}
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    Uso operativo: {data.wasteSummary.operationalUseEvents}{" "}
                    registro(s)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/35">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Contexto que Kaizen está usando
              </div>
              <p className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-white/55">
                {data.assistantContext}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/35">
                Nota: esta V1 no usa recetas ni API pagada. Es un asistente
                local con reglas inteligentes. Cuando se agreguen recetas,
                costos e historial más grande, Kaizen podrá evolucionar a
                predicción de compras, costo por platillo y recomendaciones más
                precisas.
              </p>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
