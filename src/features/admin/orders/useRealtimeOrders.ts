// 📍 Ruta: src/features/admin/orders/useRealtimeOrders.ts

import React from "react";
import { supabase } from "../../../lib/supabase";
import type { AdminOrder, OrderStatus } from "./admin-orders.types";
import { getAdminOrders, updateOrderStatus } from "./admin-orders.service";

const ORDERS_REFRESH_EVENT = "vft-orders-refresh";
const ORDERS_BROADCAST_CHANNEL = "vft-orders-channel";
const ORDERS_POLL_INTERVAL_MS = 5000;

function notifyOtherTabs() {
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(ORDERS_BROADCAST_CHANNEL);
      channel.postMessage({ type: ORDERS_REFRESH_EVENT, at: Date.now() });
      channel.close();
    }
  } catch (error) {
    console.warn("No se pudo enviar BroadcastChannel de órdenes:", error);
  }

  try {
    localStorage.setItem(ORDERS_REFRESH_EVENT, String(Date.now()));
  } catch (error) {
    console.warn("No se pudo enviar storage event de órdenes:", error);
  }

  window.dispatchEvent(new CustomEvent(ORDERS_REFRESH_EVENT));
}

export function requestOrdersRefresh() {
  notifyOtherTabs();
}

export function useRealtimeOrders() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isLoadingRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  const loadOrders = React.useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setError(null);
      const data = await getAdminOrders();

      if (!mountedRef.current) return;
      setOrders(data);
    } catch (err) {
      console.error("Error refrescando órdenes:", err);
      if (!mountedRef.current) return;
      setError("No se pudieron cargar las órdenes.");
    } finally {
      isLoadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    loadOrders();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          loadOrders();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          loadOrders();
        }
      });

    const pollingId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    }, ORDERS_POLL_INTERVAL_MS);

    const handleLocalRefresh = () => {
      loadOrders();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    };

    window.addEventListener(ORDERS_REFRESH_EVENT, handleLocalRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    let broadcastChannel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        broadcastChannel = new BroadcastChannel(ORDERS_BROADCAST_CHANNEL);
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === ORDERS_REFRESH_EVENT) {
            loadOrders();
          }
        };
      } catch (error) {
        console.warn("No se pudo abrir BroadcastChannel de órdenes:", error);
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_REFRESH_EVENT) {
        loadOrders();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      mountedRef.current = false;
      window.clearInterval(pollingId);
      window.removeEventListener(ORDERS_REFRESH_EVENT, handleLocalRefresh);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      broadcastChannel?.close();
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    await loadOrders();
    notifyOtherTabs();
  };

  const reload = React.useCallback(async () => {
    await loadOrders();
    notifyOtherTabs();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    reload,
    changeStatus,
  };
}
