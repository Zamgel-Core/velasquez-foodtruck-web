// 📍 Ruta: src/features/admin/orders/useOrderAlerts.ts

import React from "react";
import type { AdminOrder } from "./admin-orders.types";
import { useBusinessSettings } from "../../../hooks/useBusinessSettings";

const ALERT_INTERVAL = 10000;
const SOUND_KEY = "velasquez_orders_sound_enabled";

export function useOrderAlerts(orders: AdminOrder[]) {
  const { settings } = useBusinessSettings();
  const [soundEnabled, setSoundEnabled] = React.useState(() => {
    return localStorage.getItem(SOUND_KEY) === "true";
  });

  const previousOrderIds = React.useRef<string[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const audio = new Audio();

    audio.src = `/sounds/new-order.mp3?v=${Date.now()}`;
    audio.preload = "auto";
    audio.volume = 1;

    audio.load();

    audioRef.current = audio;
  }, []);

  const playSound = React.useCallback(() => {
    const audio = audioRef.current;
    if (
      !audio ||
      !soundEnabled ||
      !settings.sound_enabled ||
      !settings.order_alert_sound_enabled
    ) {
      return;
    }

    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.error("Audio blocked:", err);

      audio.load();

      setTimeout(() => {
        audio.play().catch(console.error);
      }, 250);
    });
  }, [
    soundEnabled,
    settings.sound_enabled,
    settings.order_alert_sound_enabled,
  ]);

  const enableSound = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      localStorage.setItem(SOUND_KEY, "true");
      setSoundEnabled(true);

      const hasPendingOrders = orders.some(
        (order) => order.status === "received",
      );

      if (hasPendingOrders) {
        window.setTimeout(() => {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        }, 300);
      }
    } catch (err) {
      console.error("No se pudo activar el sonido:", err);
    }
  }, [orders, settings.sound_enabled, settings.order_alert_sound_enabled]);

  const disableSound = React.useCallback(() => {
    localStorage.setItem(SOUND_KEY, "false");
    setSoundEnabled(false);

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  React.useEffect(() => {
    const pendingOrders = orders.filter((order) => order.status === "received");
    const currentIds = pendingOrders.map((order) => order.id);

    const hasNewOrder = currentIds.some(
      (id) => !previousOrderIds.current.includes(id),
    );

    if (hasNewOrder) {
      playSound();
    }

    previousOrderIds.current = currentIds;
  }, [orders, playSound]);

  React.useEffect(() => {
    if (
      !soundEnabled ||
      !settings.sound_enabled ||
      !settings.order_alert_sound_enabled
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const hasPendingOrders = orders.some(
        (order) => order.status === "received",
      );

      if (hasPendingOrders) {
        playSound();
      }
    }, ALERT_INTERVAL);

    return () => window.clearInterval(interval);
  }, [
    orders,
    soundEnabled,
    settings.sound_enabled,
    settings.order_alert_sound_enabled,
    playSound,
  ]);

  return {
    soundEnabled,
    enableSound,
    disableSound,
  };
}
