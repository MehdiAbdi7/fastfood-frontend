"use client";

import { useState } from "react";
import type { CreateOrderItemPayload } from "@/types/order";
import type { MenuItemVariant } from "@/types/menuItem";

export interface CartExtra {
  extraId: string;
  name: string;
  price: number; // résolu à la sélection, pour l'affichage uniquement
}

export interface CartLine {
  key: string;
  menuItemId: string;
  name: string;
  imageUrl?: string;
  variant: MenuItemVariant;
  extras: CartExtra[];
  excludedIngredients: string[];
  quantity: number;
}

export type NewCartLine = Omit<CartLine, "key">;

// Deux lignes ne fusionnent que si TOUT est identique : même produit, même
// variante, mêmes extras, mêmes retraits. Sinon "1x burger sans oignons" et
// "1x burger avec cheddar" deviendraient une seule ligne à 2, et la cuisine
// recevrait une commande fausse.
function buildKey(line: NewCartLine): string {
  const extras = line.extras
    .map((extra) => extra.extraId)
    .sort()
    .join(",");

  const excluded = [...line.excludedIngredients].sort().join(",");

  return `${line.menuItemId}|${JSON.stringify(
    line.variant.combination ?? {},
  )}|${extras}|${excluded}`;
}

// Prix d'une unité, extras compris — sert au total affiché pendant la saisie.
export function getLineUnitPrice(
  line: Pick<CartLine, "variant" | "extras">,
): number {
  const extrasTotal = line.extras.reduce((sum, extra) => sum + extra.price, 0);

  return line.variant.price + extrasTotal;
}

export function useItemCart() {
  const [cart, setCart] = useState<CartLine[]>([]);

  function addLine(newLine: NewCartLine) {
    const key = buildKey(newLine);

    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);

      if (existing) {
        return prev.map((line) =>
          line.key === key
            ? {
                ...line,
                quantity: line.quantity + newLine.quantity,
              }
            : line,
        );
      }

      return [...prev, { ...newLine, key }];
    });
  }

  function addToCart(newLine: NewCartLine) {
    addLine(newLine);
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }

  // Ajustement direct de la quantité (+/- dans le panier) — un quantity <= 0
  // retire la ligne, plutôt que de laisser un panier avec une ligne à 0.
  function setQuantity(key: string, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.key !== key);
      }

      return prev.map((line) =>
        line.key === key ? { ...line, quantity } : line,
      );
    });
  }

  function clearCart() {
    setCart([]);
  }

  function toPayload(): CreateOrderItemPayload[] {
    return cart.map((line) => ({
      menuItemId: line.menuItemId,

      // Le backend attend un objet pour matcher la variante
      // et résoudre le prix.
      variantSelected: line.variant.combination ?? {},

      // Le backend ne veut que les IDs :
      // il résout nom et prix lui-même.
      selectedExtras: line.extras.map((extra) => ({
        extraId: extra.extraId,
      })),

      excludedIngredients: line.excludedIngredients,
      quantity: line.quantity,
      isKidsMenu: false,
    }));
  }

  const itemsCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const total = cart.reduce(
    (sum, line) => sum + getLineUnitPrice(line) * line.quantity,
    0,
  );

  return {
    cart,
    addLine,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    toPayload,
    itemsCount,
    total,
  };
}
