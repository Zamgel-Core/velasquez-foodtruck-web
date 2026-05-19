// 📍 Ruta: src/components/TikTokSection.tsx

import React from "react";
import { motion } from "motion/react";
import { ExternalLink, Play } from "lucide-react";
import {
  getActiveSocialVideos,
  type SocialVideo,
} from "../services/social-videos.service";
import type { Lang } from "../types";

type TikTokSectionProps = {
  lang: Lang;
};

declare global {
  interface Window {
    tiktokEmbed?: {
      load?: () => void;
    };
  }
}

function loadTikTokEmbedScript() {
  const existingScript = document.querySelector(
    'script[src="https://www.tiktok.com/embed.js"]',
  );

  if (existingScript) {
    window.tiktokEmbed?.load?.();
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.tiktok.com/embed.js";
  script.async = true;
  document.body.appendChild(script);
}

export function TikTokSection({ lang }: TikTokSectionProps) {
  const [videos, setVideos] = React.useState<SocialVideo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      setIsLoading(true);

      const data = await getActiveSocialVideos();

      if (!isMounted) return;

      setVideos(data);
      setIsLoading(false);
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (videos.length > 0) {
      setTimeout(() => {
        loadTikTokEmbedScript();
      }, 250);
    }
  }, [videos]);

  if (!isLoading && videos.length === 0) {
    return null;
  }

  return (
    <section
      id="tiktok"
      className="relative border-t border-white/10 bg-[#050505] px-4 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-orange-200">
              <Play className="h-4 w-4" />
              TikTok
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
              {lang === "es" ? "Síguenos en TikTok" : "Follow us on TikTok"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              {lang === "es"
                ? "Mira lo más nuevo de Velasquez Food Truck: tacos, antojitos y momentos reales del food truck."
                : "Watch the latest from Velasquez Food Truck: tacos, specials, and real food truck moments."}
            </p>
          </div>

          <a
            href="https://www.tiktok.com/@velasquezfoodtruck"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-100 transition hover:bg-orange-500 hover:text-white"
          >
            {lang === "es" ? "Ver en TikTok" : "View on TikTok"}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[520px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              videos.length === 1
                ? "mx-auto max-w-sm grid-cols-1"
                : videos.length === 2
                  ? "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {videos.map((video, index) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-3 shadow-2xl shadow-black/50 transition hover:border-orange-500/45 hover:shadow-orange-500/10"
              >
                <div className="mb-3 px-2 pt-2">
                  <h3 className="line-clamp-2 text-base font-black text-white">
                    {video.title}
                  </h3>
                </div>

                <div className="overflow-hidden rounded-2xl bg-black [&_iframe]:!h-[560px] [&_iframe]:!max-h-[560px] [&_iframe]:!min-h-[560px]">
                  <blockquote
                    className="tiktok-embed"
                    cite={video.video_url}
                    data-video-id={
                      video.video_url.split("/video/")[1]?.split("?")[0] ?? ""
                    }
                    data-embed-from="oembed"
                    style={{
                      maxWidth: "100%",
                      minWidth: "100%",
                    }}
                  >
                    <section>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-orange-300"
                      >
                        {video.title}
                      </a>
                    </section>
                  </blockquote>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
