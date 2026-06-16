import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';


const ensurePwaHeadTags = () => {
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (!existingManifest) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.appendChild(manifest);
  }

  const existingTheme = document.querySelector('meta[name="theme-color"]');
  if (!existingTheme) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#dc2626";
    document.head.appendChild(theme);
  }
};

ensurePwaHeadTags();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => console.warn("Service Worker registration failed:", error));
  });
}
