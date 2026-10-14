// 📍 Ruta: src/components/ReviewsSection.tsx

import React from "react";
import {
  ExternalLink,
  MessageCircleHeart,
  Quote,
  Sparkles,
  Star,
  Utensils,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Lang } from "../types";
import { OrderingButtons } from "./OrderingButtons";

type Review = {
  name: string;
  // Approximate publication date inferred from Google Maps screenshots taken 2026-10-14.
  publishedAt: string;
  textEs: string;
  textEn: string;
  highlightEs: string;
  highlightEn: string;
  ratings: { food?: number; service?: number; atmosphere?: number };
};

const reviews: Review[] = [
  {
    name: "Carmen Reed",
    publishedAt: "2026-09-21",
    textEs: "Este es Matthew, la comida es estupenda y tiene mucha energía.",
    textEn: "This is Matthew, the food is great and he has lots of energy.",
    highlightEs: "Comida estupenda",
    highlightEn: "Great food",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Jay Moore",
    publishedAt: "2026-09-14",
    textEs: "¡He ido 3 veces en total en las últimas dos semanas! ¡Esos tacos son así de buenos! ¡Siempre pido los tacos de fajita de res con cilantro y cebolla asada! ¡Las bebidas están todas buenísimas! ¡Definitivamente ya sabe quién soy! 😂",
    textEn: "I’ve been there 3 times in the last two weeks! The tacos are that good! I always get beef fajita tacos with cilantro and grilled onion. All the drinks are amazing! They definitely know who I am by now!",
    highlightEs: "Tacos de fajita",
    highlightEn: "Fajita tacos",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Angie Diaz",
    publishedAt: "2026-09-14",
    textEs: "¡Sabor increíble y buenos precios! Pedí los sopes y estaban deliciosos, ¡todo estaba bien cocinado! El agua fresca de pepino y limón estaba muy rica, no tenía demasiado limón y el sabor a pepino no era empalagoso. ¡El servicio fue excelente! El food truck tenía un ambiente acogedor, sin duda volveré.",
    textEn: "Amazing flavor and great prices! I ordered the sopes and they were delicious and perfectly cooked. The cucumber-lime agua fresca was refreshing and well balanced. Excellent service and a welcoming atmosphere. I’ll definitely return!",
    highlightEs: "Sopes y bebidas",
    highlightEn: "Sopes and drinks",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Josh Hinojosa",
    publishedAt: "2026-08-14",
    textEs: "¡Un lugar estupendo para disfrutar de comida preparada pensando en ti! ¡Excelente servicio! ¡No te pierdas esta joya! 💎 ¡Comida perfecta para los niños!",
    textEn: "A wonderful place to enjoy food prepared with care! Excellent service! Don’t miss this gem! Great food for kids!",
    highlightEs: "Excelente servicio",
    highlightEn: "Excellent service",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Zack Biegler",
    publishedAt: "2026-08-14",
    textEs: "La comida es excelente, la recomiendo ampliamente.",
    textEn: "The food is excellent. I highly recommend it.",
    highlightEs: "Comida excelente",
    highlightEn: "Excellent food",
    ratings: {food: 5, service: 5 },
  },
  {
    name: "Juan Moreno",
    publishedAt: "2026-09-14",
    textEs: "Me encantó la comida y las bebidas.",
    textEn: "I loved the food and drinks.",
    highlightEs: "Comida y bebidas",
    highlightEn: "Food and drinks",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Cleiri Diaz",
    publishedAt: "2026-08-14",
    textEs: "¡El mejor camión de tacos!",
    textEn: "The best taco truck!",
    highlightEs: "Tacos",
    highlightEn: "Tacos",
    ratings: { },
  },
  {
    name: "Franuale Caesar “Candy”",
    publishedAt: "2026-07-15",
    textEs: "Nuevo local de tacos, excelente servicio al cliente y la comida se ve genial, ojalá podamos convertirlo en nuestro nuevo lugar favorito.",
    textEn: "New taco spot, excellent customer service, and the food looks great. Hopefully this becomes our new favorite place.",
    highlightEs: "Servicio al cliente",
    highlightEn: "Customer service",
    ratings: { },
  },
  {
    name: "Pedro Chacon",
    publishedAt: "2026-06-14",
    textEs: "Comida deliciosa a muy buenos precios. Además, el personal es muy amable. Los tacos están riquísimos.",
    textEn: "Delicious food at great prices. The staff is very friendly, and the tacos are amazing.",
    highlightEs: "Calidad-precio",
    highlightEn: "Great value",
    ratings: {food: 5, service: 5, atmosphere: 4 },
  },
  {
    name: "Kaylee W",
    publishedAt: "2026-06-14",
    textEs: "Vine a almorzar y pedí una gordita de pollo, ¡estaba deliciosa! El personal fue muy amable y atento. ¡Volveré!",
    textEn: "I came for lunch and ordered a chicken gordita. It was delicious! The staff was very kind and attentive. I’ll be back!",
    highlightEs: "Gordita de pollo",
    highlightEn: "Chicken gordita",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Javier Ramon Feria Molina",
    publishedAt: "2026-06-14",
    textEs: "Calificó con cinco estrellas la comida, el servicio y el ambiente.",
    textEn: "Rated the food, service, and atmosphere five stars.",
    highlightEs: "5 estrellas",
    highlightEn: "5 stars",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Angel Zamora",
    publishedAt: "2026-05-15",
    textEs: "Primera vez que pruebo una buena torta en el Southwest, buena combinación de fajita y pastor. Recomendada 🙌 P.d. Se ve muy limpio el lugar.",
    textEn: "First time trying a great torta in Southwest Houston. Good combination of fajita and pastor. Recommended! The place looks very clean.",
    highlightEs: "Torta mexicana",
    highlightEn: "Mexican torta",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Vilma Selena",
    publishedAt: "2026-05-15",
    textEs: "Pasé un día y me encantó la atención y también que la comida salió súper rápido. Probé quesadillas y también tacos, todo se veía bien y delicioso, súper recomendado 100%.",
    textEn: "I stopped by and loved the service, and the food came out super fast. I tried quesadillas and tacos; everything looked and tasted delicious. Highly recommended!",
    highlightEs: "Servicio rápido",
    highlightEn: "Fast service",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Cristian Torres",
    publishedAt: "2026-05-15",
    textEs: "Pasé en mi hora de comida y esos tacos especiales de pastor están muy llenadores. No olviden su coca mexicana.",
    textEn: "I stopped by on my lunch break and those special pastor tacos are very filling. Don’t forget your Mexican Coke.",
    highlightEs: "Special tacos",
    highlightEn: "Special tacos",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Joel Chavez",
    publishedAt: "2026-03-15",
    textEs: "Personal muy amable, comida rica, lo recomiendo al 100%.",
    textEn: "Very friendly staff and delicious food. I recommend it 100%.",
    highlightEs: "Atención amable",
    highlightEn: "Friendly service",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
  {
    name: "Mardoqueo Par",
    publishedAt: "2026-03-15",
    textEs: "Fui allí un sábado por la noche, pedí una quesadilla de fajita que estaba muy buena.",
    textEn: "I went there on a Saturday night and ordered a fajita quesadilla. It was very good.",
    highlightEs: "Quesadilla de fajita",
    highlightEn: "Fajita quesadilla",
    ratings: {food: 5, service: 5, atmosphere: 5 },
  },
];

function relativeReviewDate(iso: string, isEs: boolean): string {
  const date = new Date(`${iso}T12:00:00`);
  const now = new Date();
  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", Math.floor(days / 365)],
    ["month", Math.floor(days / 30.44)],
    ["week", Math.floor(days / 7)],
    ["day", days],
  ];
  const selected = units.find(([unit, count]) => count >= 1 && (unit !== "day" || days >= 1));
  if (!selected) return isEs ? "Hoy" : "Today";
  return new Intl.RelativeTimeFormat(isEs ? "es" : "en", { numeric: "auto" }).format(-selected[1], selected[0]);
}

function Stars({ large = false }: { large?: boolean }) {
  return (
    <div className="flex items-center gap-1 text-red-400">
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
  const [showAll, setShowAll] = React.useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 py-24">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
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
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-600/10"
            >
              {isEs ? "Ver en Google" : "View on Google"}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleReviews.map((review, index) => (
            <ReviewCard key={review.name} review={review} isEs={isEs} featured={index < 3} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setShowAll((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20" aria-expanded={showAll}>
            {showAll ? (isEs ? "Mostrar menos" : "Show fewer") : (isEs ? `Ver las ${reviews.length} reseñas` : `See all ${reviews.length} reviews`)}
            {showAll ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-950/45 via-zinc-950 to-black p-6 text-center shadow-2xl shadow-red-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/25">
            <Utensils className="h-7 w-7" />
          </div>

          <h3 className="text-2xl font-black text-white">
            {isEs ? "¿Ya probaste nuestro menú?" : "Have you tried our menu?"}
          </h3>

          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-white/55">
            {isEs
              ? "Ordena para recoger mediante Clover o pide a domicilio con DoorDash y Uber Eats."
              : "Order for pickup through Clover or choose DoorDash or Uber Eats for delivery."}
          </p>

          <OrderingButtons lang={lang} className="mt-6" />
          <a href="https://www.google.com/search?q=Velasquez+Food+Truck+Houston+reviews" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-200 hover:text-red-100">
            {isEs ? "Dejar reseña en Google" : "Leave a Google review"} <ExternalLink size={15} />
          </a>
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
      className={`group relative flex h-full min-h-[285px] flex-col overflow-hidden rounded-[1.75rem] border p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-red-500/45 hover:shadow-2xl hover:shadow-red-950/25 ${
        featured
          ? "border-red-500/20 bg-gradient-to-br from-red-950/25 via-white/[0.04] to-white/[0.03]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="absolute right-5 top-5 text-red-500/10 transition group-hover:scale-110 group-hover:text-red-500/20">
        <Quote className="h-16 w-16" fill="currentColor" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-lg font-black text-white shadow-lg shadow-red-600/20">
              {review.name.charAt(0)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-black text-white">{review.name}</h3>
              <p className="text-xs font-bold text-white/40">
                {relativeReviewDate(review.publishedAt, isEs)}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-black text-red-200">
            {isEs ? review.highlightEs : review.highlightEn}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Stars />

          {featured && (
            <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-black text-red-200">
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
              className="mt-3 text-sm font-black text-red-300 transition hover:text-red-200"
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

        {Object.keys(review.ratings).length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
            {(["food", "service", "atmosphere"] as const).map((key) => {
              const rating = review.ratings[key];
              if (rating === undefined) return null;
              const labels = { food: isEs ? "Comida" : "Food", service: isEs ? "Servicio" : "Service", atmosphere: isEs ? "Ambiente" : "Atmosphere" };
              return <div key={key} className="rounded-2xl bg-black/25 px-2 py-2"><p className="text-[10px] font-black uppercase text-white/35">{labels[key]}</p><p className="mt-1 font-black text-red-300">{rating}</p></div>;
            })}
          </div>
        )}
      </div>
    </article>
  );
}
