// 📍 Ruta: src/features/admin/orders/useOrderAlerts.ts

import React from "react";
import type { AdminOrder } from "./admin-orders.types";

const ALERT_INTERVAL = 20000;

export function useOrderAlerts(orders: AdminOrder[]) {
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const previousOrderIds = React.useRef<string[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.volume = 1;
    audioRef.current = audio;
  }, []);

  const playSound = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.error("Audio blocked:", err);
    });
  }, []);

  React.useEffect(() => {
    const pendingOrders = orders.filter((order) => order.status === "received");
    const currentIds = pendingOrders.map((order) => order.id);

    const hasNewOrder = currentIds.some(
      (id) => !previousOrderIds.current.includes(id)
    );

    if (soundEnabled && hasNewOrder) {
      playSound();
    }

    previousOrderIds.current = currentIds;
  }, [orders, soundEnabled, playSound]);

  React.useEffect(() => {
    if (!soundEnabled) return;

    const interval = window.setInterval(() => {
      const hasPendingOrders = orders.some(
        (order) => order.status === "received"
      );

      if (hasPendingOrders) {
        playSound();
      }
    }, ALERT_INTERVAL);

    return () => window.clearInterval(interval);
  }, [orders, soundEnabled, playSound]);

  const enableSound = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;

      setSoundEnabled(true);

      const hasPendingOrders = orders.some(
        (order) => order.status === "received"
      );

      if (hasPendingOrders) {
        window.setTimeout(() => {
          playSound();
        }, 300);
      }
    } catch (err) {
      console.error("No se pudo activar el sonido:", err);
    }
  }, [orders, playSound]);

  return {
    soundEnabled,
    enableSound,
  };
}
