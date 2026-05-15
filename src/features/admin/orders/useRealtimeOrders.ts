// 📍 Ruta: src/features/admin/orders/useRealtimeOrders.ts

import React from "react";
import { supabase } from "../../../lib/supabase";
import type { AdminOrder, OrderStatus } from "./admin-orders.types";
import { getAdminOrders, updateOrderStatus } from "./admin-orders.service";

export function useRealtimeOrders() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrders = React.useCallback(async () => {
    try {
      setError(null);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
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
        }
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    await loadOrders();
  };

  return {
    orders,
    loading,
    error,
    reload: loadOrders,
    changeStatus,
  };
}