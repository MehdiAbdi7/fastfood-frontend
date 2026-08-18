"use client";

import { useState } from "react";
import type { CreateOrderItemPayload } from "@/types/order";
import type { MenuItemVariant } from "@/types/menuItem";
import type { FormulaPricingMode } from "@/config/formulas";

export interface CartExtra {
  extraId: string;
  name: string;
  price: number; // résolu à la sélection, pour l'affichage uniquement
}

export interface CartFormula {
  formulaId: string;
  name: string;
  price: number;
  pricingMode: FormulaPricingMode;
  includes: string[]; // affichage ticket (inclus + choix résolus)
  choices: Record<string, string>; // renvoyé au backend pour revalidation
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
  formula?: CartFormula;
}

export type NewCartLine = Omit<CartLine, "key">;

// Une formule "fixed" sert le produit en format unique : la variante choisie
// n'a plus de sens et ne doit pas partir au backend, qui la rejetterait.
function isFixedFormula(line: Pick<CartLine, "formula">): boolean {
  return line.formula?.pricingMode === "fixed";
}

// Deux lignes ne fusionnent que si TOUT est identique : même produit, même
// variante, mêmes extras, mêmes retraits, même formule. Sinon "1x burger
// simple" et "1x burger en menu" deviendraient une seule ligne à 2, et la
// cuisine recevrait une commande fausse.
function buildKey(line: NewCartLine): string {
  const extras = line.extras
    .map((extra) => extra.extraId)
    .sort()
    .join(",");

  const excluded = [...line.excludedIngredients].sort().join(",");

  const formula = line.formula
    ? `${line.formula.formulaId}:${JSON.stringify(line.formula.choices)}`
    : "";

  return `${line.menuItemId}|${JSON.stringify(
    line.variant.combination ?? {},
  )}|${extras}|${excluded}|${formula}`;
}

// Prix d'une unité, formule et extras compris.
export function getLineUnitPrice(
  line: Pick<CartLine, "variant" | "extras" | "formula">,
): number {
  const extrasTotal = line.extras.reduce((sum, extra) => sum + extra.price, 0);

  if (line.formula?.pricingMode === "fixed") {
    return line.formula.price + extrasTotal;
  }

  const supplement = line.formula?.price ?? 0;
  return line.variant.price + supplement + extrasTotal;
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
            ? { ...line, quantity: line.quantity + newLine.quantity }
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

      variantSelected: isFixedFormula(line)
        ? {}
        : (line.variant.combination ?? {}),

      // Le backend ne veut que les IDs : il résout nom et prix lui-même.
      selectedExtras: line.extras.map((extra) => ({
        extraId: extra.extraId,
      })),

      excludedIngredients: line.excludedIngredients,
      quantity: line.quantity,

      ...(line.formula
        ? {
            formula: {
              formulaId: line.formula.formulaId,
              choices: line.formula.choices,
            },
          }
        : {}),
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
