import type { MenuExtra } from "@/types/menuItem";

// Miroir de resolveOrderItemsPricing côté backend, uniquement pour AFFICHER
// un total juste pendant la saisie. Le backend recalcule tout à la création.
//
// `effectiveSize` vient de resolveEffectiveSize() : c'est la taille du variant
// choisi, ou celle imposée par la formule (un Menu Kids compte comme un M).
export function resolveExtraPrice(
  extra: MenuExtra,
  effectiveSize: string | undefined,
): number {
  if (extra.priceType === "fixed") return extra.price ?? 0;
  if (effectiveSize === "M" || effectiveSize === "L") {
    return extra.pricesBySize?.[effectiveSize] ?? 0;
  }
  return 0;
}

export function isExtraSelectable(
  extra: MenuExtra,
  effectiveSize: string | undefined,
): boolean {
  if (extra.available === false) return false;
  if (extra.priceType === "fixed") return true;
  return effectiveSize === "M" || effectiveSize === "L";
}

export function getExtraTypeName(extra: MenuExtra): string {
  return typeof extra.type === "object" ? extra.type.name : "Suppléments";
}
