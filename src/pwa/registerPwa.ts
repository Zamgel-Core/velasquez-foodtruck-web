// 📍 Ruta: src/pwa/registerPwa.ts

const APP_THEME_COLOR = "#dc2626";
const APP_BACKGROUND_COLOR = "#050505";

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let meta = document.head.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, options?: Record<string, string>) {
  const selector = `link[rel="${rel}"]${options?.sizes ? `[sizes="${options.sizes}"]` : ""}`;
  let link = document.head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);

  Object.entries(options ?? {}).forEach(([key, value]) => {
    link?.setAttribute(key, value);
  });
}

export function registerPwa() {
  if (typeof window === "undefined") return;

  upsertLink("manifest", "/manifest.webmanifest");
  upsertLink("apple-touch-icon", "/images/velasquez-logo.png");

  upsertMeta("theme-color", APP_THEME_COLOR);
  upsertMeta("msapplication-TileColor", APP_BACKGROUND_COLOR);
  upsertMeta("application-name", "Velasquez Food Truck");
  upsertMeta("apple-mobile-web-app-capable", "yes");
  upsertMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  upsertMeta("apple-mobile-web-app-title", "Velasquez");

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.warn("PWA service worker registration failed:", error);
      });
  });
}
