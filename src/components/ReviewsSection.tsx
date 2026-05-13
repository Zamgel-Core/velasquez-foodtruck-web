import { Star } from "lucide-react";
import type { Lang } from "../types";

export function ReviewsSection({ lang, title }: { lang: Lang; title: string }) {
  const reviews = [
    lang === "es"
      ? "Personal muy amable, comida rica lo recomiendo al 100%"
      : "Very friendly staff, delicious food I recommend it 100%",
    lang === "es"
      ? "Pedí una quesadilla de fajita, estaba muy buena"
      : "I ordered a fajita quesadilla, it was very good",
  ];

  return (
    <section className="bg-zinc-950 px-4 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-black sm:text-5xl">{title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left">
              <div className="mb-4 flex text-orange-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-white/80">“{review}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
