export function formatVariantLabel(
  combination: Record<string, string> | null | undefined,
): string {
  // Défensif : certaines commandes en base (tests Postman antérieurs au
  // dashboard, données saisies hors flux normal) peuvent avoir ce champ à
  // null/undefined malgré le default:{} du schéma Mongoose, qui ne s'applique
  // qu'à la création — jamais de plantage sur de la donnée existante imparfaite.
  if (!combination) return "Standard";
  const entries = Object.entries(combination);
  if (entries.length === 0) return "Standard";
  return entries.map(([, value]) => value).join(" · ");
}
