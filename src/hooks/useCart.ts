// 📍 Ruta: src/hooks/useCart.ts

import { useMemo, useState } from "react";
import type { CartItem } from "../features/cart/cart.types";

function createCartItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    cartItemId: item.cartItemId ?? createCartItemId(),
    basePrice: item.basePrice ?? item.price,
    notes: item.notes ?? "",
    selectedProtein: item.selectedProtein ?? null,
  };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: Omit<CartItem, "quantity" | "cartItemId">) {
    setItems((currentItems) => {
      const basePrice = item.basePrice ?? item.price;

      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          !cartItem.notes &&
          !cartItem.selectedProtein &&
          Number(cartItem.price) === Number(item.price)
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.cartItemId === existingItem.cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          cartItemId: createCartItemId(),
          basePrice,
          notes: item.notes ?? "",
          selectedProtein: item.selectedProtein ?? null,
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId)
    );
  }

  function increaseItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function updateItemNotes(
    cartItemId: string,
    notes: string,
    price?: number,
    selectedProtein?: CartItem["selectedProtein"],
    fallbackItem?: CartItem
  ) {
    setItems((currentItems) => {
      const exists = currentItems.some((item) => item.cartItemId === cartItemId);

      if (!exists && fallbackItem) {
        return [
          ...currentItems,
          normalizeItem({
            ...fallbackItem,
            cartItemId,
            notes,
            price: price ?? fallbackItem.price,
            selectedProtein: selectedProtein ?? fallbackItem.selectedProtein ?? null,
            quantity: 1,
          }),
        ];
      }

      return currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              notes,
              price: price ?? item.price,
              selectedProtein: selectedProtein ?? null,
            }
          : item
      );
    });
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return {
    items,
    subtotal,
    totalItems,
    addItem,
    removeItem,
    increaseItem,
    decreaseItem,
    updateItemNotes,
    clearCart,
  };
}