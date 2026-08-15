import type { MenuExtra } from "@/types/menuItem";

// Miroir de la logique de resolveOrderItemsPricing côté backend, uniquement
// pour AFFICHER un total juste pendant la saisie. Le backend reste seul maître
// du prix réel : il recalcule tout à la création, en ignorant ce que le client
// envoie (voir utils/pricing.ts).
export function resolveExtraPrice(
  extra: MenuExtra,
  variantSelected: Record<string, string>,
): number {
  if (extra.priceType === "fixed") return extra.price ?? 0;

  // bySize : le prix dépend de la taille choisie sur le produit lui-même
  const size = variantSelected?.taille;
  if (size === "M" || size === "L") return extra.pricesBySize?.[size] ?? 0;

  return 0;
}

// Un extra "bySize" n'a de prix que si le produit a une taille M ou L : sur un
// produit sans taille, on le masque plutôt que de l'afficher à 0 DA.
export function isExtraSelectable(
  extra: MenuExtra,
  variantSelected: Record<string, string>,
): boolean {
  if (extra.available === false) return false;
  if (extra.priceType === "fixed") return true;

  const size = variantSelected?.taille;
  return size === "M" || size === "L";
}

export function getExtraTypeName(extra: MenuExtra): string {
  return typeof extra.type === "object" ? extra.type.name : "Suppléments";
}
