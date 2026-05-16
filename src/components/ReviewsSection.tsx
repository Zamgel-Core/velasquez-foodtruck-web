// 📍 Ruta: src/App.tsx

import React from "react";
import {
  ExternalLink,
  MessageCircleHeart,
  Quote,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import type { Lang } from "../types";

type Review = {
  name: string;
  whenEs: string;
  whenEn: string;
  textEs: string;
  textEn: string;
  highlightEs: string;
  highlightEn: string;
};

const reviews: Review[] = [
  {
    name: "Angel Zamora",
    whenEs: "Hace una semana",
    whenEn: "A week ago",
    textEs:
      "Primera vez que prueba una buena torta en el Southwest, buena combinación de fajita y pastor. Recomendado. P.d. Se ve muy limpio el lugar.",
    textEn:
      "First time trying a great torta in Southwest Houston. Good combination of fajita and pastor. Recommended. The place looks very clean.",
    highlightEs: "Torta mexicana",
    highlightEn: "Mexican torta",
  },
  {
    name: "Mardoqueo Par",
    whenEs: "Hace 2 meses",
    whenEn: "2 months ago",
    textEs:
      "Fui un sábado por la noche y ordené una quesadilla de fajita. Estaba muy buena.",
    textEn:
      "Went there on a Saturday night, ordered a fajita quesadilla. It was so good.",
    highlightEs: "Quesadilla de fajita",
    highlightEn: "Fajita quesadilla",
  },
  {
    name: "Vilma Selena",
    whenEs: "Hace una semana",
    whenEn: "A week ago",
    textEs:
      "Pasé un día y me encantó la atención. También que la comida salió súper rápido. Probé quesadillas y tacos; todo se veía bien y delicioso. Súper recomendado 100%.",
    textEn:
      "I stopped by and loved the service. The food came out super fast too. I tried quesadillas and tacos; everything looked good and delicious. Highly recommended.",
    highlightEs: "Servicio rápido",
    highlightEn: "Fast service",
  },
  {
    name: "Cristian Torres",
    whenEs: "Hace una semana",
    whenEn: "A week ago",
    textEs:
      "Pasé en mi hora de comida y esos tacos especiales de pastor están muy llenadores. No olviden su Coca mexicana.",
    textEn:
      "I stopped by during lunch and those special pastor tacos are very filling. Don’t forget your Mexican Coke.",
    highlightEs: "Special tacos",
    highlightEn: "Special tacos",
  },
  {
    name: "Joel Chavez",
    whenEs: "Hace 2 meses",
    whenEn: "2 months ago",
    textEs: "Personal muy amable, comida rica. Lo recomiendo al 100%.",
    textEn: "Very friendly staff, delicious food. I recommend it 100%.",
    highlightEs: "Atención amable",
    highlightEn: "Friendly service",
  },
];

function Stars({ large = false }: { large?: boolean }) {
  return (
    <div className="flex items-center gap-1 text-orange-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={large ? 20 : 17}
          fill="currentColor"
          className="drop-shadow-[0_0_8px_rgba(251,146,60,0.28)]"
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ lang, title }: { lang: Lang; title: string }) {
  const isEs = lang === "es";

  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 py-24">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            <MessageCircleHeart className="h-4 w-4" />
            {isEs ? "Reseñas reales de Google" : "Real Google Reviews"}
          </div>

          <h2 className="text-4xl font-black leading-tight text-white sm:text-6xl">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold text-white/55 sm:text-lg">
            {isEs
              ? "Clientes reales recomiendan el sabor, la atención y la rapidez de Velasquez Food Truck."
              : "Real customers recommend the flavor, service, and speed at Velasquez Food Truck."}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 shadow-xl shadow-black/20">
              <Stars large />
              <span className="text-lg font-black text-white">5.0</span>
              <span className="text-sm font-bold text-white/45">Google</span>
            </div>

            <a
              href="https://www.google.com/search?q=Velasquez+Food+Truck+Houston+reviews"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-500/20 hover:shadow-lg hover:shadow-orange-600/10"
            >
              {isEs ? "Ver en Google" : "View on Google"}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 hidden gap-5 lg:grid lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard
              key={review.name}
              review={review}
              isEs={isEs}
              featured
            />
          ))}
        </div>

        <div className="mt-5 hidden gap-5 md:grid md:grid-cols-2 lg:grid">
          {reviews.slice(3).map((review) => (
            <ReviewCard key={review.name} review={review} isEs={isEs} />
          ))}
        </div>

        <div className="-mx-4 mt-12 flex snap-x gap-4 overflow-x-auto px-4 pb-5 md:hidden">
          {reviews.map((review, index) => (
            <div key={review.name} className="min-w-[86%] snap-center">
              <ReviewCard review={review} isEs={isEs} featured={index < 3} />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-950/45 via-zinc-950 to-black p-6 text-center shadow-2xl shadow-orange-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25">
            <Utensils className="h-7 w-7" />
          </div>

          <h3 className="text-2xl font-black text-white">
            {isEs ? "¿Ya probaste nuestro menú?" : "Have you tried our menu?"}
          </h3>

          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-white/55">
            {isEs
              ? "Ordena desde la página o visítanos en Houston para probar tacos, tortas, quesadillas, burritos y más."
              : "Order from the website or visit us in Houston to try tacos, tortas, quesadillas, burritos, and more."}
          </p>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() =>
                document.getElementById("menu")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="rounded-full bg-orange-600 px-6 py-3 font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-500"
              type="button"
            >
              {isEs ? "Ver menú" : "View menu"}
            </button>

            <a
              href="https://www.google.com/search?q=Velasquez+Food+Truck+Houston+reviews"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-white/[0.10]"
            >
              {isEs ? "Dejar reseña" : "Leave a review"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  isEs,
  featured = false,
}: {
  review: Review;
  isEs: boolean;
  featured?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const text = isEs ? review.textEs : review.textEn;
  const shouldClamp = text.length > 105;

  return (
    <article
      className={`group relative flex h-full min-h-[285px] flex-col overflow-hidden rounded-[1.75rem] border p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-orange-500/45 hover:shadow-2xl hover:shadow-orange-950/25 ${
        featured
          ? "border-orange-500/20 bg-gradient-to-br from-orange-950/25 via-white/[0.04] to-white/[0.03]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="absolute right-5 top-5 text-orange-500/10 transition group-hover:scale-110 group-hover:text-orange-500/20">
        <Quote className="h-16 w-16" fill="currentColor" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-lg font-black text-white shadow-lg shadow-orange-600/20">
              {review.name.charAt(0)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-black text-white">{review.name}</h3>
              <p className="text-xs font-bold text-white/40">
                {isEs ? review.whenEs : review.whenEn}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[11px] font-black text-orange-200">
            {isEs ? review.highlightEs : review.highlightEn}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Stars />

          {featured && (
            <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-black text-orange-200">
              <Sparkles className="h-3 w-3" />
              Google
            </div>
          )}
        </div>

        <div className="mt-5 flex-1">
          <p
            className={`text-base font-semibold leading-relaxed text-white/80 ${
              !expanded && shouldClamp ? "line-clamp-3" : ""
            }`}
          >
            “{text}”
          </p>

          {shouldClamp && (
            <button
              onClick={() => setExpanded((value) => !value)}
              className="mt-3 text-sm font-black text-orange-300 transition hover:text-orange-200"
              type="button"
            >
              {expanded
                ? isEs
                  ? "Ver menos"
                  : "Show less"
                : isEs
                  ? "Ver más"
                  : "Read more"}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
          {["Comida", "Servicio", "Ambiente"].map((label) => (
            <div key={label} className="rounded-2xl bg-black/25 px-2 py-2">
              <p className="text-[10px] font-black uppercase text-white/35">
                {isEs
                  ? label
                  : label === "Comida"
                    ? "Food"
                    : label === "Servicio"
                      ? "Service"
                      : "Atmosphere"}
              </p>
              <p className="mt-1 font-black text-orange-300">5</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
